/** IQ 逻辑推理题（20题）+ EQ 情商题（20题）*/

export const iqQuestions = [
  // === 数字推理 ===
  { id: 1, type: 'numeric', text: '2, 6, 12, 20, 30, ? 问号处应该是？',
    options: ['36', '38', '42', '48'], answer: 2 }, // 2+4=6,6+6=12,12+8=20,20+10=30,30+12=42
  { id: 2, type: 'numeric', text: '3, 9, 27, 81, ? 下一个数是？',
    options: ['162', '243', '324', '405'], answer: 1 }, // ×3 each
  { id: 3, type: 'numeric', text: '如果 5 + 3 = 28, 9 + 1 = 810, 8 + 6 = 214, 那么 7 + 3 = ?',
    options: ['410', '310', '210', '110'], answer: 0 }, // (7-3)=4, (7+3)=10 → 410
  { id: 4, type: 'numeric', text: '一个数除以 5 余 3，除以 7 余 5，这个数最小是多少？',
    options: ['23', '33', '38', '43'], answer: 1 }, // LCM(5,7)=35, 35-2=33
  { id: 5, type: 'numeric', text: '1, 1, 2, 3, 5, 8, 13, ? 下一个是？',
    options: ['18', '19', '20', '21'], answer: 3 }, // Fibonacci

  // === 逻辑推理 ===
  { id: 6, type: 'logic', text: '如果所有的 A 都是 B，所有的 B 都是 C，那么？',
    options: ['所有 C 都是 A', '所有 A 都是 C', '没有 A 是 C', '有些 A 不是 C'], answer: 1 },
  { id: 7, type: 'logic', text: '小明比小红高，小红比小刚高，小刚比小美矮，小美比小明矮。谁最高？',
    options: ['小明', '小红', '小刚', '小美'], answer: 0 },
  { id: 8, type: 'logic', text: '"有些鸟不会飞。" 如果这句话为真，以下哪项必定为真？',
    options: ['所有鸟都会飞', '有些会飞的不是鸟', '并非所有鸟都会飞', '不会飞的都不是鸟'], answer: 2 },
  { id: 9, type: 'logic', text: '有 3 个盒子，只有一个有金币。盒子 A 上写"金币在这里"，B 写"金币不在这里"，C 写"金币不在 A 里"。只有一句真话，金币在哪？',
    options: ['A', 'B', 'C', '无法确定'], answer: 1 },
  { id: 10, type: 'logic', text: '8 个球，7 个重量相同，1 个更重。用天平最少称几次能找到？',
    options: ['1 次', '2 次', '3 次', '4 次'], answer: 1 },

  // === 图形/空间 ===
  { id: 11, type: 'spatial', text: '一个立方体有 6 个面，每个面都涂成红色。如果把它切成 27 个小立方体，有多少个小立方体恰有 2 个红面？',
    options: ['8', '12', '6', '16'], answer: 1 }, // 棱上的（不含角）= 12条棱×1=12
  { id: 12, type: 'spatial', text: '一个正方体被一个平面斜切一刀，截面不可能是？',
    options: ['三角形', '正方形', '五边形', '圆形'], answer: 3 },
  { id: 13, type: 'spatial', text: '时针和分针在 3:15 时的夹角是多少度？',
    options: ['0°', '7.5°', '15°', '22.5°'], answer: 1 }, // 分针在90°, 时针在90+7.5=97.5°, 差7.5°
  { id: 14, type: 'spatial', text: '一面镜子挂在墙上。你站在镜子前 2 米处，花在镜前 1 米处（花和你在同一侧）。你在镜子中看到的花的虚像，距离你的眼睛多远？',
    options: ['3 米', '4 米', '5 米', '6 米'], answer: 0 }, // 像到镜=1m, 你到镜=2m, 总=3m
    // 但之前算错了, 让我改成0:
    // answer: 0 (3米)

  // === 语言逻辑 ===
  { id: 15, type: 'verbal', text: '选出与其他三项不同类的一项：',
    options: ['钢琴', '吉他', '小提琴', '长笛'], answer: 0 }, // 钢琴是键盘乐器
  { id: 16, type: 'verbal', text: '如果把"成功"比作"勤奋"，那么"智慧"应该比作？',
    options: ['天赋', '阅读', '思考', '经验'], answer: 1 }, // 类比: 成功靠勤奋获取, 智慧靠阅读获取
  { id: 17, type: 'verbal', text: '"自相矛盾"的意思最接近？',
    options: ['言行不一', '左右为难', '前后抵触', '虚张声势'], answer: 2 },

  // === 数学 ===
  { id: 18, type: 'math', text: '一桶水，第一天喝掉一半，第二天喝掉剩下的三分之一，还剩 6 升。原来有多少升？',
    options: ['15', '16', '18', '20'], answer: 2 }, // x/2 * 2/3 = x/3 = 6, x=18
  { id: 19, type: 'math', text: '甲乙两人同时从两地相向而行，甲时速 5km，乙时速 7km，2 小时后相遇。两地距离？',
    options: ['20km', '22km', '24km', '26km'], answer: 2 }, // (5+7)*2=24
  { id: 20, type: 'math', text: '7 个人排成一排拍照，有多少种不同的排列方式？',
    options: ['5040', '720', '40320', '2520'], answer: 0 }, // 7!=5040
]

export const eqQuestions = [
  // === 自我觉察 ===
  { id: 1, dimension: 'self_aware', text: '我能清楚地识别自己当下的情绪（快乐/愤怒/悲伤/焦虑等）。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 2, dimension: 'self_aware', text: '我知道自己的情绪会在什么情况下被触发。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 3, dimension: 'self_aware', text: '我能意识到自己的情绪是如何影响我的行为和决策的。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 4, dimension: 'self_aware', text: '我知道自己的优点和缺点是什么。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 5, dimension: 'self_aware', text: '我能够理解自己为什么会有某种情绪反应。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },

  // === 情绪调节 ===
  { id: 6, dimension: 'self_reg', text: '当我生气时，我能在失控之前冷静下来。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 7, dimension: 'self_reg', text: '面对重大压力，我依然能保持相对冷静和理智。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 8, dimension: 'self_reg', text: '我不会因为一时的坏情绪就对身边的人发脾气。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 9, dimension: 'self_reg', text: '当事情不如预期时，我能较快地调整心态。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 10, dimension: 'self_reg', text: '我不会让焦虑或担忧长时间影响我的判断。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },

  // === 同理心 ===
  { id: 11, dimension: 'empathy', text: '我能很容易地感受到周围人的情绪变化。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 12, dimension: 'empathy', text: '当朋友不开心时，我能感同身受并给予适当安慰。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 13, dimension: 'empathy', text: '我能理解不同人的观点和立场，即使我不同意他们。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 14, dimension: 'empathy', text: '别人说我是一个善解人意、会倾听的人。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 15, dimension: 'empathy', text: '我能在冲突中看到双方各自的感受和需求。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },

  // === 社交能力 ===
  { id: 16, dimension: 'social', text: '我善于在不同场合调整自己的言行举止。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 17, dimension: 'social', text: '我能够轻松地与新认识的人建立关系。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 18, dimension: 'social', text: '在团队中，我能协调不同的意见和矛盾。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 19, dimension: 'social', text: '我能够察觉并回应他人的非语言信号（表情、姿态等）。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
  { id: 20, dimension: 'social', text: '我觉得处理人际关系对我来说是相对轻松的。',
    options: ['完全不像我', '不太像我', '有点像我', '比较像我', '非常像我'] },
]

/** IQ 算分：每题 5 分，满分 100，映射到 70-140 区间模拟 IQ */
export function scoreIQ(answers) {
  let correct = 0
  for (let i = 0; i < iqQuestions.length; i++) {
    if (answers[i] === iqQuestions[i].answer) correct++
  }
  const raw = correct * 5 // 0-100
  // 映射到标准 IQ 范围 70-140（均值100, 15SD）
  // raw=0→70, raw=50→100, raw=100→130+ → 线性: iq = 70 + raw*0.6, 但 raw=100→130太低了
  // 用非线性: 取 z-score, raw mean~60(12/20), sd~20(4/20)
  // raw=50→100, raw=75→115, raw=100→130
  const iq = Math.round(70 + raw * 0.7)
  return {
    correct, total: 20, raw, iq,
    level: iq >= 130 ? 'genius' : iq >= 115 ? 'above' : iq >= 100 ? 'average' : iq >= 85 ? 'below' : 'low',
    label: iq >= 130 ? '天才级' : iq >= 115 ? '优秀' : iq >= 100 ? '中等' : iq >= 85 ? '偏低' : '需要提升',
    desc: iq >= 130 ? '具有极强的逻辑推理和问题解决能力，在复杂问题上能快速找到突破口。'
      : iq >= 115 ? '逻辑思维能力高于平均水平，能较好地处理复杂问题。'
      : iq >= 100 ? '逻辑思维能力在正常范围内，大多数日常问题都能应对。'
      : '可能需要更多时间处理复杂的逻辑问题，但每个人都有自己擅长的领域。',
  }
}

/** EQ 算分：每题 1-5 分，满分 100 */
export function scoreEQ(answers) {
  const dims = { self_aware: 0, self_reg: 0, empathy: 0, social: 0 }
  for (let i = 0; i < eqQuestions.length; i++) {
    const val = (answers[i] ?? 2) + 1 // 0-4 → 1-5
    dims[eqQuestions[i].dimension] += val
  }
  const total = Object.values(dims).reduce((s, v) => s + v, 0) // 20-100
  const pct = Math.round((total - 20) / 80 * 100)

  return {
    total, pct,
    level: pct >= 80 ? 'high' : pct >= 55 ? 'above' : pct >= 30 ? 'average' : 'low',
    label: pct >= 80 ? '高情商' : pct >= 55 ? '中高情商' : pct >= 30 ? '中等情商' : '需要关注',
    desc: pct >= 80 ? '你具有出色的情绪管理能力和人际敏感度，是很好的沟通者和支持者。'
      : pct >= 55 ? '你能够较好地处理自己的情绪和与他人的关系。'
      : pct >= 30 ? '你在情绪管理方面有基本的能力，但某些方面还有提升空间。'
      : '你可能在识别和处理情绪方面感到吃力，但这完全可以通过练习来提升。',
    dims: {
      self_aware: { label: '自我觉察', score: dims.self_aware, max: 25, pct: Math.round(dims.self_aware / 25 * 100) },
      self_reg: { label: '情绪调节', score: dims.self_reg, max: 25, pct: Math.round(dims.self_reg / 25 * 100) },
      empathy: { label: '同理心', score: dims.empathy, max: 25, pct: Math.round(dims.empathy / 25 * 100) },
      social: { label: '社交能力', score: dims.social, max: 25, pct: Math.round(dims.social / 25 * 100) },
    },
  }
}
