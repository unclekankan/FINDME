/**
 * DeepSeek API 调用工具
 */

const API_URL = '/api/deepseek'

/**
 * 调用 DeepSeek API
 * 开发环境：Vite proxy 用 .env 中的 key
 * 生产环境：Vercel serverless function 用环境变量中的 key
 * 用户无需输入 Key
 */
export async function callDeepSeek(messages, opts = {}) {
  const body = {
    model: 'deepseek-chat',
    messages,
    temperature: opts.temperature ?? 0.85,
    max_tokens: opts.maxTokens ?? 1200,
    stream: false,
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`API 错误 (${res.status}): ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function extractJson(text) {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  let raw = codeBlock ? codeBlock[1].trim() : text.trim()
  const braceStart = raw.indexOf('{')
  const braceEnd = raw.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd > braceStart) raw = raw.slice(braceStart, braceEnd + 1)

  try { return JSON.parse(raw) } catch {}

  // 修复常见 AI 生成的 JSON 格式问题
  raw = raw
    .replace(/(?<=:\s*")([^"]*?)\n([^"]*?)(?=")/g, '$1\\n$2')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/"\s+"/g, '", "')
    .replace(/}(\s*\n\s*){/g, '},{')

  return JSON.parse(raw)
}

// ==================== 年代/曲库约束 ====================

/** 年代范围及其配额 (15轮=30首歌) */
const ERA_QUOTAS = [
  { era: '1990年代及更早（经典老歌）', range: '<2000', weight: 6 },
  { era: '2000年代', range: '2000-2009', weight: 7 },
  { era: '2010年代', range: '2010-2019', weight: 9 },
  { era: '2020年代', range: '2020-2025', weight: 8 },
]

/** 语言/地区配额：15轮30首歌 */
const LANG_QUOTAS = [
  { lang: '华语（中文）', weight: 12 },
  { lang: '欧美（英文）', weight: 13 },
  { lang: '日韩', weight: 5 },
]

const NEXT_PAIR_SYSTEM = `你是网易云音乐/QQ音乐级别曲库的专业音乐品味评估师。你要根据用户之前的选择，推荐下一对真实存在的知名歌曲。

【核心规则】
1. 两首歌必须差异显著，能揭示用户的真实品味倾向
2. 每轮测试一个不同维度：主流/小众 | 复杂/简约 | 情感/技术 | 怀旧/前卫 | 人声/器乐 | 节奏/旋律
3. 所有歌曲必须是真实存在的知名歌曲（在 Apple Music / iTunes / 网易云上都能搜到）
4. 语言要混合，每轮最好一中一外对比，或者不同语种对比
5. 歌曲名用原语言（英文歌写英文，中文歌写中文，日韩写原文），歌手写全名
6. 年份必须准确

【严禁重复】绝对不能出现之前任何一轮中已经出现过的歌曲！

【年代均匀分布（15轮=30首歌的总体分布）】
- 5-6首 1990年代及更早的经典老歌
- 6-7首 2000年代的歌曲
- 8-9首 2010年代的歌曲
- 7-8首 2020年代的歌曲
每个年代至少出现3首，均匀穿插，不要集中在某一端。

【语言均匀分布（总计30首歌）】
- 12-13首华语歌曲（周杰伦、林俊杰、陈奕迅、邓紫棋、五月天、孙燕姿、王菲、蔡依林、陶喆、方大同、李荣浩、郭顶、告五人、草东、万能青年旅店、刺猬、新裤子等）
- 13-14首欧美歌曲（Taylor Swift, Ed Sheeran, The Weeknd, Billie Eilish, Bruno Mars, Adele, Coldplay, Kendrick Lamar, Dua Lipa, Olivia Rodrigo 等）
- 4-5首日韩歌曲（BTS, Blackpink, 米津玄师, 椎名林檎, YOASOBI, Official髭男dism, TWICE, NewJeans 等）

【重要】返回纯 JSON，不要 markdown 包裹，确保格式完全正确（字符串内不要有换行，数组用逗号分隔）：
{"songA":{"title":"歌名","artist":"歌手","year":"年份","reason":"原因"},"songB":{"title":"歌名","artist":"歌手","year":"年份","reason":"原因"},"dimension":"维度标签"}`

/**
 * 生成下一对歌曲
 * @param {{round: number, chosen: string, songA: {title,artist,year}, songB: {title,artist,year}}[]} history
 * @param {number} round
 * @param {{eraCounts: object, langCounts: object}} roundStats
 */
export async function generateNextPair(history, round, roundStats = {}) {
  // 收集所有已出现过的歌曲
  const allSongs = new Set()
  const usedEras = {}
  const usedLangs = { '华语': 0, '欧美': 0, '日韩': 0 }

  for (const h of history) {
    if (h.songA) allSongs.add(`《${h.songA.title}》- ${h.songA.artist}`)
    if (h.songB) allSongs.add(`《${h.songB.title}》- ${h.songB.artist}`)
  }

  for (const [era, count] of Object.entries(roundStats.eraCounts || {})) {
    usedEras[era] = count
  }
  for (const [lang, count] of Object.entries(roundStats.langCounts || {})) {
    usedLangs[lang] = count
  }

  // 计算还需要补充的年代/语言
  const eraInfo = ERA_QUOTAS.map(e => `${e.era}（已出现${usedEras[e.range] || 0}首）`).join('；')
  const langInfo = LANG_QUOTAS.map(l => `${l.lang}（已出现${usedLangs[l.lang] || 0}首）`).join('；')

  const historyText = history
    .map((h, i) => {
      const pick = h.chosen === 'A' ? h.songA : h.songB
      const discard = h.chosen === 'A' ? h.songB : h.songA
      return `第${i + 1}轮选了《${pick.title}》${pick.artist}(${pick.year})，放弃《${discard.title}》${discard.artist}(${discard.year})`
    })
    .join('\n')

  const forbidden = allSongs.size > 0
    ? `\n【🚫 已出现过的歌曲，绝对不要重复推荐以下任何一首】\n${[...allSongs].join('\n')}`
    : ''

  const userMsg = history.length === 0
    ? `第一轮测试。请推荐一对差异明显的歌曲（一中一外），帮我初步了解用户的品味。\n当前各年代计数：${eraInfo}\n当前各语言计数：${langInfo}`
    : `用户选择历史：\n${historyText}\n\n推荐第${round}对歌曲。${forbidden}\n\n当前各年代计数（需要均匀分布）：${eraInfo}\n当前各语言计数（需要均匀分布）：${langInfo}`

  const text = await callDeepSeek([
    { role: 'system', content: NEXT_PAIR_SYSTEM },
    { role: 'user', content: userMsg },
  ], { maxTokens: 800 })

  return extractJson(text)
}

// ==================== 最终评估（保持不变） ====================

const EVAL_SYSTEM = `你是一个严厉、客观的音乐评论家。你的任务是分析用户在一场音乐品味测试中的所有选择，给出一个不留情面的、客观理性的评价。

评价准则：
- 不要一味夸赞，要指出真实的问题
- 品味没有绝对的好坏，但有深度、广度、一致性等维度可以评判
- 评分标准：1-3分=品味较差，4-5分=偏窄或随大流，6-7分=有一定见解，8-9分=品味出色，10分=极具个性且自洽
- 根据用户的选择模式给出真实的评价

【重要】返回纯 JSON，不要 markdown 包裹，字符串内不要有换行，数组用逗号分隔：
{"score":5,"tasteLabel":"品味标签","summary":"一句话总结","analysis":"详细分析","strengths":["优点"],"weaknesses":["缺点"],"recommendations":[{"artist":"歌手","song":"歌曲","why":"理由"}],"musicPersonality":"音乐人格类比"}`

export async function generateFinalEvaluation(history) {
  const historyText = history
    .map((h, i) => {
      const pick = h.chosen === 'A' ? h.songA : h.songB
      const discard = h.chosen === 'A' ? h.songB : h.songA
      return `第${i + 1}轮选了《${pick.title}》${pick.artist}(${pick.year})，放弃《${discard.title}》${discard.artist}(${discard.year})`
    })
    .join('\n')

  const text = await callDeepSeek([
    { role: 'system', content: EVAL_SYSTEM },
    { role: 'user', content: `以下是用户在15轮音乐品味测试中的全部选择：\n\n${historyText}\n\n请给出客观、犀利的品味评估。` },
  ], { temperature: 0.9, maxTokens: 2000 })

  return extractJson(text)
}
