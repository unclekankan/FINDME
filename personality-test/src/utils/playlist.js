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

function extractJson(text) {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = codeBlock ? codeBlock[1].trim() : text.trim()
  const braceStart = raw.indexOf('{')
  const braceEnd = raw.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd > braceStart) {
    return JSON.parse(raw.slice(braceStart, braceEnd + 1))
  }
  return JSON.parse(raw)
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

返回严格的 JSON 格式（不要 markdown 代码块）：
{
  "songs": [{"title": "歌名", "artist": "歌手"}, ...],
  "genreProfile": "风格画像（一段话总结这个歌单的整体风格和流派倾向）",
  "eraDistribution": "年代分布描述",
  "tasteLevel": "品味评级（广泛且深入 / 偏主流但稳定 / 单一小众深挖型 / 杂食型探索者）",
  "score": 数字(1-10),
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["盲区1", "盲区2"],
  "personality": "歌单主人可能是什么样的人（一段话刻画）",
  "recommendations": [{"artist": "歌手", "song": "歌曲", "why": "推荐理由"}, ...],
  "summary": "一句话犀利总结"
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
