'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  GitMerge, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  GitBranch,
  Clock,
  FileText
} from 'lucide-react'
import { ConflictResolver } from '@/components/conflict-resolver'
import { MergeResult } from '@/lib/merge-utils'

interface Branch {
  id: string
  name: string
  isDefault: boolean
  lastCommit: {
    id: string
    message: string
    createdAt: string
  } | null
  _count: {
    commits: number
  }
}

interface MergeAnalysis {
  canMerge: boolean
  hasConflicts: boolean
  mergeResult?: MergeResult
  analysis: {
    sourceBranch: string
    targetBranch: string
    commitsAhead: number
    commitsBehind: number
    sourceLastCommit: any
    targetLastCommit: any
    baseContent?: string
    recommendations: string[]
  }
}

interface MergeBranchDialogProps {
  projectId: string
  currentBranch: string
  branches: Branch[]
  onMergeComplete: () => void
}

export function MergeBranchDialog({ 
  projectId, 
  currentBranch, 
  branches, 
  onMergeComplete 
}: MergeBranchDialogProps) {
  const [open, setOpen] = useState(false)
  const [targetBranch, setTargetBranch] = useState('')
  const [mergeMessage, setMergeMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<MergeAnalysis | null>(null)
  const [showConflictResolver, setShowConflictResolver] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 过滤掉当前分支
  const availableBranches = branches.filter(branch => branch.name !== currentBranch)

  const analyzemerge = async () => {
    if (!targetBranch) return

    setAnalyzing(true)
    setError('')
    
    try {
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(currentBranch)}/merge?target=${encodeURIComponent(targetBranch)}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '分析合并可行性失败')
      }
      
      const analysisData = await response.json()
      setAnalysis(analysisData)
      
      // 生成默认合并消息
      setMergeMessage(`Merge branch '${currentBranch}' into '${targetBranch}'`)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : '分析失败')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleMerge = async (resolvedContent?: string) => {
    if (!targetBranch || !mergeMessage.trim()) {
      setError('请选择目标分支并输入合并信息')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(currentBranch)}/merge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetBranch,
            mergeMessage: mergeMessage.trim(),
            resolvedContent
          }),
        }
      )

      const result = await response.json()

      if (response.status === 409 && result.hasConflicts) {
        // 发现冲突，显示冲突解决界面
        setAnalysis(prev => prev ? { ...prev, mergeResult: result.mergeResult } : null)
        setShowConflictResolver(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(result.error || '合并失败')
      }

      setSuccess(result.message)
      onMergeComplete()
      
      // 延迟关闭对话框
      setTimeout(() => {
        setOpen(false)
        resetDialog()
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : '合并失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConflictsResolved = (resolvedContent: string) => {
    setShowConflictResolver(false)
    handleMerge(resolvedContent)
  }

  const resetDialog = () => {
    setTargetBranch('')
    setMergeMessage('')
    setAnalysis(null)
    setShowConflictResolver(false)
    setError('')
    setSuccess('')
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetDialog()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <GitMerge className="h-4 w-4" />
          合并分支
        </Button>
      </DialogTrigger>
      <DialogContent className={`${showConflictResolver ? 'max-w-6xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            {showConflictResolver ? '解决合并冲突' : '合并分支'}
          </DialogTitle>
          <DialogDescription>
            将 <code className="bg-muted px-1 py-0.5 rounded text-sm">{currentBranch}</code> 合并到目标分支
          </DialogDescription>
        </DialogHeader>

        {/* 冲突解决界面 */}
        {showConflictResolver && analysis?.mergeResult && (
          <ConflictResolver
            mergeResult={analysis.mergeResult}
            sourceBranch={currentBranch}
            targetBranch={targetBranch}
            onConflictsResolved={handleConflictsResolved}
            onCancel={() => setShowConflictResolver(false)}
          />
        )}

        {/* 正常合并界面 */}
        {!showConflictResolver && (
          <div className="space-y-6">
            {/* 分支选择 */}
            <div className="space-y-2">
              <Label htmlFor="target-branch">目标分支</Label>
              <Select 
                value={targetBranch} 
                onValueChange={(value) => {
                  setTargetBranch(value)
                  setAnalysis(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择要合并到的分支" />
                </SelectTrigger>
                <SelectContent>
                  {availableBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        {branch.name}
                        {branch.isDefault && (
                          <Badge variant="secondary" className="text-xs">默认</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 分析按钮 */}
            {targetBranch && !analysis && (
              <Button
                onClick={analyzemerge}
                disabled={analyzing}
                variant="outline"
                className="w-full"
              >
                {analyzing ? '分析中...' : '分析合并可行性'}
              </Button>
            )}

            {/* 合并分析结果 */}
            {analysis && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {analysis.canMerge ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <h4 className="font-medium">
                    {analysis.canMerge ? '可以合并' : '合并受限'}
                  </h4>
                  {analysis.hasConflicts && (
                    <Badge variant="destructive" className="text-xs">有冲突</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>源分支提交: {analysis.analysis.commitsAhead}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>目标分支提交: {analysis.analysis.commitsBehind}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {analysis.hasConflicts ? (
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>发现冲突</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>无冲突</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 建议 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Info className="h-4 w-4" />
                    建议
                  </div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {analysis.analysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 合并信息 */}
            {analysis?.canMerge && (
              <div className="space-y-2">
                <Label htmlFor="merge-message">合并信息</Label>
                <Input
                  id="merge-message"
                  value={mergeMessage}
                  onChange={(e) => setMergeMessage(e.target.value)}
                  placeholder="描述这次合并的内容..."
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {mergeMessage.length}/200 字符 • Ctrl+Enter 快速提交
                </p>
              </div>
            )}

            {/* 错误和成功信息 */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
                {success}
              </div>
            )}
          </div>
        )}

        {/* 对话框底部按钮 */}
        {!showConflictResolver && (
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              onClick={() => handleMerge()}
              disabled={!analysis?.canMerge || loading || !mergeMessage.trim()}
              className="flex items-center gap-2"
            >
              <GitMerge className="h-4 w-4" />
              {loading ? '合并中...' : analysis?.hasConflicts ? '检查冲突' : '确认合并'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}