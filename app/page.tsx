'use client'

import { useEffect, useState } from 'react'
import { ProjectCard } from '@/components/project-card'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentActivity } from '@/components/recent-activity'
import { MergeFeatureShowcase } from '@/components/merge-feature-showcase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw, BarChart3, Activity } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-bg p-6 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center float-animation touch-target">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              我的项目
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-white/90 mb-6">
            管理你的提示词项目和版本，让AI创作更有序
          </p>
          <div className="mobile-stack flex gap-4">
            <CreateProjectDialog onProjectCreated={fetchProjects} />
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 mobile-full touch-target"
              onClick={fetchProjects}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="mobile-hidden">刷新项目</span>
              <span className="md:hidden">刷新</span>
            </Button>
          </div>
        </div>

        {/* Floating elements - 移动端隐藏 */}
        <div className="hidden md:block absolute top-8 right-8 h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm animate-pulse" />
        <div className="hidden md:block absolute bottom-8 right-20 h-12 w-12 rounded-full bg-white/5 backdrop-blur-sm" style={{animationDelay: '1s'}} />
      </div>

      {/* 搜索和过滤栏 */}
      <div className="glass-card rounded-xl mobile-p-4 p-6">
        <div className="mobile-stack flex gap-4">
          <div className="relative mobile-full flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-white/20 touch-target"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              className="flex items-center gap-2 touch-target"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="mobile-hidden">刷新</span>
            </Button>
          </div>
        </div>

        {/* 快速统计 */}
        {projects.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>共 {projects.length} 个项目</span>
              {searchTerm && (
                <span className="status-info px-2 py-1 rounded-md">
                  找到 {filteredProjects.length} 个匹配结果
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Feature Showcase */}
      {/*<MergeFeatureShowcase />*/}

      {/* Dashboard Stats */}
      {projects.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">数据概览</h2>
          </div>
          <DashboardStats projects={projects} />
        </div>
      )}

      {/* Recent Activity & Projects Grid */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold mobile-text-sm">项目列表</h2>
            </div>
            {/* 项目网格 */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="glass-card rounded-2xl mobile-p-4 p-12 text-center space-y-4 sm:space-y-6">
                  <div className="text-6xl sm:text-8xl opacity-50">🔍</div>
                  <div className="space-y-2 sm:space-y-3">
                    <h2 className="text-lg sm:text-2xl font-bold">没有找到匹配的项目</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      尝试使用不同的关键词搜索，或者创建新项目
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    className="mt-4 touch-target"
                  >
                    清除搜索条件
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-semibold mobile-text-sm">最近活动</h2>
            </div>
            <RecentActivity projects={projects} />
          </div>
        </div>
      )}

      {/* 空状态 - 当没有任何项目时显示 */}
      {projects.length === 0 && (
        <div className="glass-card rounded-2xl mobile-p-4 p-12 text-center space-y-4 sm:space-y-6">
          <div className="relative">
            <div className="text-6xl sm:text-8xl float-animation">📝</div>
            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 h-6 w-6 sm:h-8 sm:w-8 bg-primary rounded-full flex items-center justify-center pulse-glow">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold">开始你的创作之旅</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              创建你的第一个提示词项目，让AI协作变得井井有条
            </p>
          </div>
          <div className="pt-4">
            <CreateProjectDialog onProjectCreated={fetchProjects} />
          </div>
        </div>
      )}
    </div>
  )
}
