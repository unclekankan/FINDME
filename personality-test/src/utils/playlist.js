/**
 * 歌单分析工具
 *
 * 图片路径：Tesseract.js 客户端 OCR → 提取文字 → DeepSeek 分析
 * 文字路径：直接 DeepSeek 分析
 *
 * Tesseract.js 完全在浏览器内运行，无需 API Key，无需后端。
 */

import { createWorker } from 'tesseract.js'
import { callDeepSeek } from './deepseek.js'

/**
 * 从 AI 返回文本中提取 JSON，自动修复常见格式问题
 */
function extractJson(text) {
  // 1. 去掉 markdown 代码块包裹
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  let raw = codeBlock ? codeBlock[1].trim() : text.trim()

  // 2. 截取 JSON 对象范围
  const braceStart = raw.indexOf('{')
  const braceEnd = raw.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd > braceStart) {
    raw = raw.slice(braceStart, braceEnd + 1)
  }

  // 3. 直接解析
  try { return JSON.parse(raw) } catch {}

  // 4. 状态机修复：字符串内换行转义 + 数组内缺逗号插入 + 尾随逗号移除
  const out = []
  const stack = []
  let i = 0
  let afterValue = false

  while (i < raw.length) {
    const ch = raw[i]

    if (ch === '"') {
      out.push('"')
      i++
      while (i < raw.length) {
        if (raw[i] === '\\' && i + 1 < raw.length) {
          out.push(raw[i], raw[i + 1])
          i += 2
        } else if (raw[i] === '"') {
          out.push('"')
          afterValue = true
          i++
          break
        } else if (raw[i] === '\n' || raw[i] === '\r') {
          out.push('\\n')
          if (raw[i] === '\r' && raw[i + 1] === '\n') i++
          i++
          while (i < raw.length && (raw[i] === ' ' || raw[i] === '\t')) i++
        } else if (raw[i] === '\t') {
          out.push('\\t')
          i++
        } else {
          out.push(raw[i])
          i++
        }
      }
      continue
    }

    // 数字 / true / false / null 开头 — 数组内缺逗号
    if (afterValue && isValueStart(ch) && stack.length > 0 && stack[stack.length - 1] === '[') {
      out.push(', ')
    }

    if (ch === '{' || ch === '[') {
      if (afterValue && stack.length > 0 && stack[stack.length - 1] === '[') {
        out.push(', ')
      }
      stack.push(ch)
      out.push(ch)
      afterValue = false
    } else if (ch === '}' || ch === ']') {
      if (!afterValue) {
        let j = out.length - 1
        while (j >= 0 && out[j] === ' ') j--
        if (j >= 0 && out[j] === ',') out.splice(j, 1)
      }
      stack.pop()
      out.push(ch)
      afterValue = true
    } else if (ch === ',') {
      out.push(ch)
      afterValue = false
    } else if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
      if (out.length > 0 && out[out.length - 1] !== ' ') {
        out.push(' ')
      }
    } else if (ch === ':') {
      out.push(ch)
      afterValue = false
    } else {
      out.push(ch)
    }
    i++
  }

  let fixed = out.join('')
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  try { return JSON.parse(fixed) } catch (e) {
    // 5. 彻底失败时截断 songs 数组重试
    const songsMatch = raw.match(/"songs"\s*:\s*\[([\s\S]*?)\](?=\s*[,}"])/)
    if (songsMatch) {
      let songsPart = songsMatch[1]
      songsPart = songsPart.replace(/}(\s*\n?\s*){/g, '},{')
      songsPart = songsPart.replace(/,(\s*)$/, '$1')
      const fixedRaw = raw.slice(0, songsMatch.index) +
        `"songs": [${songsPart}]` +
        raw.slice(songsMatch.index + songsMatch[0].length)
      try { return JSON.parse(fixedRaw) } catch {}
    }
    throw new Error(`JSON 解析失败: ${e.message}`)
  }
}

function isValueStart(ch) {
  return ch === '"' || ch === '{' || ch === '[' || ch === 't' || ch === 'f' || ch === 'n' ||
    (ch >= '0' && ch <= '9') || ch === '-'
}

// ==================== Tesseract OCR ====================

let _worker = null

async function getWorker() {
  if (_worker) return _worker
  _worker = await createWorker('chi_sim+eng', 1)
  return _worker
}

/**
 * OCR 识别图片中的文字
 * @param {string} base64Image
 * @returns {Promise<string>}
 */
export async function ocrImage(base64Image) {
  const worker = await getWorker()
  const { data } = await worker.recognize(base64Image)
  return (data.text || '').trim()
}

// ==================== 分析 ====================

const ANALYSIS_SYSTEM = `你是一个专业的音乐品味分析师。用户上传了一份歌单内容（可能来自OCR识别或直接粘贴），你的任务是：

第一步：从文本中识别出所有歌曲（歌名 — 歌手格式）。OCR结果可能不完美，请根据常识推断和修正。
第二步：基于歌单整体内容，给出深入的音乐品味分析。

分析要点：
- 识别用户的音乐偏好（流派、年代、语言、情绪倾向）
- 评估品味的广度（是否多元）和深度（是否有小众/独立音乐）
- 指出品味亮点和盲区
- 推荐3-5首用户可能喜欢但歌单里没有的歌

IMPORTANT: Return pure JSON only (no markdown, no backticks). Ensure valid JSON:
- Objects in songs array separated by commas
- No unescaped newlines in string values
- No trailing commas
{
  "songs": [{"title": "歌名", "artist": "歌手"}],
  "genreProfile": "风格画像",
  "eraDistribution": "年代分布描述",
  "tasteLevel": "品味评级",
  "score": 5,
  "strengths": ["优点"],
  "weaknesses": ["盲区"],
  "personality": "歌单主人画像",
  "recommendations": [{"artist": "歌手", "song": "歌曲", "why": "理由"}],
  "summary": "一句话总结"
}`

/**
 * 分析歌单文本内容
 * @param {string} textContent
 * @returns {Promise<object>}
 */
export async function analyzeText(textContent) {
  const text = await callDeepSeek([
    { role: 'system', content: ANALYSIS_SYSTEM },
    { role: 'user', content: `以下是一份歌单内容，请解析其中所有歌曲并分析歌单主人的音乐品味：\n\n${textContent}` },
  ], { maxTokens: 2500 })

  return extractJson(text)
}

// ==================== 图片处理 ====================

/** 将 File 转为 base64 data URL（压缩到合理尺寸） */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件（jpg/png/webp）'))
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('图片不能超过 20MB'))
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const maxDim = 1920
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
    img.src = url
  })
}
