import { callDeepSeek } from './deepseek.js'

// ==================== Profile storage ====================

export function getPersonalityProfile() {
  try { return JSON.parse(sessionStorage.getItem('personality_profile')) } catch { return null }
}

export function setPersonalityProfile(data) {
  sessionStorage.setItem('personality_profile', JSON.stringify(data))
}

export function getMusicResult() {
  try { return JSON.parse(sessionStorage.getItem('music_taste_result')) } catch { return null }
}

export function hasBoth() {
  return !!(getPersonalityProfile() || getMusicResult() || getIQEQProfile())
}

// ==================== IQ / EQ ====================

export function getIQEQProfile() {
  try { return JSON.parse(sessionStorage.getItem('iqeq_profile')) } catch { return null }
}

export function setIQEQProfile(iq, eq) {
  sessionStorage.setItem('iqeq_profile', JSON.stringify({ iq, eq }))
}

// ==================== Export / Import ====================

export function exportProfile() {
  const p = getPersonalityProfile()
  const m = getMusicResult()
  const iqeq = getIQEQProfile()

  const payload = {
    v: 1,
    p: p ? { profile: p.profile, typeCode: p.typeCode } : null,
    m: m ? { score: m.score, tasteLabel: m.tasteLabel, summary: m.summary, strengths: m.strengths, musicPersonality: m.musicPersonality } : null,
    iq: iqeq?.iq ? { iq: iqeq.iq.iq, label: iqeq.iq.label, desc: iqeq.iq.desc } : null,
    eq: iqeq?.eq ? { pct: iqeq.eq.pct, label: iqeq.eq.label, desc: iqeq.eq.desc } : null,
    ts: Date.now(),
  }

  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function importProfile(code) {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())))
    return JSON.parse(json)
  } catch {
    return null
  }
}

// ==================== "他人眼中的我" ====================

const OTHERS_VIEW_SYSTEM = `你是一个犀利又幽默的人格分析师。根据用户的大五人格数据和音乐品味数据，生成一份"别人眼中的我"画像。

关键视角：
- 完全以第三人称"ta"来写
- 分三个场景：工作中、社交中、独处时，ta分别是什么样子
- 带一点朋友间调侃的语气，犀利但友善
- 指出ta自己可能没意识到的一面

IMPORTANT: Return pure JSON only (no markdown, no backticks):
{"work":"工作中ta...","social":"社交中ta...","alone":"独处时ta...","blindspot":"ta自己可能没意识到的盲点","firstImpression":"第一次见到ta的人会有的印象","nickname":"给ta起一个有趣的外号"}`

export async function generateOthersView() {
  const p = getPersonalityProfile()
  const m = getMusicResult()
  const iqeq = getIQEQProfile()

  const dims = p?.profile ? Object.entries(p.profile).map(([k, v]) => `${k}: ${v.label} (${v.percent}%)`).join(', ') : '无'
  const musicInfo = m ? `音乐品味: ${m.tasteLabel}, 评分 ${m.score}/10, 总结: ${m.summary}` : '无'
  const iqInfo = iqeq?.iq ? `IQ: ${iqeq.iq.label} (估算${iqeq.iq.iq})` : ''
  const eqInfo = iqeq?.eq ? `EQ: ${iqeq.eq.label} (${iqeq.eq.pct}%)` : ''

  const text = await callDeepSeek([
    { role: 'system', content: OTHERS_VIEW_SYSTEM },
    { role: 'user', content: `大五人格: ${dims}\n${musicInfo}\n${iqInfo}\n${eqInfo}\n\n请生成ta的"别人眼中的我"画像。` },
  ], { temperature: 0.9, maxTokens: 1200 })

  return extractJson(text)
}

// ==================== 兼容性分析 ====================

const COMPAT_SYSTEM = `你是一个恋爱/友谊适配分析师。根据两个人的大五人格、音乐品味、IQ/EQ数据，分析他们的契合度。

分析维度：
1. 人格互补性：哪些维度互补、哪些可能冲突
2. 音乐品味重合度
3. IQ/EQ 匹配度：思维方式和情绪智力的互补
4. 相处模式预测
5. 潜在摩擦点
6. 总体适配评分

语气：真诚、客观、带一点幽默感。

IMPORTANT: Return pure JSON only (no markdown, no backticks):
{"overallScore":75,"label":"契合度标签","personalityMatch":"人格层面的分析","musicMatch":"音乐品味层面的分析","iqeqMatch":"IQ/EQ层面的分析","chemistry":"相处时的化学反应描述","friction":"可能产生摩擦的地方","advice":"给两人的建议","verdict":"一句总结"}`

export async function analyzeCompatibility(myProfile, theirProfile) {
  const myDims = myProfile.p?.profile
    ? Object.entries(myProfile.p.profile).map(([k, v]) => `${k}: ${v.label}(${v.percent}%)`).join(', ')
    : '无'
  const myMusic = myProfile.m
    ? `${myProfile.m.tasteLabel}, 评分${myProfile.m.score}/10, ${myProfile.m.summary}`
    : '无'
  const myIQ = myProfile.iq
    ? `IQ: ${myProfile.iq.label}(${myProfile.iq.iq})`
    : '无'
  const myEQ = myProfile.eq
    ? `EQ: ${myProfile.eq.label}(${myProfile.eq.pct}%)`
    : '无'
  const theirDims = theirProfile.p?.profile
    ? Object.entries(theirProfile.p.profile).map(([k, v]) => `${k}: ${v.label}(${v.percent}%)`).join(', ')
    : '无'
  const theirMusic = theirProfile.m
    ? `${theirProfile.m.tasteLabel}, 评分${theirProfile.m.score}/10, ${theirProfile.m.summary}`
    : '无'
  const theirIQ = theirProfile.iq
    ? `IQ: ${theirProfile.iq.label}(${theirProfile.iq.iq})`
    : '无'
  const theirEQ = theirProfile.eq
    ? `EQ: ${theirProfile.eq.label}(${theirProfile.eq.pct}%)`
    : '无'

  const text = await callDeepSeek([
    { role: 'system', content: COMPAT_SYSTEM },
    { role: 'user', content: `我:\n人格: ${myDims}\n音乐: ${myMusic}\n${myIQ}\n${myEQ}\n\n对方:\n人格: ${theirDims}\n音乐: ${theirMusic}\n${theirIQ}\n${theirEQ}\n\n请分析我们的契合度。` },
  ], { temperature: 0.8, maxTokens: 1500 })

  return extractJson(text)
}

// ==================== 综合画像总结 ====================

const PORTRAIT_SYSTEM = `你是一个温暖但有洞察力的人格分析师。根据用户的大五人格和音乐品味，写一段200字以内的个人画像总结。像一面镜子让ta看到完整的自己。语气温暖真诚，不带评判。

IMPORTANT: Return pure JSON only (no markdown, no backticks):
{"title":"一句话概括（如：温柔外壳下藏着冒险灵魂的探索者）","portrait":"200字以内的画像描述","motto":"适合ta的一句座右铭"}`

export async function generatePortrait() {
  const p = getPersonalityProfile()
  const m = getMusicResult()
  const iqeq = getIQEQProfile()

  const dims = p?.profile ? Object.entries(p.profile).map(([k, v]) => `${v.label}(${v.percent}%)`).join(', ') : ''
  const music = m ? `${m.tasteLabel}, ${m.summary}` : ''
  const iqInfo = iqeq?.iq ? `IQ: ${iqeq.iq.label}(${iqeq.iq.iq})` : ''
  const eqInfo = iqeq?.eq ? `EQ: ${iqeq.eq.label}(${iqeq.eq.pct}%)` : ''

  const text = await callDeepSeek([
    { role: 'system', content: PORTRAIT_SYSTEM },
    { role: 'user', content: `人格: ${dims}\n音乐: ${music}\n${iqInfo}\n${eqInfo}\n\n请总结ta的个人画像。` },
  ], { maxTokens: 600 })

  return extractJson(text)
}

// ==================== Helpers ====================

function extractJson(text) {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  let raw = codeBlock ? codeBlock[1].trim() : text.trim()
  const braceStart = raw.indexOf('{')
  const braceEnd = raw.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd > braceStart) raw = raw.slice(braceStart, braceEnd + 1)

  try { return JSON.parse(raw) } catch {}

  raw = raw
    .replace(/(?<=:\s*")([^"]*?)\n([^"]*?)(?=")/g, '$1\\n$2')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/"\s+"/g, '", "')
    .replace(/}(\s*\n\s*){/g, '},{')

  return JSON.parse(raw)
}
