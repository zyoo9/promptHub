'use client'

import { useState } from 'react'
import { Settings, RotateCcw, Palette, Type, Code, Save } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useUserPreferences } from '@/lib/store'

interface EditorSettingsDialogProps {
  onSettingsChange?: () => void
}

export function EditorSettingsDialog({ onSettingsChange }: EditorSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const { editorSettings, updateEditorSettings, resetEditorSettings } = useUserPreferences()

  const handleSave = () => {
    setOpen(false)
    onSettingsChange?.()
  }

  const handleReset = () => {
    resetEditorSettings()
    onSettingsChange?.()
  }

  const settingsCategories = [
    {
      title: '外观设置',
      icon: <Palette className="h-4 w-4" />,
      settings: [
        {
          label: '编辑器主题',
          key: 'theme' as const,
          type: 'select' as const,
          options: [
            { value: 'light', label: '浅色主题' },
            { value: 'dark', label: '深色主题' }
          ]
        },
        {
          label: '字体大小',
          key: 'fontSize' as const,
          type: 'select' as const,
          options: [
            { value: '12', label: '12px' },
            { value: '14', label: '14px' },
            { value: '16', label: '16px' },
            { value: '18', label: '18px' },
            { value: '20', label: '20px' }
          ]
        }
      ]
    },
    {
      title: '编辑器行为',
      icon: <Code className="h-4 w-4" />,
      settings: [
        {
          label: '自动换行',
          key: 'wordWrap' as const,
          type: 'select' as const,
          options: [
            { value: 'on', label: '开启' },
            { value: 'off', label: '关闭' }
          ]
        },
        {
          label: '默认语言',
          key: 'language' as const,
          type: 'select' as const,
          options: [
            { value: 'markdown', label: 'Markdown' },
            { value: 'plaintext', label: '纯文本' },
            { value: 'yaml', label: 'YAML' },
            { value: 'json', label: 'JSON' }
          ]
        }
      ]
    },
    {
      title: '功能设置',
      icon: <Type className="h-4 w-4" />,
      settings: [
        {
          label: '自动保存',
          key: 'autoSave' as const,
          type: 'select' as const,
          options: [
            { value: 'true', label: '开启 (30秒后)' },
            { value: 'false', label: '关闭' }
          ]
        },
        {
          label: '显示小地图',
          key: 'showMinimap' as const,
          type: 'select' as const,
          options: [
            { value: 'true', label: '显示' },
            { value: 'false', label: '隐藏' }
          ]
        },
        {
          label: '显示行号',
          key: 'showLineNumbers' as const,
          type: 'select' as const,
          options: [
            { value: 'true', label: '显示' },
            { value: 'false', label: '隐藏' }
          ]
        },
        {
          label: '显示空白字符',
          key: 'showWhitespace' as const,
          type: 'select' as const,
          options: [
            { value: 'true', label: '显示' },
            { value: 'false', label: '隐藏' }
          ]
        }
      ]
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          编辑器设置
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>编辑器设置</span>
          </DialogTitle>
          <DialogDescription>
            自定义编辑器的外观和行为，设置会自动保存到本地
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 py-4">
          {settingsCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  {category.icon}
                  <span>{category.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="grid grid-cols-2 items-center gap-4">
                    <label className="text-sm font-medium">
                      {setting.label}
                    </label>
                    {setting.type === 'select' && (
                      <Select
                        value={String(editorSettings[setting.key])}
                        onValueChange={(value) => {
                          let convertedValue: any = value
                          if (setting.key === 'fontSize') {
                            convertedValue = parseInt(value)
                          } else if (setting.key === 'autoSave' || setting.key === 'showMinimap' || 
                                   setting.key === 'showLineNumbers' || setting.key === 'showWhitespace') {
                            convertedValue = value === 'true'
                          }
                          updateEditorSettings({ [setting.key]: convertedValue })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* 预设配置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">快速预设</CardTitle>
              <CardDescription>
                选择预设配置快速设置编辑器
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    updateEditorSettings({
                      theme: 'light',
                      fontSize: 14,
                      wordWrap: 'on',
                      language: 'markdown',
                      autoSave: true,
                      showMinimap: true,
                      showLineNumbers: true,
                      showWhitespace: false
                    })
                  }}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium">默认配置</div>
                    <div className="text-xs text-muted-foreground">适合大多数用户</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    updateEditorSettings({
                      theme: 'dark',
                      fontSize: 16,
                      wordWrap: 'off',
                      language: 'markdown',
                      autoSave: false,
                      showMinimap: false,
                      showLineNumbers: true,
                      showWhitespace: true
                    })
                  }}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium">专业配置</div>
                    <div className="text-xs text-muted-foreground">适合高级用户</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    updateEditorSettings({
                      theme: 'light',
                      fontSize: 18,
                      wordWrap: 'on',
                      language: 'plaintext',
                      autoSave: true,
                      showMinimap: false,
                      showLineNumbers: false,
                      showWhitespace: false
                    })
                  }}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium">简洁配置</div>
                    <div className="text-xs text-muted-foreground">专注写作</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    updateEditorSettings({
                      theme: 'dark',
                      fontSize: 12,
                      wordWrap: 'off',
                      language: 'json',
                      autoSave: false,
                      showMinimap: true,
                      showLineNumbers: true,
                      showWhitespace: true
                    })
                  }}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium">开发配置</div>
                    <div className="text-xs text-muted-foreground">适合技术写作</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>恢复默认</span>
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>保存设置</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
