'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Code, 
  Eye, 
  Copy, 
  CheckCircle,
  Download,
  Share2,
  Zap
} from 'lucide-react'

// 动态导入ReactMarkdown以避免SSR问题
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted h-20 rounded"></div>
})

interface EnhancedPreviewProps {
  content: string
  language: string
  className?: string
}

export function EnhancedPreview({ content, language, className }: EnhancedPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('formatted')

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const exportAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '提示词内容',
          text: content,
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      // 降级到复制到剪贴板
      copyToClipboard()
    }
  }

  const getCharacterStats = () => {
    const lines = content.split('\n').length
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length
    const characters = content.length
    const charactersNoSpaces = content.replace(/\s/g, '').length
    
    return { lines, words, characters, charactersNoSpaces }
  }

  const stats = getCharacterStats()

  const renderMarkdownPreview = () => {
    if (language === 'markdown') {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              code: ({ node, inline, className, children, ...props }) => {
                return inline ? (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="bg-muted p-4 rounded-md overflow-auto">
                    <code {...props}>{children}</code>
                  </pre>
                )
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-muted-foreground">
                  {children}
                </blockquote>
              ),
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 text-foreground leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-3 ml-6 list-disc space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-3 ml-6 list-decimal space-y-1">{children}</ol>
              ),
            }}
          >
            {content || '*暂无内容*'}
          </ReactMarkdown>
        </div>
      )
    }

    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
        {content || '// 暂无内容'}
      </pre>
    )
  }

  const analyzePromptStructure = () => {
    const sections = []
    const lines = content.split('\n').filter(line => line.trim())
    
    // 分析标题结构
    const headers = lines.filter(line => line.match(/^#{1,6}\s/))
    if (headers.length > 0) {
      sections.push({
        type: 'headers',
        count: headers.length,
        items: headers.map(h => h.replace(/^#+\s/, ''))
      })
    }

    // 分析列表项
    const listItems = lines.filter(line => line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/))
    if (listItems.length > 0) {
      sections.push({
        type: 'lists',
        count: listItems.length,
        items: listItems.slice(0, 3).map(item => item.replace(/^[-*+\d.]\s*/, ''))
      })
    }

    // 分析代码块
    const codeBlocks = content.match(/```[\s\S]*?```/g) || []
    if (codeBlocks.length > 0) {
      sections.push({
        type: 'code',
        count: codeBlocks.length,
        items: []
      })
    }

    return sections
  }

  const promptStructure = analyzePromptStructure()

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>内容预览</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center space-x-1"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? '已复制' : '复制'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsMarkdown}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareContent}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formatted" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>格式化预览</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>原始文本</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>结构分析</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formatted" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-96">
              {renderMarkdownPreview()}
            </div>
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {content || '// 暂无内容'}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-4">
              {/* 统计信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">{stats.lines}</div>
                  <div className="text-sm text-blue-800">行数</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">{stats.words}</div>
                  <div className="text-sm text-green-800">单词</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-md">
                  <div className="text-2xl font-bold text-purple-600">{stats.characters}</div>
                  <div className="text-sm text-purple-800">字符</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-md">
                  <div className="text-2xl font-bold text-orange-600">{stats.charactersNoSpaces}</div>
                  <div className="text-sm text-orange-800">无空格</div>
                </div>
              </div>

              {/* 结构分析 */}
              {promptStructure.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">内容结构分析</h4>
                  {promptStructure.map((section, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        {section.type === 'headers' && <FileText className="h-4 w-4 text-blue-500" />}
                        {section.type === 'lists' && <div className="h-4 w-4 text-green-500">•</div>}
                        {section.type === 'code' && <Code className="h-4 w-4 text-purple-500" />}
                        <span className="font-medium">
                          {section.type === 'headers' && `${section.count} 个标题`}
                          {section.type === 'lists' && `${section.count} 个列表项`}
                          {section.type === 'code' && `${section.count} 个代码块`}
                        </span>
                      </div>
                      {section.items.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="text-sm text-muted-foreground truncate">
                              {item}
                            </div>
                          ))}
                          {section.count > section.items.length && (
                            <div className="text-xs text-muted-foreground">
                              还有 {section.count - section.items.length} 项...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {promptStructure.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>内容结构较简单，建议添加标题和列表来提升可读性</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
