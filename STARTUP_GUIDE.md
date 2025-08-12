# 🚀 PromptHub 启动指南

## 步骤1: 初始化MySQL数据库

### 1.1 确保MySQL服务运行
```bash
# 检查MySQL是否运行
sudo systemctl status mysql
# 或者 (macOS)
brew services list | grep mysql

# 如果没有运行，启动MySQL
sudo systemctl start mysql
# 或者 (macOS)
brew services start mysql
```

### 1.2 登录MySQL并创建数据库
```bash
# 登录MySQL
mysql -u root -p
# 输入密码: 12345678
```

在MySQL命令行中执行：
```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `prompthub` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 退出MySQL
EXIT;
```

### 1.3 执行初始化脚本
```bash
# 在项目根目录执行
mysql -u root -p prompthub < database/init.sql
# 输入密码: 12345678
```

## 步骤2: 配置项目

### 2.1 检查环境配置
确保 `env.local` 文件配置正确：
```env
DATABASE_URL="mysql://root:12345678@localhost:3306/prompthub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="prompthub-dev-secret-key-2024"
```

### 2.2 生成Prisma客户端
```bash
npm run db:generate
```

### 2.3 同步数据库模式（可选）
```bash
# 如果需要同步schema
npm run db:push
```

## 步骤3: 启动应用

### 3.1 启动开发服务器
```bash
npm run dev
```

### 3.2 访问应用
打开浏览器访问: http://localhost:3000

## 步骤4: 验证安装

### 4.1 检查数据库连接
访问: http://localhost:3000/api/health

应该看到类似这样的响应：
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful",
      "responseTime": 50
    },
    "server": {
      "status": "healthy",
      "message": "Server is running"
    }
  }
}
```

### 4.2 测试基本功能
1. 创建新项目
2. 创建分支
3. 编辑提示词
4. 提交版本
5. 查看历史

## 常见问题解决

### MySQL连接失败
```bash
# 检查MySQL是否运行
mysql -u root -p -e "SELECT 1;"

# 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES;" | grep prompthub
```

### 端口占用
```bash
# 检查3000端口是否被占用
lsof -i :3000

# 使用其他端口启动
PORT=3001 npm run dev
```

### 权限问题
```bash
# 确保有读写权限
chmod 755 .
chmod 644 env.local
```

## 其他有用命令

```bash
# 查看所有npm脚本
npm run

# 打开Prisma Studio管理数据库
npm run db:studio

# 重置数据库（小心使用）
mysql -u root -p -e "DROP DATABASE prompthub; CREATE DATABASE prompthub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p prompthub < database/init.sql

# 查看应用日志
npm run dev 2>&1 | tee app.log
```

## 成功启动的标志

当你看到以下输出时，说明启动成功：
```
✔ Ready in 3.2s
⚡ Server running on http://localhost:3000
🔗 Database connected successfully
✨ PromptHub is ready to use!
```

现在你可以开始使用PromptHub管理你的提示词了！🎉
