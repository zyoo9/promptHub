import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateHash } from '@/lib/utils';

export async function POST(
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

    // 获取目标提交
    const targetCommit = await prisma.commit.findUnique({
      where: { id: params.commitId }
    });

    if (!targetCommit || targetCommit.branchId !== branch.id) {
      return NextResponse.json(
        { error: '目标提交不存在' },
        { status: 404 }
      );
    }

    // 使用事务创建回滚提交并更新分支
    const result = await prisma.$transaction(async (tx) => {
      // 创建回滚提交
      const revertCommit = await tx.commit.create({
        data: {
          message: `回滚到: ${targetCommit.message}`,
          content: targetCommit.content,
          branchId: branch.id,
          parentCommitId: branch.lastCommitId,
          commitHash: generateHash(targetCommit.content + Date.now()) // 添加时间戳确保唯一性
        }
      });

      // 更新分支的最新提交
      await tx.branch.update({
        where: { id: branch.id },
        data: { lastCommitId: revertCommit.id }
      });

      return revertCommit;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('回滚提交失败:', error);
    return NextResponse.json(
      { error: '回滚提交失败' },
      { status: 500 }
    );
  }
}
