'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Folder, 
  GitBranch, 
  Settings, 
  User, 
  Sparkles,
  Activity,
  BarChart3
} from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export function Navigation() {
  const pathname = usePathname()
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: '首页', href: '/', icon: <Home className="h-4 w-4" /> }
    ]

    if (segments.length === 0) return breadcrumbs

    if (segments[0] === 'projects') {
      if (segments.length === 1) {
        breadcrumbs.push({ label: '项目', icon: <Folder className="h-4 w-4" /> })
      } else {
        breadcrumbs.push({ label: '项目', href: '/', icon: <Folder className="h-4 w-4" /> })
        
        if (segments.length >= 2) {
          const projectId = segments[1]
          breadcrumbs.push({ 
            label: decodeURIComponent(projectId), 
            href: `/projects/${projectId}`,
            icon: <Folder className="h-4 w-4" />
          })
        }
        
        if (segments.length >= 4 && segments[2] === 'branches') {
          const branchName = decodeURIComponent(segments[3])
          breadcrumbs.push({ 
            label: branchName, 
            icon: <GitBranch className="h-4 w-4" />
          })
        }
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">PromptHub</h1>
                <p className="text-xs text-muted-foreground -mt-1">提示词管理平台</p>
              </div>
            </Link>

            {/* Breadcrumb Navigation */}
            <nav aria-label="面包屑导航" className="hidden md:flex">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-muted-foreground">/</span>
                    )}
                    {crumb.href ? (
                      <Link 
                        href={crumb.href}
                        className="flex items-center space-x-1 text-sm hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-muted"
                      >
                        {crumb.icon}
                        <span>{crumb.label}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center space-x-1 text-sm text-muted-foreground px-2 py-1">
                        {crumb.icon}
                        <span>{crumb.label}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick Nav */}
            <div className="hidden lg:flex items-center space-x-3 mr-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                在线
              </Badge>
              <Link href="/templates">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden xl:inline">模板</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden xl:inline">统计</span>
              </Button>
            </div>

            {/* User Actions */}
            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0">
              <User className="h-4 w-4" />
              <span className="sr-only">用户菜单</span>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
              <span className="sr-only">设置</span>
            </Button>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
