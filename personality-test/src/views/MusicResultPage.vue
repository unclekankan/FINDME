<template>
  <div class="result-page">
    <!-- 无数据 -->
    <div v-if="!result" class="not-found">
      <span class="nf-emoji">🎵</span>
      <h2>暂无测试结果</h2>
      <p>请先完成音乐品味测试</p>
      <button class="go-btn" @click="$router.push('/music-test')">去测试</button>
    </div>

    <template v-else>
      <!-- 顶部评分卡片 -->
      <section class="score-section">
        <div class="score-circle-wrapper">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              :stroke="scoreColor"
              stroke-width="6"
              stroke-linecap="round"
              :stroke-dasharray="339.292"
              :stroke-dashoffset="339.292 * (1 - result.score / 10)"
              transform="rotate(-90 60 60)"
              class="score-ring-fill"
            />
          </svg>
          <div class="score-inner">
            <span class="score-number">{{ result.score }}</span>
            <span class="score-unit">/ 10</span>
          </div>
        </div>

        <h1 class="taste-label">{{ result.tasteLabel }}</h1>
        <p class="taste-summary">"{{ result.summary }}"</p>
        <p class="taste-date" v-if="testDate">测试完成于 {{ testDate }}</p>
      </section>

      <!-- 分析 -->
      <section class="analysis-section">
        <h2 class="section-title">
          <span class="section-icon">🔍</span> 深度分析
        </h2>
        <div class="analysis-card">
          <p>{{ result.analysis }}</p>
        </div>
      </section>

      <!-- 优势 & 劣势 -->
      <section class="traits-section">
        <div class="traits-grid">
          <div class="trait-card strength-card">
            <h3>🎯 品味亮点</h3>
            <ul>
              <li v-for="s in result.strengths" :key="s">{{ s }}</li>
            </ul>
          </div>
          <div class="trait-card weakness-card">
            <h3>⚠️ 品味盲区</h3>
            <ul>
              <li v-for="w in result.weaknesses" :key="w">{{ w }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 推荐 -->
      <section class="recommendations-section" v-if="result.recommendations?.length">
        <h2 class="section-title">
          <span class="section-icon">💿</span> 为你推荐
        </h2>
        <div class="rec-list">
          <div class="rec-item" v-for="(r, i) in result.recommendations" :key="i">
            <div class="rec-index">{{ i + 1 }}</div>
            <div class="rec-info">
              <h4>{{ r.song }} <span class="rec-artist">— {{ r.artist }}</span></h4>
              <p>{{ r.why }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 音乐人格 -->
      <section class="personality-section" v-if="result.musicPersonality">
        <h2 class="section-title">
          <span class="section-icon">🎭</span> 音乐人格
        </h2>
        <div class="personality-card">
          <p>{{ result.musicPersonality }}</p>
        </div>
      </section>

      <!-- 操作 -->
      <section class="actions">
        <button class="action-btn retake-btn" @click="retake">🔄 重新测试</button>
        <button class="action-btn profile-btn" @click="$router.push('/profile')">👤 查看我的画像</button>
        <button class="action-btn home-btn" @click="$router.push('/')">🏠 回到首页</button>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMusicResult } from '../utils/profile.js'

const router = useRouter()
const result = ref(null)
const testDate = ref('')

onMounted(() => {
  // 优先 sessionStorage，fallback 到 localStorage（通过 profile.js 的 getMusicResult）
  const raw = sessionStorage.getItem('music_taste_result') || localStorage.getItem('music_taste_result')
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      result.value = parsed
      testDate.value = formatDate(parsed.ts || Date.now())
    } catch { result.value = null }
  }
})

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const scoreColor = computed(() => {
  const s = result.value?.score || 0
  if (s >= 8) return '#81c784'
  if (s >= 6) return '#ffb74d'
  if (s >= 4) return '#ff8a65'
  return '#ef5350'
})

function retake() {
  sessionStorage.removeItem('music_taste_result')
  router.push('/music-test')
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 30%, #24243e 100%);
  color: #f0e6d3;
  padding-bottom: 3rem;
}

/* ===== 无数据 ===== */
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}
.nf-emoji { font-size: 4rem; }
.not-found h2 { color: #81c784; }
.not-found p { color: rgba(240, 230, 211, 0.5); }
.go-btn {
  padding: 0.7rem 2rem;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #81c784, #4caf50);
  color: #0f0c29;
  font-weight: 700;
  cursor: pointer;
}

/* ===== 评分区 ===== */
.score-section {
  text-align: center;
  padding: 3rem 1.5rem 2rem;
}

.score-circle-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 1.5rem;
}

.score-ring {
  width: 140px;
  height: 140px;
}

.score-ring-fill {
  transition: stroke-dashoffset 1.5s ease;
}

.score-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-number {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1;
  color: #f0e6d3;
}

.score-unit {
  font-size: 0.8rem;
  color: rgba(240, 230, 211, 0.4);
}

.taste-label {
  font-size: 2rem;
  font-weight: 800;
  color: #81c784;
  margin-bottom: 0.8rem;
}

.taste-summary {
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  border-left: 3px solid #81c784;
  color: rgba(240, 230, 211, 0.7);
  font-style: italic;
  font-size: 0.95rem;
  line-height: 1.7;
}
.taste-date {
  margin-top: 0.6rem;
  font-size: 0.75rem;
  color: rgba(240, 230, 211, 0.3);
}

/* ===== 通用区块 ===== */
section {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #81c784;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ===== 分析 ===== */
.analysis-card, .personality-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1.3rem 1.5rem;
  line-height: 1.9;
  color: rgba(240, 230, 211, 0.8);
  font-size: 0.95rem;
  white-space: pre-line;
}

/* ===== 优势/劣势 ===== */
.traits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.trait-card {
  border-radius: 14px;
  padding: 1.2rem 1.3rem;
}

.trait-card h3 {
  font-size: 1rem;
  margin-bottom: 0.7rem;
}

.trait-card ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trait-card li {
  font-size: 0.88rem;
  line-height: 1.6;
  padding-left: 1.2rem;
  position: relative;
}

.trait-card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.strength-card {
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.15);
  color: rgba(240, 230, 211, 0.85);
}
.strength-card h3 { color: #81c784; }
.strength-card li::before { background: #81c784; }

.weakness-card {
  background: rgba(255, 152, 0, 0.08);
  border: 1px solid rgba(255, 152, 0, 0.15);
  color: rgba(240, 230, 211, 0.85);
}
.weakness-card h3 { color: #ffb74d; }
.weakness-card li::before { background: #ffb74d; }

/* ===== 推荐 ===== */
.rec-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.rec-item {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1rem 1.2rem;
  transition: border-color 0.3s;
}
.rec-item:hover { border-color: rgba(129, 199, 132, 0.25); }

.rec-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(129, 199, 132, 0.12);
  color: #81c784;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.rec-info h4 {
  font-size: 0.95rem;
  color: #f0e6d3;
  margin-bottom: 0.25rem;
}
.rec-artist { color: #81c784; font-weight: 500; }
.rec-info p { color: rgba(240, 230, 211, 0.5); font-size: 0.82rem; line-height: 1.5; }

/* ===== 操作区 ===== */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 2rem 1.5rem;
}

.action-btn {
  padding: 0.8rem 2rem;
  border-radius: 50px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.retake-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #f0e6d3;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.retake-btn:hover { background: rgba(255, 255, 255, 0.15); }

.profile-btn { background: rgba(186,150,240,0.1); color: #ba96f0; border: 1px solid rgba(186,150,240,0.2); }
.profile-btn:hover { background: rgba(186,150,240,0.18); }
.home-btn { background: linear-gradient(135deg, #81c784, #4caf50); color: #0f0c29; font-weight: 700; }
.home-btn:hover { box-shadow: 0 4px 24px rgba(129, 199, 132, 0.4); }

@media (max-width: 500px) {
  .traits-grid { grid-template-columns: 1fr; }
  .taste-label { font-size: 1.4rem; }
}
</style>
