'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  Settings,
  Moon,
  Sun,
  Keyboard,
  Download,
  Upload
} from 'lucide-react'
import { EnhancedPreview } from './enhanced-preview'
import { EditorSettingsDialog } from './editor-settings-dialog'
import { useUserPreferences } from '@/lib/store'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 动态导入Monaco编辑器，避免SSR问题
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">加载编辑器中...</p>
      </div>
    </div>
  )
})

interface MonacoPromptEditorProps {
  projectId: string
  branchName: string
  initialContent: string
  onSaved: () => void
}

export function MonacoPromptEditor({ projectId, branchName, initialContent, onSaved }: MonacoPromptEditorProps) {
  const { editorSettings, updateEditorSettings } = useUserPreferences()
  const [content, setContent] = useState(initialContent)
  const [commitMessage, setCommitMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  // 从用户偏好设置中获取配置
  const { theme, language, fontSize, wordWrap, autoSave, showMinimap, showLineNumbers, showWhitespace } = editorSettings

  const editorRef = useRef<any>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedContentRef = useRef(initialContent)

  useEffect(() => {
    setContent(initialContent)
    lastSavedContentRef.current = initialContent
  }, [initialContent])

  useEffect(() => {
    setHasChanges(content !== lastSavedContentRef.current)
  }, [content])

  // 自动保存功能
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    if (autoSave && hasChanges && content.trim()) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, 30000) // 30秒后自动保存
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content, hasChanges, autoSave])

  const handleAutoSave = async () => {
    if (!hasChanges || !content.trim()) return

    setAutoSaving(true)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}/commits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `自动保存 - ${new Date().toLocaleString()}`,
            content: content
          }),
        }
      )

      if (response.ok) {
        lastSavedContentRef.current = content
        setHasChanges(false)
        onSaved()
      }
    } catch (error) {
      console.error('自动保存失败:', error)
    } finally {
      setAutoSaving(false)
    }
  }

  const handleSave = async () => {
    if (!commitMessage.trim()) {
      setError('请输入提交说明')
      return
    }

    if (!hasChanges) {
      setError('没有内容变更需要保存')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `/api/projects/${projectId}/branches/${encodeURIComponent(branchName)}/commits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMessage.trim(),
            content: content
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      setSuccess('保存成功!')
      setCommitMessage('')
      lastSavedContentRef.current = content
      setHasChanges(false)
      onSaved()

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContent(lastSavedContentRef.current)
    setCommitMessage('')
    setError('')
    setSuccess('')
    setHasChanges(false)
  }

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // 设置自定义快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (commitMessage.trim() && hasChanges) {
        handleSave()
      }
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'undo', {})
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'redo', {})
    })

    // 配置编辑器选项
    editor.updateOptions({
      fontSize: fontSize,
      wordWrap: wordWrap,
      minimap: { enabled: showMinimap },
      lineNumbers: showLineNumbers ? 'on' : 'off',
      renderWhitespace: showWhitespace ? 'all' : 'selection',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      rulers: [80, 120],
    })
  }

  const exportContent = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${branchName}-prompt.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importContent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
      }
      reader.readAsText(file)
    }
  }

  const wordCount = content.length
  const lineCount = content.split('\n').length
  const selectedText = editorRef.current?.getModel()?.getValueInRange(editorRef.current?.getSelection()) || ''

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>高级提示词编辑器</CardTitle>
              <CardDescription>
                支持语法高亮、快捷键、自动保存的专业编辑环境
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {autoSaving && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  自动保存中...
                </Badge>
              )}
              {hasChanges && !autoSaving && (
                <Badge variant="destructive" className="text-xs">
                  有未保存的更改
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 编辑器工具栏 */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">语言:</label>
                <Select value={language} onValueChange={(value) => updateEditorSettings({ language: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="plaintext">纯文本</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">主题:</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateEditorSettings({ theme: theme === 'light' ? 'dark' : 'light' })}
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">字号:</label>
                <Select value={fontSize.toString()} onValueChange={(value) => updateEditorSettings({ fontSize: parseInt(value) })}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <EditorSettingsDialog onSettingsChange={() => {
                // 强制重新渲染编辑器以应用新设置
                if (editorRef.current) {
                  editorRef.current.updateOptions({
                    fontSize: editorSettings.fontSize,
                    wordWrap: editorSettings.wordWrap,
                    minimap: { enabled: editorSettings.showMinimap },
                    lineNumbers: editorSettings.showLineNumbers ? 'on' : 'off',
                    renderWhitespace: editorSettings.showWhitespace ? 'all' : 'selection',
                  })
                }
              }} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={exportContent}>
                <Download className="h-4 w-4" />
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".txt,.md,.json,.yaml,.yml"
                  onChange={importContent}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 快捷键提示 */}
          {showKeyboardShortcuts && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">快捷键</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div>Ctrl/Cmd + S: 保存</div>
                <div>Ctrl/Cmd + Z: 撤销</div>
                <div>Ctrl/Cmd + Shift + Z: 重做</div>
                <div>Ctrl/Cmd + F: 查找</div>
                <div>Ctrl/Cmd + H: 替换</div>
                <div>Ctrl/Cmd + /: 注释切换</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monaco编辑器 */}
            <div className={`space-y-4 ${showPreview ? '' : 'lg:col-span-2'}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">提示词内容</label>
                  <div className="text-xs text-muted-foreground space-x-4">
                    <span>{lineCount} 行</span>
                    <span>{wordCount} 字符</span>
                    {selectedText && <span>{selectedText.length} 已选择</span>}
                  </div>
                </div>
                <div className={`border rounded-md overflow-hidden ${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-[400px]'}`}>
                  <MonacoEditor
                    value={content}
                    language={language}
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                    onChange={(value) => setContent(value || '')}
                    onMount={handleEditorMount}
                    options={{
                      fontSize,
                      wordWrap,
                      minimap: { enabled: !isFullscreen },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  提交说明 *
                </label>
                <Input
                  id="message"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="描述这次修改的内容..."
                  disabled={saving}
                  maxLength={500}
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter' && commitMessage.trim() && hasChanges) {
                      handleSave()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {commitMessage.length}/500 字符 • Ctrl+Enter 快速提交
                </p>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
                  {success}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges || !commitMessage.trim()}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? '保存中...' : '提交保存'}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving || !hasChanges}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>重置</span>
                </Button>
              </div>
            </div>

            {/* 增强预览 */}
            {showPreview && (
              <div className="space-y-2">
                <EnhancedPreview
                  content={content}
                  language={language}
                  className={isFullscreen ? 'h-[calc(100vh-300px)]' : ''}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 编辑器功能提示 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-lg">✨</div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-800">编辑器特性</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 语法高亮和代码补全</li>
                <li>• 自动保存 (30秒无操作后)</li>
                <li>• 快捷键支持 (Ctrl+S保存, Ctrl+Z撤销等)</li>
                <li>• 实时预览和全屏编辑</li>
                <li>• 导入导出文件支持</li>
                <li>• 深色/浅色主题切换</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
