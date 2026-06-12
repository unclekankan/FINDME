import { questions, dimensions } from '../data/questions.js'

/**
 * 计算大五人格分数
 * @param {number[]} answers — 答案数组，answers[qi] = 0(high选项) 或 1(low选项)
 * @returns {{ scores: object, typeCode: string, profile: object }}
 */
export function calculateType(answers) {
  const dimKeys = dimensions.map((d) => d.key)
  const rawScores = Object.fromEntries(dimKeys.map((k) => [k, 0]))

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const answer = answers[i]
    if (answer === undefined) continue

    // answer: 0 = 选high, 1 = 选low
    let point = 0
    if (q.direction === 'high') {
      point = answer === 0 ? 1 : 0
    } else {
      // 反向题：选"选low"（即answer=1，表示"不太像我") → 得分
      point = answer === 1 ? 1 : 0
    }
    rawScores[q.dimension] += point
  }

  // 每题1分，每维度最高6分 → 转为百分比
  const maxPerDim = 6
  const profile = {}
  for (const dim of dimensions) {
    const raw = rawScores[dim.key]
    const pct = Math.round((raw / maxPerDim) * 100)
    profile[dim.key] = {
      raw,
      max: maxPerDim,
      percent: pct,
      level: pct >= 70 ? 'high' : pct <= 33 ? 'low' : 'mid',
      label: pct >= 70 ? dim.highLabel : pct <= 33 ? dim.lowLabel : '均衡型',
      desc: pct >= 70 ? dim.highDesc : pct <= 33 ? dim.lowDesc : '处于中间位置，兼具两方面的特点，在不同情境下灵活表现。',
    }
  }

  // 生成类型码: 高位 + 低位表示
  const typeCode = dimKeys.map((k) => profile[k].level).join('|')

  return { rawScores, typeCode, profile }
}

export function getDimensionPercentages(profile) {
  const result = {}
  for (const dim of dimensions) {
    result[dim.key] = {
      percent: profile[dim.key].percent,
      label: profile[dim.key].label,
      level: profile[dim.key].level,
    }
  }
  return result
}
