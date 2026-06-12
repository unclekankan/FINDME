<template>
  <div class="profile-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.push('/')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1>我的画像</h1>
      <span class="header-badge">FindMe</span>
    </header>

    <!-- 所有测试都没做 -->
    <div v-if="!personality && !musicResult && !iqeq" class="empty-state">
      <span class="empty-emoji">🫥</span>
      <h2>还没有任何数据</h2>
      <p>完成至少一个测试来生成你的个人画像</p>
      <div class="empty-actions">
        <button class="go-btn gold" @click="$router.push('/test')">🧠 人格测试</button>
        <button class="go-btn green" @click="$router.push('/music-test')">🎵 音乐测试</button>
        <button class="go-btn blue" @click="$router.push('/iqeq')">🧬 智商情商</button>
      </div>
    </div>

    <template v-else>
      <!-- ===== 顶部总结 ===== -->
      <section v-if="portrait" class="portrait-section">
        <h2 class="portrait-title">{{ portrait.title }}</h2>
        <p class="portrait-text">{{ portrait.portrait }}</p>
        <blockquote class="portrait-motto">"{{ portrait.motto }}"</blockquote>
      </section>

      <!-- ===== 两列 ===== -->
      <div class="dual-columns">
        <!-- 人格 -->
        <section v-if="personality" class="col-card personality-col">
          <h3 @click="$router.push('/result')">🧠 大五人格 <span class="col-action">→</span></h3>
          <div class="dim-bars">
            <div class="dim-row" v-for="dim in dims" :key="dim.key">
              <span class="dim-emoji">{{ dim.emoji }}</span>
              <span class="dim-name">{{ dim.label }}</span>
              <span class="dim-label">{{ personality.profile[dim.key].label }}</span>
              <div class="dim-mini-bar"><div class="dim-mini-fill" :style="{width:personality.profile[dim.key].percent+'%'}"></div></div>
              <span class="dim-pct">{{ personality.profile[dim.key].percent }}%</span>
            </div>
          </div>
        </section>

        <!-- 音乐 -->
        <section v-if="musicResult" class="col-card music-col">
          <h3 @click="$router.push('/music-result')">🎵 音乐品味 <span class="col-action">→</span></h3>
          <div class="music-score-row">
            <div class="mini-score-circle">
              <span class="mini-score-num">{{ musicResult.score }}</span>
              <span class="mini-score-unit">/10</span>
            </div>
            <div class="music-info">
              <p class="music-label">{{ musicResult.tasteLabel }}</p>
              <p class="music-summary">{{ musicResult.summary }}</p>
            </div>
          </div>
        </section>

        <!-- IQ/EQ -->
        <section v-if="iqeq" class="col-card iqeq-col">
          <h3 @click="$router.push('/iqeq-result')">🧬 智商·情商 <span class="col-action">→</span></h3>
          <div class="iqeq-dual">
            <div class="iqeq-item" v-if="iqeq.iq">
              <div class="iqeq-mini-circle iq-mini">{{ iqeq.iq.iq }}</div>
              <span class="iqeq-item-label">IQ {{ iqeq.iq.label }}</span>
            </div>
            <div class="iqeq-item" v-if="iqeq.eq">
              <div class="iqeq-mini-circle eq-mini">{{ iqeq.eq.pct }}<span class="iqeq-unit">%</span></div>
              <span class="iqeq-item-label">EQ {{ iqeq.eq.label }}</span>
            </div>
          </div>
        </section>

        <!-- 未完成的提示 -->
        <section v-if="!personality" class="col-card empty-col">
          <h3>🧠 大五人格</h3>
          <p class="col-hint">尚未测试</p>
          <button class="col-btn gold" @click="$router.push('/test')">去测试 →</button>
        </section>
        <section v-if="!musicResult" class="col-card empty-col">
          <h3>🎵 音乐品味</h3>
          <p class="col-hint">尚未测试</p>
          <button class="col-btn green" @click="$router.push('/music-test')">去测试 →</button>
        </section>
        <section v-if="!iqeq" class="col-card empty-col">
          <h3>🧬 智商·情商</h3>
          <p class="col-hint">尚未测试</p>
          <button class="col-btn blue" @click="$router.push('/iqeq')">去测试 →</button>
        </section>
      </div>

      <!-- ===== 他人眼中的我 ===== -->
      <section v-if="othersView" class="others-section">
        <h2 class="section-title">👁️ 别人眼中的你</h2>
        <div class="others-grid">
          <div class="others-card">
            <span class="others-icon">💼</span>
            <h4>工作中</h4>
            <p>{{ othersView.work }}</p>
          </div>
          <div class="others-card">
            <span class="others-icon">🎉</span>
            <h4>社交中</h4>
            <p>{{ othersView.social }}</p>
          </div>
          <div class="others-card">
            <span class="others-icon">🏠</span>
            <h4>独处时</h4>
            <p>{{ othersView.alone }}</p>
          </div>
          <div class="others-card highlight-card">
            <span class="others-icon">🫣</span>
            <h4>你可能没意识到</h4>
            <p>{{ othersView.blindspot }}</p>
          </div>
        </div>
        <div class="first-impression">
          <span class="fi-label">第一印象</span>
          <p>{{ othersView.firstImpression }}</p>
          <span class="nickname-tag">🃏 {{ othersView.nickname }}</span>
        </div>
      </section>

      <!-- 加载"他人眼中的我" -->
      <div v-if="loadingOthers" class="loading-others">
        <div class="tiny-spinner"></div>
        <span>AI 正在分析别人眼中的你...</span>
      </div>
      <button v-if="!othersView && !loadingOthers && bothDone" class="gen-btn" @click="loadOthersView">
        🔮 生成「别人眼中的我」
      </button>

      <!-- ===== 导出 & 比对 ===== -->
      <section class="actions-section">
        <button class="action-card export-card" @click="doExport" :disabled="!bothDone">
          <span class="action-icon">📤</span>
          <div class="action-info">
            <h4>导出我的画像</h4>
            <p>生成分享码，让别人导入来分析契合度</p>
          </div>
          <span class="action-arrow">→</span>
        </button>

        <button class="action-card compare-card" @click="$router.push('/compare')">
          <span class="action-icon">🔗</span>
          <div class="action-info">
            <h4>分析契合度</h4>
            <p>导入另一个人的画像码，看看你们的适配程度</p>
          </div>
          <span class="action-arrow">→</span>
        </button>
      </section>

      <!-- 导出弹窗 -->
      <div v-if="showExport" class="modal-overlay" @click.self="showExport = false">
        <div class="modal-card">
          <h3>📤 分享你的画像</h3>
          <p>复制下面的码发给对方，让ta导入来分析契合度</p>
          <textarea readonly class="export-code" rows="5" @click="$event.target.select()">{{ exportCode }}</textarea>
          <div class="modal-actions">
            <button class="copy-btn" @click="copyCode">{{ copied ? '✅ 已复制' : '📋 复制' }}</button>
            <button class="close-btn" @click="showExport = false">关闭</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { dimensions } from '../data/questions.js'
import {
  getPersonalityProfile, getMusicResult, getIQEQProfile, hasBoth,
  exportProfile, generateOthersView, generatePortrait,
} from '../utils/profile.js'

const personality = ref(null)
const musicResult = ref(null)
const iqeq = ref(null)
const portrait = ref(null)
const othersView = ref(null)
const loadingOthers = ref(false)
const showExport = ref(false)
const exportCode = ref('')
const copied = ref(false)

const bothDone = computed(() => hasBoth())

const dims = computed(() => {
  const p = personality.value
  if (!p) return dimensions.map(d => ({ key: d.key, label: d.label, emoji: d.emoji }))
  return dimensions.map(d => ({
    key: d.key, label: d.label, emoji: d.emoji,
  }))
})

onMounted(async () => {
  personality.value = getPersonalityProfile()
  musicResult.value = getMusicResult()
  iqeq.value = getIQEQProfile()

  if (hasBoth()) {
    try {
      portrait.value = await generatePortrait()
    } catch {}
  }
})

async function loadOthersView() {
  if (!hasBoth()) return
  loadingOthers.value = true
  try {
    othersView.value = await generateOthersView()
  } catch {}
  finally { loadingOthers.value = false }
}

function doExport() {
  if (!hasBoth()) return
  exportCode.value = exportProfile()
  copied.value = false
  showExport.value = true
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(exportCode.value)
    copied.value = true
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = exportCode.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
  }
}
</script>

<style scoped>
.profile-page { min-height: 100vh; background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%); color: #f0e6d3; padding-bottom: 4rem; }

.page-header { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.5rem; background: rgba(15,12,41,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 10; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f0e6d3; cursor: pointer; flex-shrink: 0; transition: background 0.3s; }
.back-btn:hover { background: rgba(255,255,255,0.12); }
.page-header h1 { font-size: 1.15rem; font-weight: 700; flex: 1; }
.header-badge { padding: 0.2rem 0.7rem; border-radius: 50px; background: rgba(226,196,136,0.12); border: 1px solid rgba(226,196,136,0.2); color: #e2c488; font-size: 0.72rem; }

/* empty */
.empty-state { text-align: center; padding: 5rem 2rem; }
.empty-emoji { font-size: 4rem; display: block; margin-bottom: 1rem; }
.empty-state h2 { color: #e2c488; margin-bottom: 0.5rem; }
.empty-state p { color: rgba(240,230,211,0.5); margin-bottom: 2rem; }
.empty-actions { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; }
.go-btn { padding: 0.7rem 1.8rem; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; font-size: 0.95rem; font-family: inherit; }
.go-btn.gold { background: linear-gradient(135deg,#e2c488,#c9974a); color: #0f0c29; }
.go-btn.green { background: linear-gradient(135deg,#81c784,#4caf50); color: #0f0c29; }
.go-btn.blue { background: linear-gradient(135deg,#64b4ff,#3b82f6); color: #fff; }

/* portrait */
.portrait-section { max-width: 640px; margin: 0 auto; padding: 2rem 1.5rem 1rem; text-align: center; }
.portrait-title { font-size: 1.4rem; font-weight: 800; color: #e2c488; margin-bottom: 0.8rem; }
.portrait-text { font-size: 0.95rem; line-height: 2; color: rgba(240,230,211,0.75); }
.portrait-motto { margin-top: 1rem; padding: 0.6rem 1.2rem; border-left: 3px solid #e2c488; background: rgba(255,255,255,0.04); border-radius: 0 10px 10px 0; color: rgba(240,230,211,0.5); font-style: italic; font-size: 0.9rem; }

/* dual columns */
.dual-columns { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.col-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 1.2rem 1.3rem; }
.col-card h3 { font-size: 1rem; margin-bottom: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
.col-action { font-size: 0.8rem; opacity: 0.3; }
.personality-col h3 { color: #e2c488; }
.music-col h3 { color: #81c784; }
.dim-row { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem; font-size: 0.8rem; }
.dim-emoji { flex-shrink: 0; }
.dim-name { width: 3.2rem; color: rgba(240,230,211,0.5); }
.dim-label { width: 5.5rem; color: rgba(240,230,211,0.4); font-size: 0.72rem; }
.dim-mini-bar { flex: 1; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.08); overflow: hidden; }
.dim-mini-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg,#e2c488,#c9974a); transition: width 1s ease; }
.dim-pct { width: 2.5rem; text-align: right; color: rgba(240,230,211,0.4); font-size: 0.72rem; }

.music-score-row { display: flex; gap: 1rem; align-items: center; }
.mini-score-circle { width: 56px; height: 56px; border-radius: 50%; background: rgba(129,199,132,0.1); border: 2px solid rgba(129,199,132,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.mini-score-num { font-size: 1.3rem; font-weight: 800; color: #81c784; line-height: 1; }
.mini-score-unit { font-size: 0.6rem; color: rgba(240,230,211,0.3); }
.music-info { flex: 1; }
.music-label { font-size: 0.9rem; font-weight: 600; color: #81c784; margin-bottom: 0.3rem; }
.music-summary { font-size: 0.78rem; color: rgba(240,230,211,0.5); line-height: 1.5; }

.iqeq-col h3 { color: #64b4ff; }
.iqeq-dual { display: flex; gap: 1.5rem; justify-content: center; }
.iqeq-item { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.iqeq-mini-circle { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; flex-shrink: 0; }
.iq-mini { background: rgba(100,180,255,0.1); border: 2px solid rgba(100,180,255,0.3); color: #64b4ff; }
.eq-mini { background: rgba(255,150,180,0.1); border: 2px solid rgba(255,150,180,0.3); color: #ff96b4; font-size: 1rem; }
.iqeq-unit { font-size: 0.55rem; opacity: 0.5; margin-left: 1px; }
.iqeq-item-label { font-size: 0.75rem; color: rgba(240,230,211,0.5); }

.empty-col { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.empty-col h3 { color: rgba(240,230,211,0.3); }
.col-hint { font-size: 0.85rem; color: rgba(240,230,211,0.25); }
.col-btn { padding: 0.4rem 1.2rem; border-radius: 50px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.col-btn.gold { background: rgba(226,196,136,0.15); color: #e2c488; }
.col-btn.green { background: rgba(129,199,132,0.15); color: #81c784; }
.col-btn.blue { background: rgba(100,180,255,0.15); color: #64b4ff; }

/* others section */
.others-section { max-width: 900px; margin: 2rem auto 0; padding: 0 1.5rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #ba96f0; margin-bottom: 1rem; }
.others-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1rem; }
.others-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem 1.2rem; }
.others-card.highlight-card { border-color: rgba(186,150,240,0.2); background: rgba(186,150,240,0.05); }
.others-icon { font-size: 1.5rem; display: block; margin-bottom: 0.4rem; }
.others-card h4 { font-size: 0.9rem; color: #ba96f0; margin-bottom: 0.4rem; }
.others-card p { font-size: 0.82rem; color: rgba(240,230,211,0.65); line-height: 1.7; }

.first-impression { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem 1.3rem; text-align: center; }
.fi-label { font-size: 0.75rem; color: rgba(240,230,211,0.3); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.3rem; }
.first-impression p { font-size: 0.9rem; color: rgba(240,230,211,0.7); line-height: 1.6; margin-bottom: 0.5rem; }
.nickname-tag { display: inline-block; padding: 0.25rem 0.8rem; border-radius: 50px; background: rgba(186,150,240,0.1); border: 1px solid rgba(186,150,240,0.15); color: #ba96f0; font-size: 0.82rem; }

.loading-others { max-width: 900px; margin: 1rem auto; padding: 0 1.5rem; display: flex; align-items: center; gap: 0.8rem; font-size: 0.85rem; color: rgba(240,230,211,0.4); }
.tiny-spinner { width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(186,150,240,0.2); border-top-color: #ba96f0; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.gen-btn { display: block; margin: 1rem auto; padding: 0.7rem 2rem; border-radius: 50px; border: 1px solid rgba(186,150,240,0.3); background: rgba(186,150,240,0.08); color: #ba96f0; font-size: 0.95rem; cursor: pointer; font-family: inherit; transition: all 0.3s; }
.gen-btn:hover { background: rgba(186,150,240,0.15); }

/* actions */
.actions-section { max-width: 900px; margin: 2rem auto 0; padding: 0 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
.action-card { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.3rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.3s; text-align: left; font-family: inherit; color: #f0e6d3; }
.action-card:hover:not(:disabled) { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); }
.action-card:disabled { opacity: 0.35; cursor: not-allowed; }
.action-icon { font-size: 1.8rem; flex-shrink: 0; }
.action-info { flex: 1; }
.action-info h4 { font-size: 0.95rem; color: #f0e6d3; margin-bottom: 0.2rem; }
.action-info p { font-size: 0.8rem; color: rgba(240,230,211,0.4); }
.action-arrow { font-size: 1.2rem; color: rgba(240,230,211,0.2); }

/* modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1.5rem; }
.modal-card { background: #1a1a3e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 2rem; max-width: 500px; width: 100%; text-align: center; }
.modal-card h3 { color: #e2c488; margin-bottom: 0.5rem; }
.modal-card p { color: rgba(240,230,211,0.5); font-size: 0.85rem; margin-bottom: 1rem; }
.export-code { width: 100%; padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #f0e6d3; font-size: 0.72rem; font-family: ui-monospace, monospace; resize: none; outline: none; }
.modal-actions { display: flex; gap: 0.6rem; justify-content: center; margin-top: 1rem; }
.copy-btn, .close-btn { padding: 0.5rem 1.5rem; border-radius: 50px; border: none; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 0.9rem; }
.copy-btn { background: linear-gradient(135deg,#e2c488,#c9974a); color: #0f0c29; }
.close-btn { background: rgba(255,255,255,0.08); color: rgba(240,230,211,0.6); }

@media (max-width: 600px) {
  .dual-columns, .others-grid { grid-template-columns: 1fr; }
}
</style>
