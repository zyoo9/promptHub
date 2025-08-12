'use client'

import { useState, useEffect } from 'react'
import { Eye, Hash, Clock, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/utils'

interface Commit {
  id: string
  message: string
  content: string
  commitHash: string
  createdAt: string
  parentCommitId: string | null
}

interface CommitDetail extends Commit {
  parentCommit?: {
    id: string
    message: string
    createdAt: string
  } | null
  childCommits?: Array<{
    id: string
    message: string
    createdAt: string
  }>
}

interface DiffLine {
  count?: number
  added?: boolean
  removed?: boolean
  value: string
}

interface DiffResponse {
  currentCommit: {
    id: string
    message: string
    createdAt: string
  }
  compareCommit: {
    id: string
    message: string
    createdAt: string
  } | null
  diff: DiffLine[]
  stats: {
    additions: number
    deletions: number
  }
}

interface CommitDetailDialogProps {
  projectId: string
  branchName: string
  commit: Commit
}

export function CommitDetailDialog({ projectId, branchName, commit }: CommitDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<CommitDetail | null>(null)
  const [diff, setDiff] = useState<DiffResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [diffLoading, setDiffLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCommitDetail = async () => {
    if (!open) return
    
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}/commits/${commit.id}`
      )
      
      if (!response.ok) {
        throw new Error('获取提交详情失败')
      }
      
      const data = await response.json()
      setDetail(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取提交详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchDiff = async () => {
    try {
      setDiffLoading(true)
      
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}/commits/${commit.id}/diff`
      )
      
      if (!response.ok) {
        throw new Error('获取差异失败')
      }
      
      const data = await response.json()
      setDiff(data)
    } catch (error) {
      console.error('获取差异失败:', error)
      setDiff(null)
    } finally {
      setDiffLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCommitDetail()
      fetchDiff()
    }
  }, [open])

  const renderDiffLine = (line: DiffLine, index: number) => {
    let className = 'font-mono text-sm whitespace-pre-wrap px-4 py-1 '
    
    if (line.added) {
      className += 'bg-green-50 text-green-800 border-l-4 border-green-500'
    } else if (line.removed) {
      className += 'bg-red-50 text-red-800 border-l-4 border-red-500'
    } else {
      className += 'bg-gray-50 text-gray-700'
    }

    return (
      <div key={index} className={className}>
        {line.value}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-1" />
          查看
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>提交详情</span>
          </DialogTitle>
          <DialogDescription>
            查看提交的详细信息和变更内容
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-hidden">
            {/* 提交信息 */}
            <div className="border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold">{detail.message}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center space-x-1">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono">{detail.commitHash}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(new Date(detail.createdAt))}</span>
                  <span className="text-xs">({new Date(detail.createdAt).toLocaleString()})</span>
                </div>
              </div>
              
              {/* 父提交信息 */}
              {detail.parentCommit && (
                <div className="mt-2 text-sm text-muted-foreground">
                  父提交: {detail.parentCommit.message}
                </div>
              )}
            </div>

            <Tabs defaultValue="content" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">完整内容</TabsTrigger>
                <TabsTrigger value="diff">变更对比</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="flex-1 overflow-hidden">
                <div className="border rounded-md overflow-auto max-h-96">
                  <pre className="text-sm p-4 whitespace-pre-wrap">
                    {detail.content}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="diff" className="flex-1 overflow-hidden">
                {diffLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : diff ? (
                  <div className="space-y-4">
                    {/* 统计信息 */}
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">+{diff.stats.additions} 新增</span>
                      <span className="text-red-600">-{diff.stats.deletions} 删除</span>
                      {diff.compareCommit && (
                        <span className="text-muted-foreground">
                          与 {diff.compareCommit.message} 对比
                        </span>
                      )}
                    </div>
                    
                    {/* 差异内容 */}
                    <div className="border rounded-md overflow-auto max-h-80">
                      {diff.diff.length > 0 ? (
                        diff.diff.map((line, index) => renderDiffLine(line, index))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          没有变更内容
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    无法获取差异信息
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
