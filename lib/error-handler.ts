import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export class AppError extends Error {
  public statusCode: number
  public code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // 自定义应用错误
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  // Prisma 错误处理
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: '该记录已存在，请检查唯一性约束', code: 'DUPLICATE_ERROR' },
          { status: 400 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: '记录不存在', code: 'NOT_FOUND' },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          { error: '违反外键约束', code: 'FOREIGN_KEY_ERROR' },
          { status: 400 }
        )
      case 'P2014':
        return NextResponse.json(
          { error: '操作违反了必需关系约束', code: 'RELATION_ERROR' },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          { error: '数据库操作失败', code: 'DATABASE_ERROR' },
          { status: 500 }
        )
    }
  }

  // Prisma 验证错误
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: '数据验证失败，请检查输入参数', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // JSON 解析错误
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return NextResponse.json(
      { error: '请求数据格式错误', code: 'INVALID_JSON' },
      { status: 400 }
    )
  }

  // 网络超时错误
  if (error instanceof Error && error.message.includes('timeout')) {
    return NextResponse.json(
      { error: '请求超时，请稍后重试', code: 'TIMEOUT_ERROR' },
      { status: 408 }
    )
  }

  // 默认错误
  const message = error instanceof Error ? error.message : '服务器内部错误'
  return NextResponse.json(
    { error: message, code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

// 输入验证工具
export function validateRequired<T>(data: T, fields: (keyof T)[]): void {
  for (const field of fields) {
    const value = data[field]
    if (value === undefined || value === null || 
        (typeof value === 'string' && value.trim().length === 0)) {
      throw new AppError(`字段 ${String(field)} 是必需的`, 400, 'MISSING_FIELD')
    }
  }
}

export function validateStringLength(
  value: string, 
  fieldName: string, 
  min: number = 0, 
  max: number = Infinity
): void {
  const length = value.trim().length
  if (length < min) {
    throw new AppError(`${fieldName}长度不能少于${min}个字符`, 400, 'TOO_SHORT')
  }
  if (length > max) {
    throw new AppError(`${fieldName}长度不能超过${max}个字符`, 400, 'TOO_LONG')
  }
}

export function validateUUID(value: string, fieldName: string = '标识符'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(value)) {
    throw new AppError(`${fieldName}格式无效`, 400, 'INVALID_UUID')
  }
}

// 异步错误处理装饰器
export function asyncHandler(
  fn: (req: Request, context: any) => Promise<NextResponse>
) {
  return async (req: Request, context: any): Promise<NextResponse> => {
    try {
      return await fn(req, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
