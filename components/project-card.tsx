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
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* 分支信息 */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                <span>{project.branches.length} 个分支</span>
              </div>
              {defaultBranch && defaultBranch._count && typeof defaultBranch._count.commits === 'number' && (
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{defaultBranch._count.commits} 个提交</span>
                </div>
              )}
            </div>

            {/* 最新提交信息 */}
            {lastCommit && (
              <div className="space-y-1">
                <div className="text-sm font-medium truncate">
                  {lastCommit.message}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(new Date(lastCommit.createdAt))}</span>
                </div>
              </div>
            )}

            {/* 默认分支标识 */}
            {defaultBranch && (
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  {defaultBranch.name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
