'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Copy, 
  Star, 
  Zap, 
  MessageSquare, 
  Code, 
  Briefcase, 
  Palette,
  BookOpen,
  Coffee,
  Lightbulb
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Template {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  content: string
  popularity: number
  icon: React.ReactNode
}

const templates: Template[] = [
  {
    id: 'content-writer',
    title: '内容创作助手',
    description: '帮助生成高质量的文章、博客和营销内容',
    category: '内容创作',
    tags: ['写作', '营销', '博客'],
    popularity: 95,
    icon: <MessageSquare className="h-5 w-5" />,
    content: `你是一个专业的内容创作专家。请帮我创作关于 {主题} 的内容。

要求：
- 目标受众：{目标受众}
- 内容类型：{内容类型}（如：博客文章、社交媒体帖子、邮件营销等）
- 语气风格：{语气风格}（如：专业、轻松、幽默等）
- 字数要求：{字数要求}

请确保内容：
1. 具有吸引力的标题
2. 清晰的结构和逻辑
3. 包含实用的价值
4. 适合目标受众
5. 有明确的行动呼吁（如适用）

开始创作：`
  },
  {
    id: 'code-assistant',
    title: '代码编程助手',
    description: '协助编程、代码审查和技术问题解决',
    category: '编程开发',
    tags: ['编程', '代码', '调试'],
    popularity: 90,
    icon: <Code className="h-5 w-5" />,
    content: `你是一个资深的软件工程师。请帮我解决以下编程问题：

问题描述：{问题描述}
编程语言：{编程语言}
技术栈：{技术栈}

请提供：
1. 问题分析
2. 解决方案（包含完整代码）
3. 代码解释
4. 最佳实践建议
5. 可能的优化方向

如果需要，请提供多种解决方案供我选择。`
  },
  {
    id: 'business-analyst',
    title: '商业分析师',
    description: '提供商业策略分析和市场洞察',
    category: '商业策略',
    tags: ['商业', '分析', '策略'],
    popularity: 85,
    icon: <Briefcase className="h-5 w-5" />,
    content: `你是一个经验丰富的商业分析师。请帮我分析以下商业问题：

分析主题：{分析主题}
行业背景：{行业背景}
具体情况：{具体情况}

请提供：
1. 现状分析
2. 问题识别
3. 市场机会分析
4. 竞争对手分析
5. 可行性建议
6. 风险评估
7. 实施步骤

请用数据和逻辑支撑你的分析结论。`
  },
  {
    id: 'creative-designer',
    title: '创意设计顾问',
    description: '协助设计思考和创意方案制定',
    category: '创意设计',
    tags: ['设计', '创意', '品牌'],
    popularity: 80,
    icon: <Palette className="h-5 w-5" />,
    content: `你是一个富有创意的设计顾问。请帮我设计以下项目：

设计项目：{设计项目}
设计目标：{设计目标}
目标用户：{目标用户}
品牌风格：{品牌风格}
设计约束：{设计约束}

请提供：
1. 设计理念阐述
2. 视觉风格建议
3. 色彩搭配方案
4. 字体选择建议
5. 布局设计思路
6. 用户体验考虑
7. 可执行的设计方案

请确保设计既有创意又实用。`
  },
  {
    id: 'learning-tutor',
    title: '学习导师',
    description: '个性化学习指导和知识解答',
    category: '教育学习',
    tags: ['学习', '教育', '指导'],
    popularity: 88,
    icon: <BookOpen className="h-5 w-5" />,
    content: `你是一个专业的学习导师。请帮我学习以下内容：

学习主题：{学习主题}
当前水平：{当前水平}（如：初学者、中级、高级）
学习目标：{学习目标}
可用时间：{可用时间}

请制定学习计划，包括：
1. 学习路径规划
2. 阶段性目标设定
3. 重点知识点梳理
4. 实践练习建议
5. 学习资源推荐
6. 进度评估方法
7. 常见问题预警

请用适合我水平的方式进行解释。`
  },
  {
    id: 'productivity-coach',
    title: '效率提升教练',
    description: '帮助提高工作效率和时间管理',
    category: '效率提升',
    tags: ['效率', '时间管理', '生产力'],
    popularity: 75,
    icon: <Coffee className="h-5 w-5" />,
    content: `你是一个专业的效率提升教练。请帮我优化以下工作场景：

当前挑战：{当前挑战}
工作性质：{工作性质}
时间限制：{时间限制}
期望目标：{期望目标}

请提供：
1. 现状问题分析
2. 效率提升策略
3. 时间管理技巧
4. 工具和方法推荐
5. 优先级排序建议
6. 习惯养成计划
7. 进度追踪方法

请给出可操作的具体建议。`
  }
]

const categories = ['全部', '内容创作', '编程开发', '商业策略', '创意设计', '教育学习', '效率提升']

interface PromptTemplatesProps {
  onSelectTemplate?: (template: Template) => void
}

export function PromptTemplates({ onSelectTemplate }: PromptTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const filteredTemplates = selectedCategory === '全部' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory)

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content)
    // TODO: 添加成功提示
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '内容创作': return <MessageSquare className="h-4 w-4" />
      case '编程开发': return <Code className="h-4 w-4" />
      case '商业策略': return <Briefcase className="h-4 w-4" />
      case '创意设计': return <Palette className="h-4 w-4" />
      case '教育学习': return <BookOpen className="h-4 w-4" />
      case '效率提升': return <Coffee className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">提示词模板库</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          精选高质量提示词模板，帮你快速开始AI对话，提升工作效率
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={`flex items-center gap-2 ${
              selectedCategory === category ? 'gradient-bg text-white' : ''
            }`}
          >
            {getCategoryIcon(category)}
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <Card 
            key={template.id} 
            className="card-hover bg-card/50 backdrop-blur-sm border-border/50 group"
            style={{animationDelay: `${index * 100}ms`}}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:gradient-text transition-all duration-300">
                      {template.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{template.popularity}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      预览
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {template.icon}
                        {template.title}
                      </DialogTitle>
                      <DialogDescription>
                        {template.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div>
                        <label className="text-sm font-medium">模板内容：</label>
                        <Textarea
                          value={template.content}
                          readOnly
                          className="mt-2 min-h-[300px] font-mono text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCopyTemplate(template)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          复制模板
                        </Button>
                        {onSelectTemplate && (
                          <Button
                            variant="outline"
                            onClick={() => onSelectTemplate(template)}
                            className="flex items-center gap-2"
                          >
                            <Zap className="h-4 w-4" />
                            使用模板
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCopyTemplate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">暂无模板</h3>
          <p className="text-muted-foreground">
            该分类下暂时没有模板，敬请期待更多内容
          </p>
        </div>
      )}
    </div>
  )
}
