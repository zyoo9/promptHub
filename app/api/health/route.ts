import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    version: '1.0.0',
    environment: env.NODE_ENV,
    checks: {
      database: { status: 'unknown', message: '', responseTime: 0 },
      server: { status: 'healthy', message: 'Server is running' },
      dependencies: { status: 'unknown', critical: [], warnings: [] }
    }
  }

  try {
    // 数据库健康检查
    const dbStart = Date.now()
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1 as test`
    const dbResponseTime = Date.now() - dbStart
    
    checks.checks.database = {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime: dbResponseTime
    }

    // 依赖检查
    const critical = []
    const warnings = []

    // 检查环境变量
    if (!process.env.DATABASE_URL) {
      critical.push('DATABASE_URL not configured')
    }
    
    if (!process.env.NEXTAUTH_SECRET) {
      warnings.push('NEXTAUTH_SECRET not configured')
    }

    // 检查数据库表
    try {
      const projectCount = await prisma.project.count()
      checks.checks.dependencies = {
        status: critical.length === 0 ? 'healthy' : 'unhealthy',
        critical,
        warnings: [...warnings, `Found ${projectCount} projects in database`]
      }
    } catch (error) {
      critical.push('Database tables not accessible')
      checks.checks.dependencies = {
        status: 'unhealthy',
        critical,
        warnings
      }
    }

    // 整体状态
    const hasUnhealthyChecks = Object.values(checks.checks).some(
      check => check.status === 'unhealthy'
    )
    
    checks.status = hasUnhealthyChecks ? 'unhealthy' : 'healthy'

    const statusCode = checks.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(checks, { status: statusCode })

  } catch (error) {
    console.error('Health check failed:', error)
    
    checks.checks.database = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
      responseTime: 0
    }
    
    checks.status = 'unhealthy'
    
    return NextResponse.json(checks, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}
