/**
 * Vercel Serverless 函数 — DeepSeek API 代理
 *
 * 前端调用 POST /api/deepseek，此函数读取服务端环境变量 DEEPSEEK_API_KEY，
 * 转发到 DeepSeek API 并返回结果。用户无需输入 Key。
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
