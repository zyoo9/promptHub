// 全局类型定义文件

export interface Project {
  id: string
  name: string
  description?: string | null
  defaultBranch: string
  createdAt: string
  updatedAt: string
  branches?: Branch[]
}

export interface Branch {
  id: string
  name: string
  projectId: string
  isDefault: boolean
  lastCommitId?: string | null
  createdFromCommitId?: string | null
  createdAt: string
  updatedAt: string
  project?: Project
  lastCommit?: Commit | null
  createdFromCommit?: Commit | null
  commits?: Commit[]
  _count?: {
    commits: number
  }
}

export interface Commit {
  id: string
  message: string
  content: string
  branchId: string
  parentCommitId?: string | null
  commitHash: string
  createdAt: string
  branch?: Branch
  parentCommit?: Commit | null
  childCommits?: Commit[]
}

export interface CommitDiff {
  currentCommit: {
    id: string
    message: string
    createdAt: string
  }
  compareCommit?: {
    id: string
    message: string
    createdAt: string
  } | null
  diff: Array<{
    added?: boolean
    removed?: boolean
    value: string
    count?: number
  }>
  stats: {
    additions: number
    deletions: number
  }
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 编辑器相关类型
export interface EditorSettings {
  theme: 'light' | 'dark'
  fontSize: number
  wordWrap: 'on' | 'off'
  language: string
  autoSave: boolean
  showMinimap: boolean
  showLineNumbers: boolean
  showWhitespace: boolean
}

// 表单数据类型
export interface CreateProjectData {
  name: string
  description?: string
}

export interface CreateBranchData {
  name: string
  sourceCommitId?: string
}

export interface CreateCommitData {
  message: string
  content: string
}

// 组件Props类型
export interface ProjectCardProps {
  project: Project
  onProjectDeleted: () => void
}

export interface BranchCardProps {
  branch: Branch
  onBranchDeleted: () => void
}

export interface CommitItemProps {
  commit: Commit
  onRevert: (commitId: string) => void
}

// 错误类型
export interface ApiError {
  message: string
  status: number
  code?: string
}
