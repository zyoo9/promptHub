# ✨ PromptHub - 智能提示词版本管理平台

<div align="center">

![PromptHub](https://img.shields.io/badge/PromptHub-v2.0-purple?style=for-the-badge&logo=sparkles)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**一个现代化的提示词版本管理平台，让AI协作变得井井有条**

[🚀 快速开始](#-快速开始) • [📖 使用文档](#-功能特性) • [🏗️ 系统架构](#️-系统架构) • [🤝 贡献指南](#-贡献指南)

</div>

---

## 🌟 项目亮点

PromptHub 是一个专为 AI 时代设计的提示词管理平台，采用类似 Git 的三层版本控制结构：**项目 → 分支 → 版本**。无需复杂配置，开箱即用，让团队协作和版本管理变得简单高效。

### 💡 为什么选择 PromptHub？

- 🎯 **专业版本控制**: Git-like 工作流，熟悉的分支管理体验
- 🎨 **现代化 UI**: 渐变设计、暗色模式、玻璃态效果
- ⚡ **Monaco 编辑器**: 专业级代码编辑体验，支持语法高亮
- 📱 **响应式设计**: 完美适配桌面端、平板、手机
- 🔍 **智能搜索**: 实时搜索、标签过滤、高级筛选
- 📊 **数据仪表板**: 直观的项目统计和活动追踪
- 🎁 **模板系统**: 内置6大类精选提示词模板

---

## 🎯 功能特性

### 📋 项目管理
- ✅ 创建、编辑、删除项目
- ✅ 项目描述和标签管理
- ✅ 项目统计和活动追踪
- ✅ 智能搜索和过滤

### 🌳 分支管理
- ✅ 创建、切换、删除分支
- ✅ 默认分支设置
- ✅ 分支状态可视化
- ✅ 基于提交创建分支

### 📝 版本控制
- ✅ Git-like 提交机制
- ✅ 完整的版本历史
- ✅ 版本差异对比
- ✅ 一键回滚功能
- ✅ 提交哈希验证

### ⚡ 高级编辑器
- ✅ Monaco Editor 集成
- ✅ 语法高亮和代码补全
- ✅ 实时预览功能
- ✅ 自动保存机制
- ✅ 全屏编辑模式
- ✅ 快捷键支持
- ✅ 主题切换（浅色/深色）
- ✅ 导入导出功能

### 🎨 用户体验
- ✅ 现代化渐变设计
- ✅ 暗色模式支持
- ✅ 玻璃态效果
- ✅ 响应式布局
- ✅ 加载动画和过渡效果
- ✅ 无障碍设计支持

### 📊 数据洞察
- ✅ 项目统计仪表板
- ✅ 活动时间线
- ✅ 趋势分析
- ✅ 使用情况跟踪

### 🎁 模板系统
- ✅ 6大类别专业模板
- ✅ 内容创作、编程开发
- ✅ 商业策略、创意设计
- ✅ 教育学习、效率提升
- ✅ 一键复制和使用

---

## 🏗️ 系统架构

### 架构图

```mermaid
graph TB
    subgraph "用户界面层"
        A[项目仪表板] --> B[项目管理]
        A --> C[模板库]
        B --> D[分支管理]
        D --> E[代码编辑器]
        D --> F[版本历史]
    end
    
    subgraph "业务逻辑层"
        G[项目服务] --> H[分支服务]
        H --> I[提交服务]
        G --> J[模板服务]
        I --> K[差异对比]
    end
    
    subgraph "数据持久层"
        L[(Projects表)]
        M[(Branches表)]
        N[(Commits表)]
        L --> M
        M --> N
    end
    
    A --> G
    B --> G
    C --> J
    D --> H
    E --> I
    F --> I
    
    G --> L
    H --> M
    I --> N
    K --> N
```

### 技术栈

#### 🎨 前端技术
```bash
Next.js 14 (App Router)     # React 全栈框架
TypeScript 5.0              # 类型安全
Tailwind CSS 3.4            # 原子化 CSS
Shadcn/ui                    # 高质量组件库
Monaco Editor                # 专业代码编辑器
Lucide React                 # 现代图标库
Zustand                      # 状态管理
React Hook Form              # 表单管理
```

#### ⚙️ 后端技术
```bash
Next.js API Routes           # 服务端 API
Prisma ORM                   # 数据库 ORM
MySQL 8.0+                   # 关系型数据库
TypeScript                   # 后端类型安全
```

#### 🛠️ 开发工具
```bash
ESLint + Prettier           # 代码规范
Husky                        # Git Hooks
Jest + Testing Library       # 单元测试
Playwright                   # E2E 测试
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- MySQL 8.0+ (推荐) 或 SQLite (开发环境)
- npm/yarn/pnpm

### 一键启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd promptHub

# 2. 安装依赖
npm install

# 3. 环境配置
cp env.example .env.local
# 编辑 .env.local 配置数据库连接

# 4. 数据库初始化
npm run db:generate
npm run db:push
npm run db:seed

# 5. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

### Docker 快速启动

```bash
# 使用 Docker Compose 一键启动
docker-compose up -d

# 查看服务状态
docker-compose ps
```

---

## 📁 项目结构

```
promptHub/
├── 📱 app/                    # Next.js App Router
│   ├── 🔌 api/               # API 路由层
│   │   ├── projects/         # 项目管理 API
│   │   ├── health/           # 健康检查
│   │   └── ...
│   ├── 🏠 (pages)/           # 页面路由
│   │   ├── page.tsx          # 首页
│   │   ├── templates/        # 模板页面
│   │   └── projects/         # 项目页面
│   ├── 🎨 globals.css        # 全局样式
│   └── 📐 layout.tsx         # 根布局
├── 🧩 components/            # React 组件
│   ├── 🎯 ui/               # 基础 UI 组件
│   ├── 📊 dashboard-stats.tsx
│   ├── 🔍 advanced-search.tsx
│   ├── 📝 monaco-prompt-editor.tsx
│   ├── 🎁 prompt-templates.tsx
│   └── ...
├── 🔧 lib/                  # 工具函数
│   ├── 🗄️ db.ts            # 数据库连接
│   ├── 🛠️ utils.ts         # 通用工具
│   ├── 🏪 store.ts         # 状态管理
│   └── 🔒 env.ts           # 环境变量
├── 🗃️ prisma/              # 数据库相关
│   ├── 📋 schema.prisma    # 数据库模式
│   └── 🌱 seed.ts         # 种子数据
├── 🔧 database/            # 数据库脚本
│   └── 🏗️ init.sql        # 初始化脚本
├── 📄 types/               # TypeScript 类型
└── 📚 docs/                # 文档文件
    ├── 🚀 STARTUP_GUIDE.md
    ├── 🔧 TROUBLESHOOTING.md
    └── 🏗️ 技术设计文档.md
```

---

## 🗄️ 数据库设计

### 核心表结构

```sql
-- 项目表
Projects (id, name, description, default_branch, created_at, updated_at)
    ↓ 1:N
-- 分支表  
Branches (id, name, project_id, is_default, last_commit_id, created_at)
    ↓ 1:N
-- 提交表
Commits (id, message, content, branch_id, parent_commit_id, commit_hash, created_at)
```

### 关系图

```
Projects ||--o{ Branches : contains
Branches ||--o{ Commits : contains  
Commits }o--|| Commits : parent_of
```

---

## 🛠️ 开发指南

### 开发命令

```bash
# 🚀 开发服务器
npm run dev

# 🏗️ 构建项目
npm run build

# ▶️ 生产服务器
npm start

# 🔍 代码检查
npm run lint

# 🗄️ 数据库操作
npm run db:generate    # 生成 Prisma 客户端
npm run db:push        # 推送模式到数据库
npm run db:migrate     # 运行数据库迁移
npm run db:studio      # 打开 Prisma Studio
npm run db:seed        # 播种示例数据
npm run db:reset       # 重置数据库

# 🧪 测试
npm run test           # 运行测试
npm run test:e2e       # E2E 测试
npm run test:coverage  # 测试覆盖率
```

### 环境配置

```env
# .env.local
DATABASE_URL="mysql://root:password@localhost:3306/prompthub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# 可选配置
DATABASE_LOGGING=true
NEXT_PUBLIC_DEBUG=true
```

### 代码规范

- ✅ TypeScript 严格模式
- ✅ ESLint + Prettier 自动格式化
- ✅ Conventional Commits 提交规范
- ✅ Husky Git Hooks 检查

---

## 🎨 设计系统

### 颜色主题

```css
/* 主色调 - 渐变紫 */
--primary: 262.1 83.3% 57.8%
--gradient-from: 262.1 83.3% 57.8%
--gradient-to: 221.2 83.2% 53.3%

/* 功能色彩 */
--success: 142.1 70.6% 45.3%
--warning: 45.4 93.4% 47.5%
--destructive: 0 84.2% 60.2%
--info: 217.2 91.2% 59.8%
```

### 设计原则

- 🎨 **现代化设计**: 渐变、阴影、动画效果
- 🌙 **暗色模式**: 完整的明暗主题支持
- 📱 **响应式**: 移动优先的设计理念
- ♿ **无障碍**: 支持屏幕阅读器和键盘导航
- ⚡ **性能优先**: 优化动画和加载体验

---

## 🧪 测试策略

### 测试金字塔

```
     E2E 测试 (10%)
   ↗               ↖
集成测试 (20%)    组件测试 (20%)  
   ↗                       ↖
        单元测试 (50%)
```

### 测试工具

- **单元测试**: Jest + React Testing Library
- **组件测试**: Storybook + Chromatic
- **集成测试**: Supertest + MSW
- **E2E 测试**: Playwright
- **性能测试**: Lighthouse CI

---

## 🚀 部署指南

### 生产环境部署

```bash
# 1. 构建项目
npm run build

# 2. 启动生产服务器
npm start

# 3. 使用 PM2 进程管理
pm2 start ecosystem.config.js
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 环境推荐

- **开发环境**: Vercel / Netlify
- **生产环境**: AWS / 阿里云 / 腾讯云
- **数据库**: PlanetScale / AWS RDS
- **CDN**: Cloudflare / AWS CloudFront

---

## 📊 性能优化

### 前端优化

- ⚡ **代码分割**: 路由级懒加载
- 🗄️ **数据缓存**: SWR/React Query
- 🖼️ **图片优化**: Next.js Image 组件
- 📦 **Bundle 分析**: 依赖分析和优化

### 后端优化

- 🔍 **数据库索引**: 查询性能优化
- 💾 **缓存策略**: Redis 热点数据缓存
- 📄 **API 优化**: 分页、压缩、预加载
- 📈 **监控告警**: 性能指标跟踪

---

## 🔐 安全措施

### 数据安全

- 🛡️ **输入验证**: 严格的参数校验
- 🔒 **SQL 注入防护**: Prisma ORM 参数化查询  
- 🌐 **XSS 防护**: 输入转义和 CSP
- 🔐 **CSRF 防护**: Token 验证机制

### 隐私保护

- 📊 **数据加密**: 敏感数据加密存储
- 🗄️ **备份策略**: 定期数据备份
- 📋 **审计日志**: 操作记录追踪
- 🔒 **访问控制**: 基于角色的权限管理

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 参与方式

1. 🍴 **Fork** 项目到你的 GitHub
2. 🌿 **创建** 功能分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 **提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. 🔀 **开启** Pull Request

### 开发规范

- 📝 使用 [Conventional Commits](https://conventionalcommits.org/) 规范
- 🧪 确保测试通过
- 📖 更新相关文档
- 🎨 遵循代码风格指南

---

## 📋 开发路线图

### ✅ 已完成 (v2.0)

- [x] 🎨 现代化 UI 设计升级
- [x] 🌙 暗色模式支持
- [x] 🧭 智能导航和面包屑
- [x] 📊 数据仪表板和统计
- [x] 🔍 高级搜索功能
- [x] 📱 移动端响应式优化
- [x] 🎁 提示词模板系统

### 🚧 开发中 (v2.1)

- [ ] 👥 多用户协作功能
- [ ] 💬 评论和讨论系统
- [ ] 🔗 分享链接生成
- [ ] 📊 更丰富的数据分析

### 🎯 计划中 (v3.0)

- [ ] 🤖 AI 辅助编写提示词
- [ ] 🔌 第三方 API 集成测试
- [ ] 📱 移动端 PWA 应用
- [ ] 🌐 多语言国际化支持

---

## 📚 相关资源

### 官方文档

- [📖 技术设计文档](./技术设计文档.md) - 完整的架构设计
- [🚀 启动指南](./STARTUP_GUIDE.md) - 详细的部署说明
- [🔧 故障排除](./TROUBLESHOOTING.md) - 常见问题解决

### 技术文档

- [Next.js 14](https://nextjs.org/docs) - React 全栈框架
- [Prisma](https://www.prisma.io/docs) - 现代数据库工具包
- [Tailwind CSS](https://tailwindcss.com/docs) - CSS 框架
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器

### 社区支持

- 💬 [GitHub Discussions](https://github.com/your-username/prompthub/discussions) - 技术讨论
- 🐛 [Issue Tracker](https://github.com/your-username/prompthub/issues) - 问题反馈
- 📧 [联系我们](mailto:support@prompthub.dev) - 商务合作

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 详情请查看 LICENSE 文件。

---

## 🙏 致谢

感谢所有贡献者和以下开源项目：

- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [Prisma](https://www.prisma.io/) - 现代化数据库工具包  
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - 精美的组件库
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code 编辑器内核
- [Lucide](https://lucide.dev/) - 精美的图标库

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个星标！**

Made with ❤️ by PromptHub Team

[🏠 主页](https://prompthub.dev) • [📧 邮箱](mailto:hi@prompthub.dev) • [🐦 Twitter](https://twitter.com/prompthub)

</div>