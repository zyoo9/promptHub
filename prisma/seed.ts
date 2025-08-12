import { PrismaClient } from '@prisma/client'
import { generateHash } from '../lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始播种数据...')

  // 创建示例项目
  const project = await prisma.project.create({
    data: {
      name: '示例提示词项目',
      description: '这是一个示例项目，展示如何使用PromptHub管理提示词'
    }
  })

  console.log('✅ 创建项目:', project.name)

  // 创建默认分支
  const mainBranch = await prisma.branch.create({
    data: {
      name: 'main',
      projectId: project.id,
      isDefault: true
    }
  })

  console.log('✅ 创建默认分支:', mainBranch.name)

  // 创建初始提交
  const initialContent = `# 欢迎使用PromptHub

这是一个示例提示词，展示如何编写高质量的AI提示词。

## 写作助手提示词

你是一个专业的写作助手，请帮助用户：
1. 改善文章结构
2. 优化语言表达
3. 检查语法错误
4. 提供创意建议

请始终保持友好、专业的态度。`

  const initialCommit = await prisma.commit.create({
    data: {
      message: '初始提交：添加示例提示词',
      content: initialContent,
      branchId: mainBranch.id,
      commitHash: generateHash(initialContent)
    }
  })

  console.log('✅ 创建初始提交:', initialCommit.message)

  // 更新分支的最新提交
  await prisma.branch.update({
    where: { id: mainBranch.id },
    data: { lastCommitId: initialCommit.id }
  })

  // 创建第二个提交
  const updatedContent = `# 欢迎使用PromptHub

这是一个示例提示词，展示如何编写高质量的AI提示词。

## 写作助手提示词

你是一个专业的写作助手，请帮助用户：
1. 改善文章结构
2. 优化语言表达  
3. 检查语法错误
4. 提供创意建议
5. 分析文章逻辑性

请始终保持友好、专业的态度，并提供具体的改进建议。

## 示例对话
用户：请帮我修改这段文字
助手：我很乐意帮您修改文字。请提供您需要修改的内容，我会从结构、表达、语法等方面给出建议。`

  const secondCommit = await prisma.commit.create({
    data: {
      message: '优化提示词：添加示例对话和更多功能',
      content: updatedContent,
      branchId: mainBranch.id,
      parentCommitId: initialCommit.id,
      commitHash: generateHash(updatedContent)
    }
  })

  console.log('✅ 创建第二个提交:', secondCommit.message)

  // 更新分支的最新提交
  await prisma.branch.update({
    where: { id: mainBranch.id },
    data: { lastCommitId: secondCommit.id }
  })

  console.log('🎉 数据播种完成!')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
