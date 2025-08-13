'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  GitMerge, 
  GitBranch, 
  CheckCircle, 
  ArrowRight,
  Zap
} from 'lucide-react'

export function MergeFeatureShowcase() {
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <GitMerge className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg text-purple-800 dark:text-purple-200">
              🎉 新功能: 分支合并
            </CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-300">
              现在支持 Git-like 分支合并功能
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">智能分析</span>
            </div>
            <p className="text-xs text-muted-foreground">
              自动检测合并可行性和潜在冲突
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">安全合并</span>
            </div>
            <p className="text-xs text-muted-foreground">
              保留完整的提交历史和版本追踪
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">一键操作</span>
            </div>
            <p className="text-xs text-muted-foreground">
              简单直观的合并流程，无需命令行
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">feature/new-prompt</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-xs">main</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            现在可以合并了！
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
