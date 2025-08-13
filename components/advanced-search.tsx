'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Tag,
  GitBranch,
  SlidersHorizontal
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SearchFilters {
  query: string
  tags: string[]
  dateRange: string
  sortBy: string
  hasCommits: boolean | null
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  projects: any[]
}

export function AdvancedSearch({ onFiltersChange, projects }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    dateRange: 'all',
    sortBy: 'updated',
    hasCommits: null
  })
  const [isExpanded, setIsExpanded] = useState(false)

  // 从项目中提取所有可能的标签
  const availableTags = Array.from(
    new Set(
      projects.flatMap(project => 
        project.description ? project.description.match(/#\w+/g) || [] : []
      )
    )
  ).map(tag => tag.slice(1)) // 去掉 # 号

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] })
    }
  }

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) })
  }

  const clearFilters = () => {
    const cleared = {
      query: '',
      tags: [],
      dateRange: 'all',
      sortBy: 'updated',
      hasCommits: null
    }
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  const hasActiveFilters = filters.query || filters.tags.length > 0 || 
                          filters.dateRange !== 'all' || filters.sortBy !== 'updated' || 
                          filters.hasCommits !== null

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">智能搜索</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {filters.tags.length + (filters.query ? 1 : 0) + 
                 (filters.dateRange !== 'all' ? 1 : 0) + 
                 (filters.hasCommits !== null ? 1 : 0)} 个筛选条件
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {isExpanded ? '简化' : '高级'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 基础搜索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索项目名称、描述或标签..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* 高级筛选 */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            {/* 排序方式 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  时间范围
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => updateFilters({ dateRange: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择时间范围" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时间</SelectItem>
                    <SelectItem value="today">今天</SelectItem>
                    <SelectItem value="week">本周</SelectItem>
                    <SelectItem value="month">本月</SelectItem>
                    <SelectItem value="quarter">本季度</SelectItem>
                    <SelectItem value="year">今年</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">排序方式</label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">最近更新</SelectItem>
                    <SelectItem value="created">创建时间</SelectItem>
                    <SelectItem value="name">项目名称</SelectItem>
                    <SelectItem value="commits">提交数量</SelectItem>
                    <SelectItem value="branches">分支数量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 项目状态筛选 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                项目状态
              </label>
              <div className="flex gap-2">
                <Button
                  variant={filters.hasCommits === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters({ hasCommits: null })}
                >
                  全部
                </Button>
                <Button
                  variant={filters.hasCommits === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters({ hasCommits: true })}
                >
                  有提交
                </Button>
                <Button
                  variant={filters.hasCommits === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters({ hasCommits: false })}
                >
                  无提交
                </Button>
              </div>
            </div>

            {/* 标签筛选 */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  标签筛选
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => 
                        filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)
                      }
                      className="text-xs"
                    >
                      #{tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 已选标签 */}
        {filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground">已选标签:</span>
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs">
                #{tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* 清除筛选 */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground">
              {projects.length} 个项目中的筛选结果
            </span>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              清除筛选
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Popover 组件定义
const Popover = ({ children }: { children: React.ReactNode }) => children
const PopoverTrigger = ({ children }: { children: React.ReactNode }) => children  
const PopoverContent = ({ children }: { children: React.ReactNode }) => children
