'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertTriangle, 
  CheckCircle, 
  GitMerge, 
  Edit3,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'
import { ConflictBlock, MergeResult } from '@/lib/merge-utils'

interface ConflictResolverProps {
  mergeResult: MergeResult
  sourceBranch: string
  targetBranch: string
  onConflictsResolved: (resolvedContent: string) => void
  onCancel: () => void
}

export function ConflictResolver({ 
  mergeResult, 
  sourceBranch, 
  targetBranch, 
  onConflictsResolved,
  onCancel 
}: ConflictResolverProps) {
  const [conflicts, setConflicts] = useState<ConflictBlock[]>(mergeResult.conflicts)
  const [showPreview, setShowPreview] = useState(false)
  const [resolving, setResolving] = useState(false)

  const updateConflictResolution = (conflictId: string, resolution: string[], resolved: boolean) => {
    setConflicts(prev => prev.map(conflict => 
      conflict.id === conflictId 
        ? { ...conflict, resolution, resolved }
        : conflict
    ))
  }

  const generateResolvedContent = (): string => {
    let content = mergeResult.mergedContent
    const lines = content.split('\n')
    const result: string[] = []
    
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      
      // 检查是否是冲突标记开始
      if (line.includes('<<<<<<< 当前分支')) {
        // 找到对应的冲突块
        const conflict = conflicts.find(c => {
          // 简单匹配 - 在实际实现中可能需要更精确的匹配
          return c.resolved && c.resolution
        })
        
        if (conflict?.resolved && conflict.resolution) {
          result.push(...conflict.resolution)
        }
        
        // 跳过冲突标记到结束标记
        while (i < lines.length && !lines[i].includes('>>>>>>> 传入分支')) {
          i++
        }
        i++ // 跳过结束标记
      } else {
        result.push(line)
        i++
      }
    }
    
    return result.join('\n')
  }

  const handleResolveAll = () => {
    const allResolved = conflicts.every(c => c.resolved)
    if (!allResolved) {
      return
    }
    
    setResolving(true)
    const resolvedContent = generateResolvedContent()
    onConflictsResolved(resolvedContent)
  }

  const allConflictsResolved = conflicts.every(c => c.resolved)

  return (
    <div className="space-y-6">
      {/* 冲突概览 */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800 dark:text-orange-200">
              发现合并冲突
            </CardTitle>
          </div>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            合并 <code className="bg-orange-100 dark:bg-orange-800 px-1 py-0.5 rounded text-xs">{sourceBranch}</code> 到 
            <code className="bg-orange-100 dark:bg-orange-800 px-1 py-0.5 rounded text-xs ml-1">{targetBranch}</code> 时发现 {conflicts.length} 个冲突
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">总行数</div>
              <div className="font-semibold">{mergeResult.stats.totalLines}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">冲突块</div>
              <div className="font-semibold text-orange-600">{mergeResult.stats.conflictBlocks}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">新增行</div>
              <div className="font-semibold text-green-600">+{mergeResult.stats.addedLines}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">删除行</div>
              <div className="font-semibold text-red-600">-{mergeResult.stats.removedLines}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 冲突解决 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">解决冲突</h3>
          <div className="flex items-center gap-2">
            <Badge variant={allConflictsResolved ? "default" : "secondary"}>
              {conflicts.filter(c => c.resolved).length} / {conflicts.length} 已解决
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? '隐藏预览' : '预览结果'}
            </Button>
          </div>
        </div>

        {conflicts.map((conflict, index) => (
          <ConflictBlock
            key={conflict.id}
            conflict={conflict}
            index={index + 1}
            sourceBranch={sourceBranch}
            targetBranch={targetBranch}
            onResolutionChange={(resolution, resolved) => 
              updateConflictResolution(conflict.id, resolution, resolved)
            }
          />
        ))}
      </div>

      {/* 预览解决结果 */}
      {showPreview && allConflictsResolved && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              合并预览
            </CardTitle>
            <CardDescription>
              解决冲突后的最终内容预览
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm max-h-96 overflow-auto">
              {generateResolvedContent()}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          取消合并
        </Button>
        <Button
          onClick={handleResolveAll}
          disabled={!allConflictsResolved || resolving}
          className="flex items-center gap-2"
        >
          <GitMerge className="h-4 w-4" />
          {resolving ? '合并中...' : '确认合并'}
        </Button>
      </div>
    </div>
  )
}

interface ConflictBlockProps {
  conflict: ConflictBlock
  index: number
  sourceBranch: string
  targetBranch: string
  onResolutionChange: (resolution: string[], resolved: boolean) => void
}

function ConflictBlock({ 
  conflict, 
  index, 
  sourceBranch, 
  targetBranch, 
  onResolutionChange 
}: ConflictBlockProps) {
  const [customResolution, setCustomResolution] = useState('')
  const [resolutionMode, setResolutionMode] = useState<'current' | 'incoming' | 'custom'>('current')

  const handleResolutionSelect = (mode: 'current' | 'incoming' | 'custom') => {
    setResolutionMode(mode)
    
    let resolution: string[]
    switch (mode) {
      case 'current':
        resolution = conflict.currentContent
        break
      case 'incoming':
        resolution = conflict.incomingContent
        break
      case 'custom':
        resolution = customResolution.split('\n')
        break
    }
    
    onResolutionChange(resolution, true)
  }

  const handleCustomResolutionChange = (value: string) => {
    setCustomResolution(value)
    if (resolutionMode === 'custom') {
      onResolutionChange(value.split('\n'), true)
    }
  }

  return (
    <Card className={`${conflict.resolved ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' : 'border-orange-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            冲突 #{index}
            {conflict.resolved && <CheckCircle className="h-4 w-4 text-green-600" />}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            行 {conflict.startLine + 1} - {conflict.endLine + 1}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 冲突内容对比 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {sourceBranch} (当前)
              </Badge>
            </div>
            <pre className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded text-sm whitespace-pre-wrap">
              {conflict.currentContent.join('\n')}
            </pre>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {targetBranch} (传入)
              </Badge>
            </div>
            <pre className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded text-sm whitespace-pre-wrap">
              {conflict.incomingContent.join('\n')}
            </pre>
          </div>
        </div>

        {/* 解决方案选择 */}
        <div className="space-y-3">
          <div className="text-sm font-medium">选择解决方案:</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={resolutionMode === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleResolutionSelect('current')}
            >
              使用当前分支
            </Button>
            <Button
              variant={resolutionMode === 'incoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleResolutionSelect('incoming')}
            >
              使用传入分支
            </Button>
            <Button
              variant={resolutionMode === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleResolutionSelect('custom')}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              自定义编辑
            </Button>
          </div>
        </div>

        {/* 自定义编辑区域 */}
        {resolutionMode === 'custom' && (
          <div className="space-y-2">
            <div className="text-sm font-medium">自定义解决方案:</div>
            <Textarea
              value={customResolution}
              onChange={(e) => handleCustomResolutionChange(e.target.value)}
              placeholder="输入解决冲突后的内容..."
              className="min-h-20 font-mono text-sm"
            />
          </div>
        )}

        {/* 解决预览 */}
        {conflict.resolved && conflict.resolution && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              解决方案预览:
            </div>
            <pre className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded text-sm whitespace-pre-wrap">
              {conflict.resolution.join('\n')}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
