'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  GitBranch, 
  FileText, 
  Clock,
  Users,
  Zap
} from 'lucide-react'

interface DashboardStatsProps {
  projects: any[]
}

export function DashboardStats({ projects }: DashboardStatsProps) {
  // 计算统计数据
  const totalProjects = projects.length
  const totalBranches = projects.reduce((sum, project) => sum + project.branches.length, 0)
  const totalCommits = projects.reduce((sum, project) => 
    sum + project.branches.reduce((branchSum: number, branch: any) => branchSum + (branch._count?.commits || 0), 0), 0
  )
  
  // 计算最近活动的项目数
  const recentlyActiveProjects = projects.filter(project => {
    const lastUpdate = new Date(project.updatedAt)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return lastUpdate > weekAgo
  }).length

  // 计算平均每个项目的分支数
  const avgBranchesPerProject = totalProjects > 0 ? (totalBranches / totalProjects).toFixed(1) : '0'
  
  // 计算平均每个分支的提交数
  const avgCommitsPerBranch = totalBranches > 0 ? (totalCommits / totalBranches).toFixed(1) : '0'

  const stats = [
    {
      title: '总项目数',
      value: totalProjects,
      description: '已创建的项目',
      icon: <FileText className="h-4 w-4" />,
      trend: totalProjects > 0 ? 'up' : 'neutral',
      change: recentlyActiveProjects > 0 ? `${recentlyActiveProjects} 个最近活跃` : '暂无活动'
    },
    {
      title: '总分支数',
      value: totalBranches,
      description: '跨所有项目',
      icon: <GitBranch className="h-4 w-4" />,
      trend: 'up',
      change: `平均 ${avgBranchesPerProject} 个/项目`
    },
    {
      title: '总提交数',
      value: totalCommits,
      description: '版本记录',
      icon: <Activity className="h-4 w-4" />,
      trend: 'up',
      change: `平均 ${avgCommitsPerBranch} 个/分支`
    },
    {
      title: '活跃项目',
      value: recentlyActiveProjects,
      description: '本周有更新',
      icon: <Zap className="h-4 w-4" />,
      trend: recentlyActiveProjects > totalProjects * 0.5 ? 'up' : 'down',
      change: `${((recentlyActiveProjects / totalProjects) * 100 || 0).toFixed(0)}% 活跃度`
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="card-hover bg-card/50 backdrop-blur-sm border-border/50"
          style={{animationDelay: `${index * 100}ms`}}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="text-muted-foreground">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <Badge 
                variant={stat.trend === 'up' ? 'default' : stat.trend === 'down' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {stat.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
