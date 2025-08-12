/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Monaco编辑器相关配置
  webpack: (config) => {
    // 解决Monaco编辑器的webpack问题
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    })
    
    return config
  },
  // 支持Monaco编辑器的worker（仅在生产环境启用严格CORS）
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (!isProduction) {
      return []
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
