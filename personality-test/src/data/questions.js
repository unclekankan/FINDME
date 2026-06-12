/**
 * IPIP (International Personality Item Pool) 大五人格测试
 *
 * 五维度：
 *   O — 开放性 Openness
 *   C — 尽责性 Conscientiousness
 *   E — 外向性 Extraversion
 *   A — 宜人性 Agreeableness
 *   N — 情绪稳定性 Neuroticism (反向 = Emotional Stability)
 *
 * 每维度6题：3题正向 + 3题反向，共30题
 */

export const dimensions = [
  {
    key: 'O',
    label: '开放性',
    emoji: '🎨',
    fullName: 'Openness to Experience',
    desc: '衡量你对新事物、想象力、审美和求知欲的开放程度',
    highLabel: '探索创新型',
    highDesc: '充满好奇心，喜欢新鲜事物，想象力丰富，具有艺术气质和创造力。',
    lowLabel: '务实传统型',
    lowDesc: '脚踏实地，偏好熟悉和传统的事物，注重实际而非幻想。',
  },
  {
    key: 'C',
    label: '尽责性',
    emoji: '📋',
    fullName: 'Conscientiousness',
    desc: '衡量你的自律、条理性、责任感和成就动机',
    highLabel: '自律进取型',
    highDesc: '做事有条不紊，勤奋自律，责任心强，追求卓越，值得信赖。',
    lowLabel: '随性灵活型',
    lowDesc: '喜欢即兴发挥，不受条条框框约束，灵活应变但有时显得散漫。',
  },
  {
    key: 'E',
    label: '外向性',
    emoji: '🎤',
    fullName: 'Extraversion',
    desc: '衡量你的社交活跃度、活力水平和积极情绪倾向',
    highLabel: '热情社交型',
    highDesc: '充满活力，喜欢与人交往，健谈开朗，善于活跃气氛，是人群中的焦点。',
    lowLabel: '沉静内敛型',
    lowDesc: '偏好独处，安静内敛，深思熟虑，在安静的环境中发挥最佳状态。',
  },
  {
    key: 'A',
    label: '宜人性',
    emoji: '🤝',
    fullName: 'Agreeableness',
    desc: '衡量你的同理心、合作精神和对他人的信任程度',
    highLabel: '温暖合作型',
    highDesc: '待人友善，富有同理心，乐于助人，善于合作，容易获得他人信任。',
    lowLabel: '理性独立型',
    highDesc: '独立思考，敢于质疑和质疑权威，不轻易妥协，在竞争中能保持清醒。',
  },
  {
    key: 'N',
    label: '情绪稳定性',
    emoji: '🧘',
    fullName: 'Emotional Stability',
    desc: '衡量你的情绪抗压能力和心理韧性（高分=更稳定）',
    highLabel: '稳定从容型',
    highDesc: '情绪稳定，抗压能力强，面对困难保持冷静，不易焦虑和波动。',
    lowLabel: '敏感细腻型',
    lowDesc: '情感丰富细腻，对情绪变化敏感，容易感受到压力和焦虑。',
  },
]

/**
 * 每题两个选项，选 A 得方向分（high方向），选 B 得反方向分
 */
export const questions = [
  // ==================== 开放性 O（反向题标注 N 高分 = 低开放性） ====================
  {
    id: 1, dimension: 'O',
    text: '我对艺术、音乐和文学有浓厚的兴趣。',
    high: '比较像我', low: '不太像我',
    direction: 'high', // 选"比较像我"→O高分
  },
  {
    id: 2, dimension: 'O',
    text: '我喜欢尝试新奇的、没做过的事情。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 3, dimension: 'O',
    text: '我经常沉浸在自己的想象和白日梦之中。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 4, dimension: 'O',
    text: '我不太关心艺术或抽象的概念。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse', // 选"不太像我"→O高分
  },
  {
    id: 5, dimension: 'O',
    text: '我喜欢遵循既定的方式来做事，不喜欢变化。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 6, dimension: 'O',
    text: '我对理论、哲学或抽象概念没什么兴趣。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },

  // ==================== 尽责性 C ====================
  {
    id: 7, dimension: 'C',
    text: '我总是提前计划，把工作和生活安排得井井有条。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 8, dimension: 'C',
    text: '一旦开始做一件事，我就会坚持把它做完。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 9, dimension: 'C',
    text: '我对自己的要求很高，总想把事情做到最好。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 10, dimension: 'C',
    text: '我的房间或书桌经常乱糟糟的。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 11, dimension: 'C',
    text: '我做事容易拖延，经常到最后一刻才动手。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 12, dimension: 'C',
    text: '我常常忘记把东西放回原处或按时完成任务。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },

  // ==================== 外向性 E ====================
  {
    id: 13, dimension: 'E',
    text: '在聚会或社交场合中，我是比较活跃的那一个。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 14, dimension: 'E',
    text: '我喜欢结交新朋友，主动跟陌生人聊天。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 15, dimension: 'E',
    text: '我常常感到精力充沛，想要忙起来做点什么。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 16, dimension: 'E',
    text: '比起一群人热闹，我更喜欢一个人待着。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 17, dimension: 'E',
    text: '在社交场合中，我通常比较安静内敛。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 18, dimension: 'E',
    text: '我不太喜欢成为注意力的中心。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },

  // ==================== 宜人性 A ====================
  {
    id: 19, dimension: 'A',
    text: '看到别人有困难，我很容易心软并想要帮忙。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 20, dimension: 'A',
    text: '我相信大多数人都是善良和值得信赖的。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 21, dimension: 'A',
    text: '我愿意为了团队的利益而妥协和让步。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 22, dimension: 'A',
    text: '如果有人对我不公，我会记在心上很难忘记。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 23, dimension: 'A',
    text: '我认为在竞争中，自己的利益比别人的感受更重要。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 24, dimension: 'A',
    text: '我有时会对别人的错误和缺点缺少耐心。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },

  // ==================== 情绪稳定性 N（高分=稳定） ====================
  {
    id: 25, dimension: 'N',
    text: '大多数时候，我能保持情绪平稳和放松。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 26, dimension: 'N',
    text: '即使遇到挫折，我也能很快调整过来。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 27, dimension: 'N',
    text: '我很少因为小事而烦躁或紧张。',
    high: '比较像我', low: '不太像我',
    direction: 'high',
  },
  {
    id: 28, dimension: 'N',
    text: '我常常感到担忧、焦虑或情绪低落。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 29, dimension: 'N',
    text: '一点点压力就会让我感到不堪重负。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
  {
    id: 30, dimension: 'N',
    text: '我的情绪波动比较大，容易被外界影响。',
    high: '不太像我', low: '比较像我',
    direction: 'reverse',
  },
]
