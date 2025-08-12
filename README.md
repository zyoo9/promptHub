# PromptHub - 提示词版本管理平台

一个简化的提示词版本管理平台，采用三层结构：**项目 → 分支 → 版本**。无需用户注册登录，支持随意创建项目和分支，每个分支独立进行版本管理。

## 🎯 功能特性

- **项目管理**: 创建、删除、重命名项目
- **分支管理**: 在项目下创建、删除、切换分支  
- **版本控制**: 分支内的提交、历史记录、回滚功能
- **可视化**: 分支图、提交历史、差异对比
- **按钮操作**: 所有操作都通过UI按钮完成
- **本地存储**: 所有数据存储在本地，无需账户

## 🛠️ 技术栈

- **前端**: Next.js 14 + React + TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **数据库**: MySQL + Prisma ORM
- **状态管理**: Zustand (后续添加)
- **图标**: Lucide React

## 🚀 快速开始

### 1. 环境准备

确保你的系统已安装：
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 2. 克隆项目

```bash
git clone <repository-url>
cd promptHub
```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
```

### 4. 环境配置

创建 `.env.local` 文件（可以复制 `.env.example`）：

```bash
# 数据库连接
DATABASE_URL="mysql://root:password@localhost:3306/prompthub_dev"

# Next.js 配置  
NEXTAUTH_SECRET="prompthub-dev-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. 数据库设置

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库模式（开发环境）
npm run db:push

# 或者使用迁移（推荐生产环境）
npm run db:migrate

# 播种示例数据
npm run db:seed
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📂 项目结构

```
promptHub/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── projects/      # 项目管理 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── create-project-dialog.tsx
│   └── project-card.tsx
├── lib/                  # 工具函数
│   ├── db.ts            # 数据库连接
│   └── utils.ts         # 通用工具
├── prisma/              # 数据库相关
│   ├── schema.prisma    # 数据库模式
│   └── seed.ts         # 种子数据
└── 技术设计文档.md      # 完整技术文档
```

## 🗄️ 数据库结构

### 核心表

- **projects**: 项目信息
- **branches**: 分支信息  
- **commits**: 提交记录

### 关系

```
Projects ||--o{ Branches : contains
Branches ||--o{ Commits : contains  
Commits }o--|| Commits : parent_of
```

## 📝 API 接口

### 项目管理

- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/[id]` - 获取项目详情
- `PUT /api/projects/[id]` - 更新项目
- `DELETE /api/projects/[id]` - 删除项目

### 分支管理

- `GET /api/projects/[id]/branches` - 获取分支列表
- `POST /api/projects/[id]/branches` - 创建分支
- `GET /api/projects/[id]/branches/[name]` - 获取分支详情
- `GET /api/projects/[id]/branches/[name]/content` - 获取分支当前内容
- `DELETE /api/projects/[id]/branches/[name]` - 删除分支

### 版本管理

- `GET /api/projects/[id]/branches/[name]/commits` - 获取提交历史
- `POST /api/projects/[id]/branches/[name]/commits` - 创建提交
- `GET /api/projects/[id]/branches/[name]/commits/[id]` - 获取提交详情
- `POST /api/projects/[id]/branches/[name]/commits/[id]/revert` - 回滚版本
- `GET /api/projects/[id]/branches/[name]/commits/[id]/diff` - 获取差异对比

## 🛠️ 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库操作
npm run db:push      # 推送模式到数据库
npm run db:generate  # 生成 Prisma 客户端
npm run db:migrate   # 运行数据库迁移
npm run db:studio    # 打开 Prisma Studio
npm run db:seed      # 播种数据
```

## 📋 开发计划

### ✅ 第一阶段 (已完成)
- [x] 项目基础结构搭建
- [x] 数据库设计和 Prisma 配置
- [x] 项目管理 API 和 UI
- [x] 项目列表和创建功能

### ✅ 第二阶段 (已完成)
- [x] 分支管理功能
- [x] 提交和版本历史
- [x] 差异对比功能
- [x] 回滚操作
- [x] 项目详情页面
- [x] 分支详情页面
- [x] 提示词编辑器
- [x] 版本历史查看

### ✅ 第三阶段 (已完成)
- [x] Monaco 编辑器集成
- [x] 语法高亮和代码补全
- [x] 增强实时预览功能
- [x] 自动保存机制
- [x] 快捷键支持
- [x] 编辑器主题切换
- [x] 用户偏好设置
- [x] 内容结构分析
- [x] 导入导出功能

### 🎯 第四阶段 (未来)
- [ ] 性能优化
- [ ] 界面美化
- [ ] 错误处理完善
- [ ] 部署配置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [技术设计文档](./技术设计文档.md) - 完整的技术设计和架构说明
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
