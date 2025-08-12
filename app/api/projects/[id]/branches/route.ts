import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: params.id }
    });

    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }

    const branches = await prisma.branch.findMany({
      where: { projectId: params.id },
      include: {
        lastCommit: true,
        createdFromCommit: true,
        _count: {
          select: { commits: true }
        }
      },
      orderBy: [
        { isDefault: 'desc' }, // 默认分支排在前面
        { updatedAt: 'desc' }   // 按更新时间排序
      ]
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error('获取分支列表失败:', error);
    return NextResponse.json(
      { error: '获取分支列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, sourceCommitId } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: '分支名称不能为空' },
        { status: 400 }
      );
    }

    // 验证项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: params.id }
    });

    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }

    // 检查分支名称是否已存在
    const existingBranch = await prisma.branch.findFirst({
      where: {
        projectId: params.id,
        name: name.trim()
      }
    });

    if (existingBranch) {
      return NextResponse.json(
        { error: '分支名称已存在' },
        { status: 400 }
      );
    }

    // 确定源提交ID
    let sourceCommit;
    if (sourceCommitId) {
      // 验证指定的提交是否存在
      sourceCommit = await prisma.commit.findUnique({
        where: { id: sourceCommitId }
      });
      
      if (!sourceCommit) {
        return NextResponse.json(
          { error: '指定的源提交不存在' },
          { status: 400 }
        );
      }
    } else {
      // 使用默认分支的最新提交
      const defaultBranch = await prisma.branch.findFirst({
        where: {
          projectId: params.id,
          isDefault: true
        },
        include: { lastCommit: true }
      });

      if (!defaultBranch || !defaultBranch.lastCommit) {
        return NextResponse.json(
          { error: '找不到默认分支或默认分支没有提交' },
          { status: 400 }
        );
      }

      sourceCommit = defaultBranch.lastCommit;
    }

    // 创建新分支
    const newBranch = await prisma.branch.create({
      data: {
        name: name.trim(),
        projectId: params.id,
        isDefault: false,
        lastCommitId: sourceCommit.id,
        createdFromCommitId: sourceCommit.id
      },
      include: {
        lastCommit: true,
        createdFromCommit: true,
        _count: {
          select: { commits: true }
        }
      }
    });

    return NextResponse.json(newBranch, { status: 201 });
  } catch (error) {
    console.error('创建分支失败:', error);
    return NextResponse.json(
      { error: '创建分支失败' },
      { status: 500 }
    );
  }
}
