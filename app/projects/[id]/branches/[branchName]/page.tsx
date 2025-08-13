'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  GitBranch, 
  FileText, 
  History, 
  Edit3, 
  Eye,
  Clock,
  Hash,
  User
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { PromptEditor } from '@/components/prompt-editor'
import { CommitHistory } from '@/components/commit-history'
import { MergeBranchDialog } from '@/components/merge-branch-dialog'

interface Commit {
  id: string
  message: string
  content: string
  commitHash: string
  createdAt: string
  parentCommitId: string | null
}

interface Branch {
  id: string
  name: string
  isDefault: boolean
  lastCommitId: string | null
  createdFromCommitId: string | null
  createdAt: string
  updatedAt: string
  lastCommit: Commit | null
  createdFromCommit: Commit | null
  _count: {
    commits: number
  }
  project: {
    id: string
    name: string
    description: string | null
  }
}

export default function BranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const branchName = decodeURIComponent(params.branchName as string)

  const [branch, setBranch] = useState<Branch | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('view')

  const fetchBranch = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('分支不存在')
        }
        throw new Error('获取分支详情失败')
      }
      
      const data = await response.json()
      setBranch(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取分支详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = async () => {
    try {
      setContentLoading(true)
      
      const response = await fetch(`/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}/content`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setContent('// 这个分支还没有任何内容\n')
          return
        }
        throw new Error('获取分支内容失败')
      }
      
      const data = await response.json()
      setContent(data.content || '')
    } catch (error) {
      console.error('获取分支内容失败:', error)
      setContent('// 获取内容失败，请刷新重试\n')
    } finally {
      setContentLoading(false)
    }
  }

  useEffect(() => {
    fetchBranch()
    fetchContent()
  }, [projectId, branchName])

  const handleContentSaved = () => {
    fetchBranch()
    fetchContent()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载分支详情中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <div className="space-x-2">
            <Button onClick={fetchBranch} variant="outline">
              重试
            </Button>
            <Link href={`/projects/${projectId}`}>
              <Button variant="outline">
                返回项目
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!branch) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 分支头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回项目
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold">{branch.project.name}</h1>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-semibold">{branch.name}</span>
                {branch.isDefault && (
                  <Badge variant="secondary">默认分支</Badge>
                )}
              </div>
            </div>
            {branch.project.description && (
              <p className="text-muted-foreground mt-2">{branch.project.description}</p>
            )}
          </div>
        </div>
        
        {/* 分支操作 */}
        <div className="flex items-center gap-2">
          {!branch.isDefault && branch.project.branches && (
            <MergeBranchDialog
              projectId={projectId}
              currentBranch={branch.name}
              branches={branch.project.branches}
              onMergeComplete={() => {
                fetchBranch()
              }}
            />
          )}
        </div>
      </div>

      {/* 分支信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">提交数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branch._count.commits}</div>
            <p className="text-xs text-muted-foreground">
              此分支的总提交数
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最后提交</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {branch.lastCommit ? (
              <>
                <div className="text-2xl font-bold">
                  {formatRelativeTime(new Date(branch.lastCommit.createdAt))}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {branch.lastCommit.message}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">无</div>
                <p className="text-xs text-muted-foreground">
                  还没有提交
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">创建时间</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRelativeTime(new Date(branch.createdAt))}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(branch.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            查看内容
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            编辑提示词
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            版本历史
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>当前内容</CardTitle>
              <CardDescription>
                {branch.lastCommit 
                  ? `最后更新于 ${formatRelativeTime(new Date(branch.lastCommit.createdAt))}`
                  : '此分支还没有任何内容'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {content || '// 此分支还没有任何内容'}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <PromptEditor
            projectId={projectId}
            branchName={branchName}
            initialContent={content}
            onSaved={handleContentSaved}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <CommitHistory
            projectId={projectId}
            branchName={branchName}
            onCommitReverted={handleContentSaved}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
