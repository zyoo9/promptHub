'use client'

import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitBranch, Clock, FileText } from 'lucide-react'

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

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const defaultBranch = project.branches.find(branch => branch.isDefault)
  const lastCommit = defaultBranch?.lastCommit
  
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="card-hover cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 group-hover:bg-card/80 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <CardTitle className="text-lg group-hover:gradient-text transition-all duration-300">
                  {project.name}
                </CardTitle>
              </div>
              {project.description && (
                <CardDescription className="line-clamp-2 text-sm">
                  {project.description}
                </CardDescription>
              )}
            </div>
            <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs">→</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 分支信息卡片 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                <span className="text-xs">分支</span>
              </div>
              <div className="text-lg font-semibold">{project.branches.length}</div>
            </div>
            {defaultBranch && defaultBranch._count && typeof defaultBranch._count.commits === 'number' && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">提交</span>
                </div>
                <div className="text-lg font-semibold">{defaultBranch._count.commits}</div>
              </div>
            )}
          </div>

          {/* 最新提交信息 */}
          {lastCommit && (
            <div className="space-y-2 p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border-l-2 border-primary/20">
              <div className="text-sm font-medium truncate">
                {lastCommit.message}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(new Date(lastCommit.createdAt))}</span>
              </div>
            </div>
          )}

          {/* 默认分支和状态 */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            {defaultBranch && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                {defaultBranch.name}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>活跃</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
