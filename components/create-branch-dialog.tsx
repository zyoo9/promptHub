'use client'

import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Branch {
  id: string
  name: string
  isDefault: boolean
  lastCommitId: string | null
  lastCommit: {
    id: string
    message: string
    createdAt: string
  } | null
}

interface CreateBranchDialogProps {
  projectId: string
  branches: Branch[]
  onBranchCreated: () => void
}

export function CreateBranchDialog({ projectId, branches, onBranchCreated }: CreateBranchDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [sourceBranch, setSourceBranch] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) {
      setError('分支名称不能为空')
      return
    }

    // 验证分支名称格式
    if (!/^[a-zA-Z0-9\-_\/]+$/.test(name.trim())) {
      setError('分支名称只能包含字母、数字、短横线、下划线和斜杠')
      return
    }

    setLoading(true)
    
    try {
      const selectedBranch = branches.find(b => b.name === sourceBranch)
      const sourceCommitId = selectedBranch?.lastCommitId

      const response = await fetch(`/api/projects/${projectId}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          sourceCommitId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建分支失败')
      }

      // 重置表单
      setName('')
      setSourceBranch('')
      setOpen(false)
      onBranchCreated()
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建分支失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          创建分支
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>创建新分支</DialogTitle>
            <DialogDescription>
              基于现有分支创建一个新的分支来管理不同版本的提示词。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                分支名称 *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: feature/new-prompt 或 hotfix/bug-fix"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                只能包含字母、数字、短横线、下划线和斜杠
              </p>
            </div>
            
            {branches.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="source" className="text-sm font-medium">
                  基于分支
                </label>
                <Select value={sourceBranch} onValueChange={setSourceBranch} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择源分支（默认为主分支）" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        <div className="flex items-center space-x-2">
                          <span>{branch.name}</span>
                          {branch.isDefault && (
                            <span className="text-xs text-muted-foreground">(默认)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  新分支将基于所选分支的最新提交创建
                </p>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '创建中...' : '创建分支'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
