'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'
import { 
  GitCommit, 
  GitBranch, 
  Plus, 
  Calendar,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface RecentActivityProps {
  projects: any[]
}

export function RecentActivity({ projects }: RecentActivityProps) {
  // 收集所有活动
  const activities: any[] = []

  projects.forEach(project => {
    // 项目创建活动
    activities.push({
      type: 'project_created',
      title: `创建了项目 "${project.name}"`,
      description: project.description || '没有描述',
      timestamp: project.createdAt,
      icon: <Plus className="h-4 w-4" />,
      projectId: project.id,
      projectName: project.name
    })

    // 分支活动
    project.branches.forEach((branch: any) => {
      if (branch.lastCommit) {
        activities.push({
          type: 'commit',
          title: branch.lastCommit.message,
          description: `在 ${project.name}/${branch.name} 分支`,
          timestamp: branch.lastCommit.createdAt,
          icon: <GitCommit className="h-4 w-4" />,
          projectId: project.id,
          projectName: project.name,
          branchName: branch.name
        })
      }

      if (!branch.isDefault) {
        activities.push({
          type: 'branch_created',
          title: `创建了分支 "${branch.name}"`,
          description: `在项目 ${project.name}`,
          timestamp: branch.createdAt,
          icon: <GitBranch className="h-4 w-4" />,
          projectId: project.id,
          projectName: project.name,
          branchName: branch.name
        })
      }
    })
  })

  // 按时间倒序排序，取最近10个活动
  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'commit':
        return 'bg-green-500'
      case 'branch_created':
        return 'bg-blue-500'
      case 'project_created':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'commit':
        return { label: '提交', variant: 'default' as const }
      case 'branch_created':
        return { label: '分支', variant: 'secondary' as const }
      case 'project_created':
        return { label: '项目', variant: 'outline' as const }
      default:
        return { label: '活动', variant: 'default' as const }
    }
  }

  if (recentActivities.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            最近活动
          </CardTitle>
          <CardDescription>查看项目的最新动态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>还没有任何活动记录</p>
            <p className="text-sm">创建项目或提交代码后会显示在这里</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          最近活动
        </CardTitle>
        <CardDescription>查看项目的最新动态</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => {
            const badge = getActivityBadge(activity.type)
            return (
              <div key={index} className="flex items-start space-x-3 group">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {activity.title}
                    </p>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(activity.timestamp))}
                    </p>
                    {activity.projectId && (
                      <Link 
                        href={activity.branchName 
                          ? `/projects/${activity.projectId}/branches/${encodeURIComponent(activity.branchName)}`
                          : `/projects/${activity.projectId}`
                        }
                        className="text-xs text-primary hover:underline"
                      >
                        查看 →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
