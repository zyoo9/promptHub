import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateHash } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

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

    // 获取提交历史
    const commits = await prisma.commit.findMany({
      where: { branchId: branch.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // 获取总数
    const total = await prisma.commit.count({
      where: { branchId: branch.id }
    });

    return NextResponse.json({
      commits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取提交历史失败:', error);
    return NextResponse.json(
      { error: '获取提交历史失败' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string } }
) {
  try {
    const body = await request.json();
    const { message, content } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: '提交信息不能为空' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '提交内容不能为空' },
        { status: 400 }
      );
    }

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

    // 使用事务创建提交并更新分支
    const result = await prisma.$transaction(async (tx) => {
      // 创建新提交
      const commit = await tx.commit.create({
        data: {
          message: message.trim(),
          content: content.trim(),
          branchId: branch.id,
          parentCommitId: branch.lastCommitId,
          commitHash: generateHash(content.trim())
        }
      });

      // 更新分支的最新提交
      await tx.branch.update({
        where: { id: branch.id },
        data: { lastCommitId: commit.id }
      });

      return commit;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('创建提交失败:', error);
    return NextResponse.json(
      { error: '创建提交失败' },
      { status: 500 }
    );
  }
}
