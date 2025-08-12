# 🔧 故障排除指南

## 常见问题和解决方案

### 1. 环境配置问题

#### 问题：`DATABASE_URL` 未定义
```
Error: Environment variable "DATABASE_URL" is not defined
```

**解决方案：**
1. 确保已创建 `.env.local` 文件
2. 复制 `env.example` 到 `.env.local`
3. 配置正确的数据库连接字符串

```bash
cp env.example .env.local
```

#### 问题：数据库连接失败
```
Error: Can't reach database server
```

**解决方案：**
1. 检查数据库服务是否运行
2. 验证连接字符串格式
3. 使用SQLite（推荐开发环境）：
```env
DATABASE_URL="file:./dev.db"
```

### 2. Prisma 相关问题

#### 问题：Prisma 客户端未生成
```
Error: @prisma/client did not initialize yet
```

**解决方案：**
```bash
npm run db:generate
npm run db:push
```

#### 问题：数据库模式不同步
```
Error: Database schema is not in sync
```

**解决方案：**
```bash
# 重置数据库
npm run db:push --force-reset
# 或创建迁移
npm run db:migrate
```

### 3. Monaco编辑器问题

#### 问题：编辑器无法加载
```
Error: Failed to load Monaco Editor
```

**解决方案：**
1. 检查网络连接
2. 清除浏览器缓存
3. 确保webpack配置正确

#### 问题：编辑器主题不工作
**解决方案：**
- 刷新页面
- 检查本地存储设置
- 重置编辑器设置

### 4. 构建问题

#### 问题：TypeScript 类型错误
```
Type error: Property 'xxx' does not exist
```

**解决方案：**
```bash
# 重新生成类型
npm run db:generate
# 检查tsconfig.json配置
npm run build
```

#### 问题：依赖版本冲突
```
Error: Conflicting peer dependencies
```

**解决方案：**
```bash
# 清除依赖重新安装
rm -rf node_modules package-lock.json
npm install
```

### 5. 运行时错误

#### 问题：API 端点返回 500 错误
**解决方案：**
1. 检查服务器日志
2. 验证数据库连接
3. 检查 API 路由参数

#### 问题：组件渲染失败
**解决方案：**
1. 检查浏览器控制台错误
2. 验证组件 props 类型
3. 确认数据格式正确

### 6. 性能问题

#### 问题：页面加载缓慢
**解决方案：**
1. 检查数据库查询性能
2. 使用浏览器开发者工具分析
3. 考虑添加索引

#### 问题：Monaco编辑器卡顿
**解决方案：**
1. 减少文档大小
2. 调整编辑器配置
3. 禁用不必要的功能

## 调试技巧

### 1. 启用详细日志
```env
# .env.local
DATABASE_LOGGING=true
NEXT_PUBLIC_DEBUG=true
```

### 2. 使用健康检查
访问 `/api/health` 检查系统状态

### 3. 数据库调试
```bash
# 打开 Prisma Studio
npm run db:studio

# 查看数据库结构
npx prisma db pull
```

### 4. 浏览器调试
- 打开开发者工具
- 检查网络请求
- 查看本地存储数据

## 获取帮助

如果遇到无法解决的问题：

1. 检查项目 Issues
2. 搜索相关错误信息
3. 提供详细的错误日志和环境信息

## 清理和重置

### 完全重置项目
```bash
# 删除数据库
rm -f dev.db dev.db-journal

# 清除依赖
rm -rf node_modules package-lock.json

# 重新安装和设置
npm install
npm run db:push
npm run db:seed
```

### 重置用户设置
在浏览器中清除本地存储：
```javascript
// 在浏览器控制台执行
localStorage.clear()
```
