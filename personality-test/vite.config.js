import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const deepseekApiKey = env.DEEPSEEK_API_KEY || ''

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api/deepseek': {
          target: 'https://api.deepseek.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/deepseek/, '/v1/chat/completions'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Use API key from request header first, fall back to env var
              const apiKey = req.headers['x-api-key'] || deepseekApiKey
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`)
              }
              proxyReq.removeHeader('x-api-key')
            })
          },
        },
      },
    },
  }
})
