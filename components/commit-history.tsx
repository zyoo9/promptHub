'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  History, 
  RotateCcw, 
  Eye, 
  GitCommit,
  Clock,
  Hash,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { CommitDetailDialog } from '@/components/commit-detail-dialog'

interface Commit {
  id: string
  message: string
  content: string
  commitHash: string
  createdAt: string
  parentCommitId: string | null
}

interface CommitHistoryProps {
  projectId: string
  branchName: string
  onCommitReverted: () => void
}

interface CommitsResponse {
  commits: Commit[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function CommitHistory({ projectId, branchName, onCommitReverted }: CommitHistoryProps) {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<CommitsResponse['pagination'] | null>(null)
  const [revertingId, setRevertingId] = useState<string | null>(null)
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set())

  const fetchCommits = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) setLoading(true)
      setError('')
      
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}/commits?page=${pageNum}&limit=10`
      )
      
      if (!response.ok) {
        throw new Error('获取提交历史失败')
      }
      
      const data: CommitsResponse = await response.json()
      
      if (pageNum === 1) {
        setCommits(data.commits)
      } else {
        setCommits(prev => [...prev, ...data.commits])
      }
      
      setPagination(data.pagination)
      setPage(pageNum)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取提交历史失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommits(1)
  }, [projectId, branchName])

  const handleRevert = async (commit: Commit) => {
    if (!confirm(`确定要回滚到提交 "${commit.message}" 吗？这将创建一个新的提交。`)) {
      return
    }

    setRevertingId(commit.id)
    
    try {
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}/commits/${commit.id}/revert`,
        { method: 'POST' }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '回滚失败')
      }

      await fetchCommits(1) // 重新加载提交历史
      onCommitReverted() // 通知父组件更新
    } catch (error) {
      alert(error instanceof Error ? error.message : '回滚失败')
    } finally {
      setRevertingId(null)
    }
  }

  const toggleExpanded = (commitId: string) => {
    const newExpanded = new Set(expandedCommits)
    if (newExpanded.has(commitId)) {
      newExpanded.delete(commitId)
    } else {
      newExpanded.add(commitId)
    }
    setExpandedCommits(newExpanded)
  }

  const loadMore = () => {
    if (pagination && page < pagination.totalPages) {
      fetchCommits(page + 1)
    }
  }

  if (loading && commits.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载提交历史中...</p>
        </div>
      </div>
    )
  }

  if (error && commits.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => fetchCommits(1)} variant="outline">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>版本历史</span>
          </CardTitle>
          <CardDescription>
            {pagination ? `共 ${pagination.total} 个提交` : '查看所有提交记录'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commits.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">还没有提交记录</h3>
              <p className="text-muted-foreground">
                在编辑器中修改内容并保存后，这里就会显示提交历史
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {commits.map((commit, index) => (
                <div key={commit.id} className="border rounded-lg p-4 space-y-3">
                  {/* 提交头部信息 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GitCommit className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{commit.message}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Hash className="h-3 w-3" />
                            <span className="font-mono">{commit.commitHash.substring(0, 8)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(new Date(commit.createdAt))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          最新
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleExpanded(commit.id)}
                      >
                        {expandedCommits.has(commit.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <CommitDetailDialog
                        projectId={projectId}
                        branchName={branchName}
                        commit={commit}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevert(commit)}
                        disabled={revertingId === commit.id}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {revertingId === commit.id ? '回滚中...' : '回滚'}
                      </Button>
                    </div>
                  </div>

                  {/* 展开的内容预览 */}
                  {expandedCommits.has(commit.id) && (
                    <div className="border-t pt-3">
                      <h5 className="text-sm font-medium mb-2">内容预览:</h5>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40 whitespace-pre-wrap">
                        {commit.content.length > 500 
                          ? commit.content.substring(0, 500) + '...\n\n(内容过长，已截断)' 
                          : commit.content
                        }
                      </pre>
                    </div>
                  )}
                </div>
              ))}

              {/* 加载更多按钮 */}
              {pagination && page < pagination.totalPages && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? '加载中...' : '加载更多'}
                  </Button>
                </div>
              )}

              {/* 分页信息 */}
              {pagination && (
                <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                  显示 {commits.length} / {pagination.total} 个提交
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
