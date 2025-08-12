import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string } }
) {
  try {
    const branch = await prisma.branch.findFirst({
      where: {
        projectId: params.id,
        name: decodeURIComponent(params.branchName)
      },
      include: {
        project: true,
        lastCommit: true,
        createdFromCommit: true,
        _count: {
          select: { commits: true }
        }
      }
    });

    if (!branch) {
      return NextResponse.json(
        { error: '分支不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error('获取分支详情失败:', error);
    return NextResponse.json(
      { error: '获取分支详情失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string } }
) {
  try {
    const branchName = decodeURIComponent(params.branchName);

    // 查找分支
    const branch = await prisma.branch.findFirst({
      where: {
        projectId: params.id,
        name: branchName
      }
    });

    if (!branch) {
      return NextResponse.json(
        { error: '分支不存在' },
        { status: 404 }
      );
    }

    // 检查是否为默认分支
    if (branch.isDefault) {
      return NextResponse.json(
        { error: '不能删除默认分支' },
        { status: 400 }
      );
    }

    // 检查项目是否只有一个分支
    const branchCount = await prisma.branch.count({
      where: { projectId: params.id }
    });

    if (branchCount <= 1) {
      return NextResponse.json(
        { error: '项目至少需要保留一个分支' },
        { status: 400 }
      );
    }

    // 删除分支（会级联删除该分支的所有提交）
    await prisma.branch.delete({
      where: { id: branch.id }
    });

    return NextResponse.json({ message: '分支删除成功' });
  } catch (error) {
    console.error('删除分支失败:', error);
    return NextResponse.json(
      { error: '删除分支失败' },
      { status: 500 }
    );
  }
}
