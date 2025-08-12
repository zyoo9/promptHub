import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { diffLines } from 'diff';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string; commitId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const compareCommitId = searchParams.get('compare');

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

    // 获取当前提交
    const currentCommit = await prisma.commit.findUnique({
      where: { id: params.commitId }
    });

    if (!currentCommit || currentCommit.branchId !== branch.id) {
      return NextResponse.json(
        { error: '提交不存在' },
        { status: 404 }
      );
    }

    let compareCommit;
    if (compareCommitId) {
      // 比较指定的提交
      compareCommit = await prisma.commit.findUnique({
        where: { id: compareCommitId }
      });

      if (!compareCommit || compareCommit.branchId !== branch.id) {
        return NextResponse.json(
          { error: '比较的提交不存在' },
          { status: 404 }
        );
      }
    } else {
      // 比较父提交
      if (currentCommit.parentCommitId) {
        compareCommit = await prisma.commit.findUnique({
          where: { id: currentCommit.parentCommitId }
        });
      }
    }

    // 计算差异
    const oldContent = compareCommit ? compareCommit.content : '';
    const newContent = currentCommit.content;
    
    const diff = diffLines(oldContent, newContent);

    return NextResponse.json({
      currentCommit: {
        id: currentCommit.id,
        message: currentCommit.message,
        createdAt: currentCommit.createdAt
      },
      compareCommit: compareCommit ? {
        id: compareCommit.id,
        message: compareCommit.message,
        createdAt: compareCommit.createdAt
      } : null,
      diff,
      stats: {
        additions: diff.filter(part => part.added).reduce((sum, part) => sum + (part.count || 0), 0),
        deletions: diff.filter(part => part.removed).reduce((sum, part) => sum + (part.count || 0), 0)
      }
    });
  } catch (error) {
    console.error('获取差异失败:', error);
    return NextResponse.json(
      { error: '获取差异失败' },
      { status: 500 }
    );
  }
}
