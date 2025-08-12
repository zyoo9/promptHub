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
        lastCommit: true
      }
    });

    if (!branch) {
      return NextResponse.json(
        { error: '分支不存在' },
        { status: 404 }
      );
    }

    if (!branch.lastCommit) {
      return NextResponse.json(
        { error: '分支没有任何提交' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      content: branch.lastCommit.content,
      commitId: branch.lastCommit.id,
      message: branch.lastCommit.message,
      createdAt: branch.lastCommit.createdAt
    });
  } catch (error) {
    console.error('获取分支内容失败:', error);
    return NextResponse.json(
      { error: '获取分支内容失败' },
      { status: 500 }
    );
  }
}
