import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string; commitId: string } }
) {
  try {
    // 验证分支是否存在
    const branch = await prisma.branch.findFirst({
      where: {
        projectId: params.id,
        name: decodeURIComponent(params.branchName)
      }
    });

    if (!branch) {
      return NextResponse.json(
        { error: '分支不存在' },
        { status: 404 }
      );
    }

    // 获取提交详情
    const commit = await prisma.commit.findUnique({
      where: { id: params.commitId },
      include: {
        parentCommit: {
          select: {
            id: true,
            message: true,
            createdAt: true
          }
        },
        childCommits: {
          select: {
            id: true,
            message: true,
            createdAt: true
          }
        }
      }
    });

    if (!commit || commit.branchId !== branch.id) {
      return NextResponse.json(
        { error: '提交不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(commit);
  } catch (error) {
    console.error('获取提交详情失败:', error);
    return NextResponse.json(
      { error: '获取提交详情失败' },
      { status: 500 }
    );
  }
}
