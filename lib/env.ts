// 环境变量验证和配置

interface EnvConfig {
  DATABASE_URL: string
  NODE_ENV: 'development' | 'production' | 'test'
  PORT?: string
  NEXTAUTH_URL?: string
  NEXTAUTH_SECRET?: string
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = ['DATABASE_URL']
  const missingVars: string[] = []

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `缺少必需的环境变量: ${missingVars.join(', ')}\n` +
      '请创建 .env.local 文件并配置这些变量。\n' +
      '参考 .env.example 文件了解所需的配置。'
    )
  }

  // 验证数据库URL格式
  const databaseUrl = process.env.DATABASE_URL!
  if (!databaseUrl.startsWith('file:') && 
      !databaseUrl.startsWith('mysql:') && 
      !databaseUrl.startsWith('postgresql:')) {
    throw new Error(
      'DATABASE_URL 格式无效。支持的格式:\n' +
      '- SQLite: file:./dev.db\n' +
      '- MySQL: mysql://user:password@host:port/database\n' +
      '- PostgreSQL: postgresql://user:password@host:port/database'
    )
  }

  const nodeEnv = process.env.NODE_ENV as any
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    console.warn('NODE_ENV 未设置或无效，默认使用 development')
  }

  return {
    DATABASE_URL: databaseUrl,
    NODE_ENV: nodeEnv || 'development',
    PORT: process.env.PORT,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }
}

// 导出验证后的环境配置
export const env = validateEnv()

// 导出一些有用的判断函数
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// 数据库连接状态检查
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { prisma } = await import('./db')
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

// 启动检查
export async function performStartupChecks(): Promise<void> {
  console.log('🔍 执行启动检查...')
  
  // 检查环境变量
  try {
    validateEnv()
    console.log('✅ 环境变量验证通过')
  } catch (error) {
    console.error('❌ 环境变量验证失败:', error)
    throw error
  }

  // 检查数据库连接
  const dbConnected = await checkDatabaseConnection()
  if (!dbConnected) {
    throw new Error('数据库连接失败，请检查配置')
  }

  console.log('🎉 所有启动检查通过!')
}
