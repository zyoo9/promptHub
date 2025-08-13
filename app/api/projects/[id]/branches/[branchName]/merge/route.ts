import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { detectConflicts, hasUnresolvedConflicts } from '@/lib/merge-utils'

// 简化的错误处理函数
function handleApiError(error: any, message: string) {
  console.error(message, error)
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

// 分支合并
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string } }
) {
  try {
    const { targetBranch, mergeMessage, resolvedContent } = await request.json()
    const projectId = params.id
    const sourceBranchName = decodeURIComponent(params.branchName)

    // 验证输入
    if (!targetBranch) {
      return NextResponse.json(
        { error: '目标分支不能为空' },
        { status: 400 }
      )
    }

    if (!mergeMessage) {
      return NextResponse.json(
        { error: '合并信息不能为空' },
        { status: 400 }
      )
    }

    // 获取源分支和目标分支
    const [sourceBranch, targetBranchObj] = await Promise.all([
      prisma.branch.findFirst({
        where: {
          projectId,
          name: sourceBranchName
        },
        include: {
          lastCommit: true,
          _count: {
            select: { commits: true }
          }
        }
      }),
      prisma.branch.findFirst({
        where: {
          projectId,
          name: targetBranch
        },
        include: {
          lastCommit: true
        }
      })
    ])

    if (!sourceBranch) {
      return NextResponse.json(
        { error: '源分支不存在' },
        { status: 404 }
      )
    }

    if (!targetBranchObj) {
      return NextResponse.json(
        { error: '目标分支不存在' },
        { status: 404 }
      )
    }

    if (!sourceBranch.lastCommit) {
      return NextResponse.json(
        { error: '源分支没有提交，无法合并' },
        { status: 400 }
      )
    }

    // 获取三个版本的内容进行三路合并
    const sourceContent = sourceBranch.lastCommit.content
    const targetContent = targetBranchObj.lastCommit?.content || ''
    
    // 尝试找到共同祖先 (简化版本 - 使用目标分支的前一个commit作为base)
    let baseContent = ''
    if (targetBranchObj.lastCommit?.parentCommitId) {
      const baseCommit = await prisma.commit.findUnique({
        where: { id: targetBranchObj.lastCommit.parentCommitId }
      })
      baseContent = baseCommit?.content || ''
    }

    let finalContent: string

    // 如果提供了解决后的内容，直接使用
    if (resolvedContent) {
      // 检查是否还有未解决的冲突标记
      if (hasUnresolvedConflicts(resolvedContent)) {
        return NextResponse.json(
          { error: '合并内容中仍包含未解决的冲突标记' },
          { status: 400 }
        )
      }
      finalContent = resolvedContent
    } else {
      // 执行自动合并和冲突检测
      const mergeResult = detectConflicts(baseContent, targetContent, sourceContent)
      
      if (mergeResult.hasConflicts) {
        // 返回冲突信息，要求用户解决
        return NextResponse.json({
          hasConflicts: true,
          mergeResult,
          message: '发现合并冲突，请解决后重新提交'
        }, { status: 409 }) // 409 Conflict
      }
      
      finalContent = mergeResult.mergedContent
    }

    // 生成合并提交
    const mergeCommitHash = createHash('sha256')
      .update(`${finalContent}${Date.now()}`)
      .digest('hex')

    // 创建合并提交
    const mergeCommit = await prisma.commit.create({
      data: {
        message: mergeMessage,
        content: finalContent,
        branchId: targetBranchObj.id,
        parentCommitId: targetBranchObj.lastCommitId,
        commitHash: mergeCommitHash
      }
    })

    // 更新目标分支的最新提交
    await prisma.branch.update({
      where: { id: targetBranchObj.id },
      data: { lastCommitId: mergeCommit.id }
    })

    // 获取合并后的分支信息
    const updatedBranch = await prisma.branch.findUnique({
      where: { id: targetBranchObj.id },
      include: {
        lastCommit: true,
        project: true,
        _count: {
          select: { commits: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `成功将 ${sourceBranchName} 合并到 ${targetBranch}`,
      mergeCommit,
      targetBranch: updatedBranch,
      changes: {
        addedCommits: 1,
        sourceCommitCount: sourceBranch._count.commits,
        hasConflicts: false // 简化版本暂不检测冲突
      }
    })

  } catch (error) {
    return handleApiError(error, '分支合并失败')
  }
}

// 检查合并可行性
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; branchName: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const targetBranch = searchParams.get('target')
    
    if (!targetBranch) {
      return NextResponse.json(
        { error: '请指定目标分支' },
        { status: 400 }
      )
    }

    const projectId = params.id
    const sourceBranchName = decodeURIComponent(params.branchName)

    // 获取源分支和目标分支
    const [sourceBranch, targetBranchObj] = await Promise.all([
      prisma.branch.findFirst({
        where: {
          projectId,
          name: sourceBranchName
        },
        include: {
          lastCommit: true,
          _count: {
            select: { commits: true }
          }
        }
      }),
      prisma.branch.findFirst({
        where: {
          projectId,
          name: targetBranch
        },
        include: {
          lastCommit: true,
          _count: {
            select: { commits: true }
          }
        }
      })
    ])

    if (!sourceBranch || !targetBranchObj) {
      return NextResponse.json(
        { error: '分支不存在' },
        { status: 404 }
      )
    }

    // 检查合并可行性
    const canMerge = !!(sourceBranch.lastCommit && sourceBranch.name !== targetBranchObj.name)
    const sourceContent = sourceBranch.lastCommit?.content || ''
    const targetContent = targetBranchObj.lastCommit?.content || ''
    
    // 获取共同祖先进行三路合并分析
    let baseContent = ''
    if (targetBranchObj.lastCommit?.parentCommitId) {
      const baseCommit = await prisma.commit.findUnique({
        where: { id: targetBranchObj.lastCommit.parentCommitId }
      })
      baseContent = baseCommit?.content || ''
    }

    // 执行冲突检测
    const mergeResult = detectConflicts(baseContent, targetContent, sourceContent)
    const commitsBehind = targetBranchObj._count.commits
    const commitsAhead = sourceBranch._count.commits

    return NextResponse.json({
      canMerge,
      hasConflicts: mergeResult.hasConflicts,
      mergeResult,
      analysis: {
        sourceBranch: sourceBranchName,
        targetBranch: targetBranch,
        commitsAhead,
        commitsBehind,
        sourceLastCommit: sourceBranch.lastCommit,
        targetLastCommit: targetBranchObj.lastCommit,
        baseContent,
        recommendations: canMerge 
          ? mergeResult.hasConflicts 
            ? ['存在合并冲突', '需要手动解决冲突', '建议先备份当前工作']
            : ['可以安全合并', '无冲突检测'] 
          : ['源分支没有新的提交', '请先在源分支进行一些更改']
      }
    })

  } catch (error) {
    return handleApiError(error, '检查合并可行性失败')
  }
}
