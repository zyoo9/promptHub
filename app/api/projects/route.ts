import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateHash } from '@/lib/utils';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        branches: {
          where: { isDefault: true },
          include: {
            lastCommit: true,
            _count: {
              select: {
                commits: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: '项目名称不能为空' },
        { status: 400 }
      );
    }

    // 检查项目名称是否已存在
    const existingProject = await prisma.project.findUnique({
      where: { name: name.trim() }
    });

    if (existingProject) {
      return NextResponse.json(
        { error: '项目名称已存在' },
        { status: 400 }
      );
    }

    // 使用事务创建项目、分支和初始提交
    const result = await prisma.$transaction(async (tx) => {
      // 创建项目
      const project = await tx.project.create({
        data: { 
          name: name.trim(), 
          description: description?.trim() || null 
        }
      });

      // 创建默认分支
      const defaultBranch = await tx.branch.create({
        data: {
          name: 'main',
          projectId: project.id,
          isDefault: true
        }
      });

      // 创建初始提交
      const initialContent = '// 在这里编写你的提示词\n';
      const initialCommit = await tx.commit.create({
        data: {
          message: '初始提交',
          content: initialContent,
          branchId: defaultBranch.id,
          commitHash: generateHash(initialContent)
        }
      });

      // 更新分支的最新提交
      await tx.branch.update({
        where: { id: defaultBranch.id },
        data: { lastCommitId: initialCommit.id }
      });

      return project;
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('创建项目失败:', error);
    return NextResponse.json(
      { error: '创建项目失败' },
      { status: 500 }
    );
  }
}
