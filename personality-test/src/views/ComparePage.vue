<template>
  <div class="compare-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.push('/profile')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1>契合度分析</h1>
    </header>

    <!-- ===== 输入对方画像 ===== -->
    <div v-if="!compatResult && !loading" class="input-section">
      <h2 class="section-title-main">🔗 导入对方的画像</h2>
      <p class="section-desc">让对方在「我的画像」页面点击"导出"，把码发给你</p>

      <textarea v-model="importCode" class="import-area" placeholder="在此粘贴对方的画像码..." rows="6"></textarea>

      <div class="input-actions">
        <button class="analyze-btn" @click="doAnalyze" :disabled="!importCode.trim() || !myProfile">
          {{ myProfile ? '🔍 分析契合度' : '⚠️ 请先完成自己的测试' }}
        </button>
      </div>

      <div v-if="!myProfile" class="no-me-hint">
        <p>你还没有自己的画像数据，请先完成测试</p>
        <div class="no-me-btns">
          <button class="small-btn gold" @click="$router.push('/test')">🧠 人格测试</button>
          <button class="small-btn green" @click="$router.push('/music-test')">🎵 音乐测试</button>
        </div>
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    </div>

    <!-- ===== 加载 ===== -->
    <div v-if="loading" class="loading-screen">
      <div class="vinyl-spinner"></div>
      <p>AI 正在分析两个人的契合度...</p>
    </div>

    <!-- ===== 结果 ===== -->
    <div v-if="compatResult" class="result-content">
      <!-- 评分 -->
      <section class="score-section">
        <div class="compat-circle-wrapper">
          <svg class="compat-ring" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6" />
            <circle cx="70" cy="70" r="64" fill="none" :stroke="compatColor" stroke-width="6" stroke-linecap="round"
              :stroke-dasharray="402.124"
              :stroke-dashoffset="402.124 * (1 - (compatResult.overallScore || 50) / 100)"
              transform="rotate(-90 70 70)" class="compat-ring-fill" />
          </svg>
          <div class="compat-inner">
            <span class="compat-num">{{ compatResult.overallScore }}</span>
            <span class="compat-pct">%</span>
          </div>
        </div>
        <h2 class="compat-label">{{ compatResult.label }}</h2>
        <p class="compat-verdict">{{ compatResult.verdict }}</p>
      </section>

      <!-- 人格匹配 -->
      <section class="info-section">
        <h3 class="info-title">🧬 人格层面</h3>
        <div class="info-card">{{ compatResult.personalityMatch }}</div>
      </section>

      <!-- 音乐匹配 -->
      <section class="info-section">
        <h3 class="info-title">🎵 音乐层面</h3>
        <div class="info-card">{{ compatResult.musicMatch }}</div>
      </section>

      <!-- IQ/EQ匹配 -->
      <section v-if="compatResult.iqeqMatch" class="info-section">
        <h3 class="info-title">🧬 IQ/EQ 层面</h3>
        <div class="info-card">{{ compatResult.iqeqMatch }}</div>
      </section>

      <!-- 化学反应 -->
      <section class="info-section">
        <h3 class="info-title">⚡ 相处化学反应</h3>
        <div class="info-card">{{ compatResult.chemistry }}</div>
      </section>

      <!-- 摩擦点 -->
      <section class="info-section">
        <h3 class="info-title">⚠️ 潜在摩擦</h3>
        <div class="info-card">{{ compatResult.friction }}</div>
      </section>

      <!-- 建议 -->
      <section class="info-section">
        <h3 class="info-title">💡 给你们的建议</h3>
        <div class="info-card advice-card">{{ compatResult.advice }}</div>
      </section>

      <!-- 操作 -->
      <section class="actions">
        <button class="action-btn retake-btn" @click="reset">🔄 换一个人分析</button>
        <button class="action-btn home-btn" @click="$router.push('/profile')">👤 回到我的画像</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPersonalityProfile, getMusicResult, getIQEQProfile, exportProfile, importProfile, analyzeCompatibility } from '../utils/profile.js'

const importCode = ref('')
const loading = ref(false)
const compatResult = ref(null)
const errorMsg = ref('')
const myProfile = ref(null)

onMounted(() => {
  const p = getPersonalityProfile()
  const m = getMusicResult()
  const iqeq = getIQEQProfile()
  if (p || m || iqeq) {
    myProfile.value = {
      v: 1,
      p: p ? { profile: p.profile } : null,
      m: m ? { score: m.score, tasteLabel: m.tasteLabel, summary: m.summary } : null,
      iq: iqeq?.iq ? { iq: iqeq.iq.iq, label: iqeq.iq.label, desc: iqeq.iq.desc } : null,
      eq: iqeq?.eq ? { pct: iqeq.eq.pct, label: iqeq.eq.label, desc: iqeq.eq.desc } : null,
    }
  }
})

const compatColor = computed(() => {
  const s = compatResult.value?.overallScore || 50
  if (s >= 80) return '#81c784'
  if (s >= 60) return '#ffb74d'
  if (s >= 40) return '#ff8a65'
  return '#ef5350'
})

async function doAnalyze() {
  if (!importCode.value.trim() || !myProfile.value) return
  const theirs = importProfile(importCode.value)
  if (!theirs || !theirs.v) {
    errorMsg.value = '画像码无效，请检查后重试'
    return
  }
  errorMsg.value = ''
  loading.value = true
  try {
    compatResult.value = await analyzeCompatibility(myProfile.value, theirs)
  } catch (e) {
    errorMsg.value = '分析失败，请重试：' + (e.message || e)
  } finally {
    loading.value = false
  }
}

function reset() {
  compatResult.value = null
  importCode.value = ''
  errorMsg.value = ''
}
</script>

<style scoped>
.compare-page { min-height: 100vh; background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%); color: #f0e6d3; padding-bottom: 4rem; }

.page-header { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.5rem; background: rgba(15,12,41,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 10; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f0e6d3; cursor: pointer; flex-shrink: 0; transition: background 0.3s; }
.back-btn:hover { background: rgba(255,255,255,0.12); }
.page-header h1 { font-size: 1.15rem; font-weight: 700; flex: 1; }

.input-section { max-width: 560px; margin: 0 auto; padding: 2rem 1.5rem; text-align: center; }
.section-title-main { font-size: 1.3rem; color: #ba96f0; margin-bottom: 0.5rem; }
.section-desc { font-size: 0.85rem; color: rgba(240,230,211,0.4); margin-bottom: 1.5rem; }
.import-area { width: 100%; padding: 1rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f0e6d3; font-size: 0.78rem; font-family: ui-monospace, monospace; resize: vertical; outline: none; line-height: 1.6; }
.import-area:focus { border-color: rgba(186,150,240,0.4); }
.input-actions { margin-top: 1rem; }
.analyze-btn { padding: 0.7rem 2.5rem; border-radius: 50px; border: none; background: linear-gradient(135deg,#ba96f0,#7c5ce0); color: #fff; font-weight: 700; cursor: pointer; font-size: 1rem; font-family: inherit; transition: all 0.3s; }
.analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.analyze-btn:hover:not(:disabled) { box-shadow: 0 4px 24px rgba(186,150,240,0.35); }

.no-me-hint { margin-top: 1.5rem; padding: 1rem; border-radius: 12px; background: rgba(255,152,0,0.08); border: 1px solid rgba(255,152,0,0.12); }
.no-me-hint p { font-size: 0.85rem; color: rgba(240,230,211,0.5); margin-bottom: 0.8rem; }
.no-me-btns { display: flex; gap: 0.5rem; justify-content: center; }
.small-btn { padding: 0.4rem 1.2rem; border-radius: 50px; border: none; font-weight: 600; cursor: pointer; font-size: 0.85rem; font-family: inherit; }
.small-btn.gold { background: rgba(226,196,136,0.15); color: #e2c488; }
.small-btn.green { background: rgba(129,199,132,0.15); color: #81c784; }

.error-msg { margin-top: 0.8rem; padding: 0.5rem 0.8rem; border-radius: 10px; background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.18); color: #ef5350; font-size: 0.82rem; }

.loading-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; }
.vinyl-spinner { width: 60px; height: 60px; border-radius: 50%; border: 3px solid rgba(186,150,240,0.2); border-top-color: #ba96f0; animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-screen p { font-size: 1rem; color: rgba(240,230,211,0.5); }

.result-content { padding-bottom: 3rem; }
.score-section { text-align: center; padding: 2.5rem 1.5rem 1.5rem; }
.compat-circle-wrapper { width: 150px; height: 150px; margin: 0 auto 1.2rem; position: relative; }
.compat-ring { width: 150px; height: 150px; }
.compat-ring-fill { transition: stroke-dashoffset 1.5s ease; }
.compat-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; }
.compat-num { font-size: 2.8rem; font-weight: 800; color: #f0e6d3; }
.compat-pct { font-size: 1rem; color: rgba(240,230,211,0.4); }
.compat-label { font-size: 1.6rem; font-weight: 800; color: #ba96f0; margin-bottom: 0.4rem; }
.compat-verdict { max-width: 500px; margin: 0 auto; padding: 0.7rem 1.2rem; border-left: 3px solid #ba96f0; background: rgba(255,255,255,0.04); border-radius: 0 10px 10px 0; color: rgba(240,230,211,0.6); font-style: italic; font-size: 0.9rem; line-height: 1.6; }

.info-section { max-width: 640px; margin: 0 auto; padding: 0.8rem 1.5rem; }
.info-title { font-size: 1rem; font-weight: 700; color: #ba96f0; margin-bottom: 0.6rem; }
.info-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem 1.3rem; line-height: 1.8; color: rgba(240,230,211,0.7); font-size: 0.9rem; }
.advice-card { border-left: 3px solid rgba(186,150,240,0.3); }

.actions { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; padding: 2rem 1.5rem; }
.action-btn { padding: 0.7rem 1.8rem; border-radius: 50px; border: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.3s; }
.retake-btn { background: rgba(255,255,255,0.06); color: #f0e6d3; border: 1px solid rgba(255,255,255,0.12); }
.retake-btn:hover { background: rgba(255,255,255,0.1); }
.home-btn { background: linear-gradient(135deg,#ba96f0,#7c5ce0); color: #fff; }
.home-btn:hover { box-shadow: 0 4px 20px rgba(186,150,240,0.35); }
</style>
