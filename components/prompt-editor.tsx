'use client'

import { MonacoPromptEditor } from './monaco-prompt-editor'

interface PromptEditorProps {
  projectId: string
  branchName: string
  initialContent: string
  onSaved: () => void
}

export function PromptEditor({ projectId, branchName, initialContent, onSaved }: PromptEditorProps) {
  // 直接使用Monaco编辑器组件
  return (
    <MonacoPromptEditor
      projectId={projectId}
      branchName={branchName}
      initialContent={initialContent}
      onSaved={onSaved}
    />
  )
}