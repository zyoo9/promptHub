'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Project {
  id: string
  name: string
  description: string | null
}

interface DeleteProjectDialogProps {
  project: Project
  onProjectDeleted: () => void
}

export function DeleteProjectDialog({ project, onProjectDeleted }: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmText !== project.name) {
      setError('项目名称不匹配')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '删除项目失败')
      }

      setOpen(false)
      onProjectDeleted()
    } catch (error) {
      setError(error instanceof Error ? error.message : '删除项目失败')
    } finally {
      setLoading(false)
    }
  }

  const canDelete = confirmText === project.name && !loading

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          删除项目
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">删除项目</DialogTitle>
          <DialogDescription>
            此操作将永久删除项目 <strong>{project.name}</strong> 及其所有分支、提交和数据。
            此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive font-medium">
              ⚠️ 警告：此操作不可撤销
            </p>
            <p className="text-sm text-destructive/80 mt-1">
              删除后将无法恢复项目数据，请谨慎操作。
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">
              请输入项目名称 <strong>{project.name}</strong> 来确认删除：
            </label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={project.name}
              disabled={loading}
            />
          </div>
          
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete}
          >
            {loading ? '删除中...' : '确认删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
