'use client'

import { useEffect, useState } from 'react'
import { ProjectCard } from '@/components/project-card'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  branches: Array<{
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
  }>
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error('获取项目列表失败')
      }
      
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">加载项目列表中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchProjects} variant="outline">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的项目</h1>
          <p className="text-muted-foreground mt-2">
            管理你的提示词项目和版本
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索项目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchProjects}
          title="刷新项目列表"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* 项目列表 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          {projects.length === 0 ? (
            <div className="space-y-4">
              <div className="text-6xl">📝</div>
              <h2 className="text-xl font-semibold">还没有项目</h2>
              <p className="text-muted-foreground">
                创建你的第一个提示词项目来开始使用
              </p>
              <CreateProjectDialog onProjectCreated={fetchProjects} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">🔍</div>
              <h2 className="text-xl font-semibold">没有找到匹配的项目</h2>
              <p className="text-muted-foreground">
                尝试使用不同的关键词搜索
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* 统计信息 */}
      {projects.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          共 {projects.length} 个项目
          {searchTerm && ` • 显示 ${filteredProjects.length} 个匹配结果`}
        </div>
      )}
    </div>
  )
}
