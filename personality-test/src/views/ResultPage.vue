<template>
  <div class="result-page">
    <div v-if="!result" class="not-found">
      <span class="nf-emoji">🧠</span>
      <h2>暂无测试结果</h2>
      <p>请先完成人格测试</p>
      <button class="go-btn" @click="$router.push('/test')">去测试</button>
    </div>

    <template v-else>
      <!-- 顶部总览 -->
      <section class="hero-section">
        <div class="spider-container">
          <svg viewBox="0 0 280 280" class="spider-chart">
            <!-- 5层参考网 -->
            <polygon v-for="lvl in 5" :key="lvl"
              :points="spiderPoints(lvl / 5 * 100)"
              fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"
            />
            <!-- 轴线 -->
            <line v-for="(_, i) in 5" :key="'ax'+i"
              :x1="140" :y1="140"
              :x2="140 + 115 * Math.cos(-Math.PI/2 + i * 2*Math.PI/5)"
              :y2="140 + 115 * Math.sin(-Math.PI/2 + i * 2*Math.PI/5)"
              stroke="rgba(255,255,255,0.08)" stroke-width="1"
            />
            <!-- 数据填充 -->
            <polygon :points="spiderPoints()" fill="rgba(226,196,136,0.12)" stroke="#e2c488" stroke-width="2" stroke-linejoin="round" />
            <!-- 数据点 -->
            <circle v-for="(pct, di) in dimPcts" :key="'dp'+di"
              :cx="140 + (pct/100 * 115) * Math.cos(-Math.PI/2 + di * 2*Math.PI/5)"
              :cy="140 + (pct/100 * 115) * Math.sin(-Math.PI/2 + di * 2*Math.PI/5)"
              r="5" fill="#e2c488"
            />
            <!-- 标签 -->
            <text v-for="(dim, di) in dimensions" :key="'lbl'+di"
              :x="140 + 128 * Math.cos(-Math.PI/2 + di * 2*Math.PI/5)"
              :y="140 + 128 * Math.sin(-Math.PI/2 + di * 2*Math.PI/5) + 5"
              text-anchor="middle" fill="rgba(240,230,211,0.7)" font-size="12"
            >
              {{ dim.label }}
            </text>
          </svg>
        </div>
        <h1 class="hero-title">你的大五人格画像</h1>
        <p class="hero-date" v-if="testDate">测试完成于 {{ testDate }}</p>
        <p class="hero-desc">
          基于 IPIP（国际人格项目库）科学量表，从五个核心维度刻画你的人格全貌。
        </p>
      </section>

      <!-- 五维度详情 -->
      <section class="dims-section">
        <div class="dim-detail" v-for="dim in dimensions" :key="dim.key">
          <div class="dim-header">
            <div class="dim-title-row">
              <span class="dim-emoji">{{ dim.emoji }}</span>
              <div>
                <h3>{{ dim.label }} · {{ result.profile[dim.key].label }}</h3>
                <p class="dim-fullname">{{ dim.fullName }}</p>
              </div>
              <span class="dim-score">{{ result.profile[dim.key].percent }}%</span>
            </div>
            <div class="dim-bar-track">
              <div class="dim-bar-fill" :style="{ width: result.profile[dim.key].percent + '%' }"></div>
              <div class="dim-bar-labels">
                <span class="dim-bar-low">偏低</span>
                <span class="dim-bar-mid">中等</span>
                <span class="dim-bar-high">偏高</span>
              </div>
            </div>
          </div>
          <p class="dim-interp">{{ result.profile[dim.key].desc }}</p>
        </div>
      </section>

      <!-- 综合画像 -->
      <section class="summary-section">
        <h2 class="section-title">📝 综合分析</h2>
        <div class="summary-card">
          <div class="highlights">
            <div class="hl-item" v-for="hl in highlights" :key="hl.key">
              <span class="hl-icon">{{ hl.emoji }}</span>
              <strong>{{ hl.key }}：</strong>{{ hl.text }}
            </div>
          </div>
        </div>
      </section>

      <!-- 职业提示 -->
      <section class="careers-section">
        <h2 class="section-title">🎯 适合你的领域</h2>
        <div class="career-tags">
          <span class="career-tag" v-for="c in careerSuggestions" :key="c">{{ c }}</span>
        </div>
      </section>

      <!-- 操作 -->
      <section class="actions">
        <button class="action-btn retake-btn" @click="$router.push('/test')">🔄 重新测试</button>
        <button class="action-btn profile-btn" @click="$router.push('/profile')">👤 查看我的画像</button>
        <button class="action-btn home-btn" @click="$router.push('/')">🏠 回到首页</button>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { dimensions } from '../data/questions.js'
import { calculateType } from '../utils/scoring.js'
import { getPersonalityProfile } from '../utils/profile.js'
const result = ref(null)
const testDate = ref('')

onMounted(() => {
  // 1) 从 sessionStorage 读取原始答案
  let raw = sessionStorage.getItem('personality_answers')
  // 2) 若无，从 localStorage 读取
  if (!raw) raw = localStorage.getItem('personality_answers')
  if (raw) {
    try {
      const answers = JSON.parse(raw)
      result.value = calculateType(answers)
      testDate.value = formatDate(result.value.ts || Date.now())
      return
    } catch {}
  }
  // 3) 最后尝试从 profile 读取（有数据但没答案的情况）
  const profile = getPersonalityProfile()
  if (profile?.profile) {
    result.value = profile
    testDate.value = formatDate(profile.ts || Date.now())
  }
})

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const dimPcts = computed(() =>
  result.value ? dimensions.map((d) => result.value.profile[d.key].percent) : [50, 50, 50, 50, 50]
)

function spiderPoints(pcts) {
  const vals = pcts || dimPcts.value
  return dimensions.map((_, i) => {
    const r = (vals[i] / 100) * 115
    const x = 140 + r * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 5)
    const y = 140 + r * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 5)
    return `${x},${y}`
  }).join(' ')
}

const highlights = computed(() => {
  if (!result.value) return []
  return dimensions.map((dim) => {
    const p = result.value.profile[dim.key]
    return {
      key: dim.label,
      emoji: dim.emoji,
      text: p.desc,
    }
  })
})

const careerSuggestions = computed(() => {
  if (!result.value) return []
  const p = result.value.profile
  const careers = []

  if (p.O.level === 'high') careers.push('创意/艺术', '研发/学术')
  if (p.O.level === 'low') careers.push('技术实施', '行政运营')
  if (p.C.level === 'high') careers.push('管理/金融', '项目管理')
  if (p.E.level === 'high') careers.push('销售/市场', '演艺/公关')
  if (p.E.level === 'low') careers.push('技术/编程', '数据分析')
  if (p.A.level === 'high') careers.push('教育/公益', '医疗/护理')
  if (p.A.level === 'low') careers.push('法律/审计', '战略/谈判')
  if (p.N.level === 'high') careers.push('应急管理', '高压力岗位')
  if (p.N.level === 'low') careers.push('需要稳定发挥的岗位', '可考虑压力管理')

  return [...new Set(careers)].slice(0, 8)
})
</script>

<style scoped>
.result-page { min-height: 100vh; background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 30%, #24243e 100%); color: #f0e6d3; padding-bottom: 3rem; }

.not-found { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.nf-emoji { font-size: 4rem; }
.not-found h2 { color: #e2c488; }
.not-found p { color: rgba(240,230,211,0.5); }
.go-btn { padding: 0.7rem 2rem; border-radius: 50px; border: none; background: linear-gradient(135deg,#e2c488,#c9974a); color: #0f0c29; font-weight: 700; cursor: pointer; }

/* hero */
.hero-section { text-align: center; padding: 2.5rem 1.5rem 2rem; }
.spider-container { width: 260px; height: 260px; margin: 0 auto 1.5rem; }
.spider-chart { width: 100%; height: 100%; }
.hero-title { font-size: 1.8rem; font-weight: 800; color: #e2c488; margin-bottom: 0.5rem; }
.hero-date { color: rgba(240,230,211,0.3); font-size: 0.75rem; margin-bottom: 0.5rem; }
.hero-desc { color: rgba(240,230,211,0.5); font-size: 0.9rem; max-width: 400px; margin: 0 auto; }

/* dims */
.dims-section { max-width: 640px; margin: 0 auto; padding: 0 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
.dim-detail { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 1.2rem 1.3rem; }
.dim-title-row { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; }
.dim-emoji { font-size: 1.8rem; flex-shrink: 0; }
.dim-title-row h3 { font-size: 1rem; color: #f0e6d3; margin-bottom: 0.15rem; }
.dim-fullname { font-size: 0.72rem; color: rgba(240,230,211,0.35); }
.dim-score { margin-left: auto; font-size: 1.4rem; font-weight: 800; color: #e2c488; }
.dim-bar-track { height: 8px; border-radius: 4px; background: rgba(255,255,255,0.08); position: relative; margin-bottom: 0.1rem; }
.dim-bar-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #e2c488, #c9974a); transition: width 1s ease; }
.dim-bar-labels { display: flex; justify-content: space-between; font-size: 0.65rem; color: rgba(240,230,211,0.25); margin-top: 3px; }
.dim-interp { font-size: 0.85rem; color: rgba(240,230,211,0.6); line-height: 1.6; margin-top: 0.6rem; }

/* summary */
section { max-width: 640px; margin: 0 auto; padding: 1.5rem; }
.section-title { font-size: 1.1rem; color: #e2c488; font-weight: 700; margin-bottom: 1rem; }
.summary-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1.3rem 1.5rem; }
.highlights { display: flex; flex-direction: column; gap: 0.8rem; }
.hl-item { font-size: 0.9rem; color: rgba(240,230,211,0.75); line-height: 1.6; }
.hl-icon { margin-right: 0.4rem; }

/* careers */
.career-tags { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.career-tag { padding: 0.5rem 1.2rem; border-radius: 50px; background: rgba(226,196,136,0.1); border: 1px solid rgba(226,196,136,0.2); color: #e2c488; font-size: 0.9rem; }

/* actions */
.actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; padding: 2rem 1.5rem; }
.action-btn { padding: 0.8rem 2rem; border-radius: 50px; border: none; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
.retake-btn { background: rgba(255,255,255,0.08); color: #f0e6d3; border: 1px solid rgba(255,255,255,0.15); }
.retake-btn:hover { background: rgba(255,255,255,0.15); }
.profile-btn { background: rgba(186,150,240,0.1); color: #ba96f0; border: 1px solid rgba(186,150,240,0.2); }
.profile-btn:hover { background: rgba(186,150,240,0.18); }
.home-btn { background: linear-gradient(135deg,#e2c488,#c9974a); color: #0f0c29; font-weight: 700; }
.home-btn:hover { box-shadow: 0 4px 24px rgba(226,196,136,0.4); }
</style>
