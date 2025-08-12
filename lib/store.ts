import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EditorSettings {
  theme: 'light' | 'dark'
  fontSize: number
  wordWrap: 'on' | 'off'
  language: string
  autoSave: boolean
  showMinimap: boolean
  showLineNumbers: boolean
  showWhitespace: boolean
}

interface UserPreferences {
  editorSettings: EditorSettings
  updateEditorSettings: (settings: Partial<EditorSettings>) => void
  resetEditorSettings: () => void
}

const defaultEditorSettings: EditorSettings = {
  theme: 'light',
  fontSize: 14,
  wordWrap: 'on',
  language: 'markdown',
  autoSave: true,
  showMinimap: true,
  showLineNumbers: true,
  showWhitespace: false,
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set, get) => ({
      editorSettings: defaultEditorSettings,
      
      updateEditorSettings: (settings) =>
        set((state) => ({
          editorSettings: { ...state.editorSettings, ...settings },
        })),
      
      resetEditorSettings: () =>
        set({ editorSettings: defaultEditorSettings }),
    }),
    {
      name: 'prompthub-preferences',
      partialize: (state) => ({ editorSettings: state.editorSettings }),
    }
  )
)
