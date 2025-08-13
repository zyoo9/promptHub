'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, GitBranch, Clock, FileText, Plus, Settings, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { CreateBranchDialog } from '@/components/create-branch-dialog'
import { DeleteProjectDialog } from '@/components/delete-project-dialog'
import { MergeBranchDialog } from '@/components/merge-branch-dialog'

interface Branch {
  id: string
  name: string
  isDefault: boolean
  lastCommitId: string | null
  createdFromCommitId: string | null
  createdAt: string
  updatedAt: string
  lastCommit: {
    id: string
    message: string
    createdAt: string
  } | null
  createdFromCommit: {
    id: string
    message: string
    createdAt: string
  } | null
  _count: {
    commits: number
  }
}

interface Project {
  id: string
  name: string
  description: string | null
  defaultBranch: string
  createdAt: string
  updatedAt: string
  branches: Branch[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProject = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`/api/projects/${projectId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('项目不存在')
        }
        throw new Error('获取项目详情失败')
      }
      
      const data = await response.json()
      setProject(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取项目详情失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const handleProjectDeleted = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">加载项目详情中...</p>
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
            <Button onClick={fetchProject} variant="outline">
              重试
            </Button>
            <Link href="/">
              <Button variant="outline">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 项目头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-2">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
          <DeleteProjectDialog
            project={project}
            onProjectDeleted={handleProjectDeleted}
          />
        </div>
      </div>

      {/* 项目统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">分支数量</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.branches.length}</div>
            <p className="text-xs text-muted-foreground">
              默认分支: {project.defaultBranch}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总提交数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.branches.reduce((sum, branch) => sum + branch._count.commits, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              跨所有分支
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最后更新</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRelativeTime(new Date(project.updatedAt))}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 分支列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">分支管理</h2>
          <CreateBranchDialog
            projectId={project.id}
            branches={project.branches}
            onBranchCreated={fetchProject}
          />
        </div>

        <div className="space-y-3">
          {project.branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{branch.name}</h3>
                        {branch.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            默认
                          </Badge>
                        )}
                      </div>
                      {branch.lastCommit && (
                        <p className="text-sm text-muted-foreground mt-1">
                          最新提交: {branch.lastCommit.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      {branch._count.commits} 个提交
                    </div>
                    {branch.lastCommit && (
                      <div className="text-sm text-muted-foreground">
                        {formatRelativeTime(new Date(branch.lastCommit.createdAt))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {!branch.isDefault && project.branches.length > 1 && (
                        <MergeBranchDialog
                          projectId={project.id}
                          currentBranch={branch.name}
                          branches={project.branches}
                          onMergeComplete={fetchProject}
                        />
                      )}
                      <Link href={`/projects/${project.id}/branches/${encodeURIComponent(branch.name)}`}>
                        <Button size="sm">查看分支</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {project.branches.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌿</div>
            <h3 className="text-lg font-medium mb-2">还没有分支</h3>
            <p className="text-muted-foreground mb-4">
              创建第一个分支来开始管理提示词版本
            </p>
            <CreateBranchDialog
              projectId={project.id}
              branches={project.branches}
              onBranchCreated={fetchProject}
            />
          </div>
        )}
      </div>
    </div>
  )
}
