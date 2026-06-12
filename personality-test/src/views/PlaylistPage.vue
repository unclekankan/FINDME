<template>
  <div class="playlist-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.push('/')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <h1>歌单分析</h1>
      <span class="header-badge">OCR + AI</span>
    </header>

    <!-- ====== 输入 ====== -->
    <template v-if="!result && !loading">
      <div class="input-section">
        <div class="tab-bar">
          <button class="tab-btn" :class="{ active: activeTab === 'image' }" @click="activeTab = 'image'">📷 图片导入</button>
          <button class="tab-btn" :class="{ active: activeTab === 'text' }" @click="activeTab = 'text'">📝 文字导入</button>
        </div>

        <!-- 图片 -->
        <div v-if="activeTab === 'image'" class="tab-content">
          <label v-if="!imagePreview" class="drop-zone" @dragover.prevent @drop.prevent="onDrop">
            <input type="file" accept="image/*" class="file-input" @change="onFileChange" />
            <span class="drop-icon">📸</span>
            <p class="drop-text">点击上传或拖拽歌单截图</p>
            <p class="drop-hint">Tesseract OCR 识别 · JPG/PNG/WebP · 最大 20MB</p>
          </label>
          <div v-else class="preview-area">
            <img :src="imagePreview" class="preview-img" alt="歌单截图" />
            <div class="preview-actions">
              <button class="btn-secondary" @click="clearImage">重新选择</button>
              <button class="btn-primary" @click="submitImage" :disabled="analyzing">
                {{ analyzing ? '识别中...' : '🔍 开始分析' }}
              </button>
            </div>
          </div>
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        </div>

        <!-- 文字 -->
        <div v-if="activeTab === 'text'" class="tab-content">
          <textarea v-model="textInput" class="text-area" placeholder="粘贴你的歌单...&#10;&#10;任意格式都行：&#10;• 歌名 — 歌手&#10;• 歌手 - 歌名&#10;• 网易云/QQ音乐/Spotify 导出文本&#10;• 纯文本歌单" rows="14"></textarea>
          <p class="char-count">{{ textInput.length }} 字</p>
          <div class="text-actions">
            <button class="btn-secondary" @click="textInput = ''" :disabled="!textInput">清空</button>
            <button class="btn-primary" @click="submitText" :disabled="!textInput.trim() || analyzing">
              {{ analyzing ? '分析中...' : '🔍 开始分析' }}
            </button>
          </div>
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        </div>
      </div>
    </template>

    <!-- ====== 加载 ====== -->
    <div v-if="loading" class="loading-screen">
      <div class="vinyl-spinner"></div>
      <p class="loading-text">{{ loadingText }}</p>
      <p class="loading-sub">{{ loadingSub }}</p>
      <!-- OCR 进度条 -->
      <div v-if="ocrProgress > 0 && ocrProgress < 100" class="ocr-progress">
        <div class="ocr-progress-bar">
          <div class="ocr-progress-fill" :style="{ width: ocrProgress + '%' }"></div>
        </div>
        <span>OCR 识别中 {{ ocrProgress }}%</span>
      </div>
    </div>

    <!-- ====== 结果 ====== -->
    <div v-if="result" class="result-content">
      <section class="score-section">
        <div class="score-circle-wrapper">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6" />
            <circle cx="60" cy="60" r="54" fill="none" :stroke="scoreColor" stroke-width="6" stroke-linecap="round"
              :stroke-dasharray="339.292"
              :stroke-dashoffset="339.292 * (1 - (result.score || 5) / 10)"
              transform="rotate(-90 60 60)" class="score-ring-fill" />
          </svg>
          <div class="score-inner">
            <span class="score-number">{{ result.score }}</span>
            <span class="score-unit">/ 10</span>
          </div>
        </div>
        <h2 class="taste-label">{{ result.tasteLevel }}</h2>
        <blockquote class="taste-summary">"{{ result.summary }}"</blockquote>
      </section>

      <section class="info-section">
        <h3 class="section-title">🎨 风格画像</h3>
        <div class="info-card"><p>{{ result.genreProfile }}</p></div>
        <div v-if="result.eraDistribution" class="info-card" style="margin-top:0.6rem">
          <p><strong>年代分布：</strong>{{ result.eraDistribution }}</p>
        </div>
      </section>

      <section v-if="result.songs?.length" class="info-section">
        <h3 class="section-title">📋 识别歌曲 ({{ result.songs.length }}首)</h3>
        <div class="info-card">
          <div class="song-grid">
            <span class="song-chip" v-for="(s, i) in result.songs" :key="i">
              {{ s.title }} <span class="chip-artist">— {{ s.artist }}</span>
            </span>
          </div>
        </div>
      </section>

      <section class="info-section">
        <div class="traits-grid">
          <div class="trait-card strength-card">
            <h3>👍 亮点</h3>
            <ul><li v-for="s in result.strengths" :key="s">{{ s }}</li></ul>
          </div>
          <div class="trait-card weakness-card">
            <h3>👎 盲区</h3>
            <ul><li v-for="w in result.weaknesses" :key="w">{{ w }}</li></ul>
          </div>
        </div>
      </section>

      <section v-if="result.recommendations?.length" class="info-section">
        <h3 class="section-title">💿 为你推荐</h3>
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

      <section v-if="result.personality" class="info-section">
        <h3 class="section-title">🎭 歌单主人画像</h3>
        <div class="info-card personality-card"><p>{{ result.personality }}</p></div>
      </section>

      <section class="actions">
        <button class="action-btn retake-btn" @click="reset">🔄 重新分析</button>
        <button class="action-btn home-btn" @click="$router.push('/')">🏠 回到首页</button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fileToBase64, ocrImage, analyzeText } from '../utils/playlist.js'
import { getPlaylistResult, setPlaylistResult } from '../utils/profile.js'

const activeTab = ref('image')
const imagePreview = ref(null)
const imageBase64 = ref(null)
const textInput = ref('')
const loading = ref(false)
const analyzing = ref(false)
const result = ref(null)
const errorMsg = ref('')
const loadingText = ref('')
const loadingSub = ref('')
const ocrProgress = ref(0)

const scoreColor = computed(() => {
  const s = result.value?.score || 5
  if (s >= 8) return '#81c784'
  if (s >= 6) return '#ffb74d'
  if (s >= 4) return '#ff8a65'
  return '#ef5350'
})

// ===== 图片 =====
function onFileChange(e) { const f = e.target.files?.[0]; if (f) processFile(f) }
function onDrop(e) { const f = e.dataTransfer?.files?.[0]; if (f) processFile(f) }

async function processFile(file) {
  errorMsg.value = ''
  try {
    const b64 = await fileToBase64(file)
    imageBase64.value = b64
    imagePreview.value = b64
  } catch (e) { errorMsg.value = e.message }
}
function clearImage() { imagePreview.value = null; imageBase64.value = null }

// ===== 提交 =====
async function submitImage() {
  if (!imageBase64.value) return
  analyzing.value = true; loading.value = true; errorMsg.value = ''; ocrProgress.value = 0
  loadingText.value = '正在 OCR 识别歌单文字...'
  loadingSub.value = 'Tesseract 引擎运行中（客户端，安全不联网）'
  try {
    const ocrText = await ocrImage(imageBase64.value)
    ocrProgress.value = 100
    if (!ocrText || ocrText.length < 5) throw new Error('OCR 未识别到文字，请确保截图清晰，或改用文字导入。')
    loadingText.value = 'AI 正在分析你的歌单品味...'
    loadingSub.value = `已识别 ${ocrText.length} 个字符，正在解码品味...`
    result.value = await analyzeText(ocrText)
    setPlaylistResult(result.value)
  } catch (e) { errorMsg.value = e.message || String(e) }
  finally { analyzing.value = false; loading.value = false }
}

async function submitText() {
  if (!textInput.value.trim()) return
  analyzing.value = true; loading.value = true; errorMsg.value = ''
  loadingText.value = 'AI 正在解析文本并分析品味...'
  try {
    result.value = await analyzeText(textInput.value)
    setPlaylistResult(result.value)
  }
  catch (e) { errorMsg.value = e.message || String(e) }
  finally { analyzing.value = false; loading.value = false }
}

function reset() {
  result.value = null; imagePreview.value = null; imageBase64.value = null
  textInput.value = ''; errorMsg.value = ''; ocrProgress.value = 0
}

// mount 时尝试恢复历史结果
onMounted(() => {
  const saved = getPlaylistResult()
  if (saved) result.value = saved
})
</script>

<style scoped>
.playlist-page { min-height: 100vh; background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%); color: #f0e6d3; }

/* header */
.page-header { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.5rem; background: rgba(15,12,41,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 10; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f0e6d3; cursor: pointer; flex-shrink: 0; transition: background 0.3s; }
.back-btn:hover { background: rgba(255,255,255,0.12); }
.page-header h1 { font-size: 1.15rem; font-weight: 700; flex: 1; }
.header-badge { padding: 0.2rem 0.7rem; border-radius: 50px; background: rgba(186,150,240,0.12); border: 1px solid rgba(186,150,240,0.2); color: #ba96f0; font-size: 0.72rem; }

/* input */
.input-section { max-width: 640px; margin: 0 auto; padding: 1.5rem; }
.tab-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: rgba(255,255,255,0.04); border-radius: 14px; padding: 0.3rem; }
.tab-btn { flex: 1; padding: 0.65rem; border-radius: 11px; border: none; background: transparent; color: rgba(240,230,211,0.5); font-size: 0.95rem; cursor: pointer; transition: all 0.3s; font-family: inherit; }
.tab-btn.active { background: rgba(186,150,240,0.12); color: #ba96f0; font-weight: 600; }
.tab-content { display: flex; flex-direction: column; gap: 1rem; }

.drop-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; border: 2px dashed rgba(255,255,255,0.12); border-radius: 20px; cursor: pointer; transition: all 0.3s; background: rgba(255,255,255,0.02); }
.drop-zone:hover { border-color: rgba(186,150,240,0.35); background: rgba(255,255,255,0.05); }
.file-input { display: none; }
.drop-icon { font-size: 3rem; margin-bottom: 1rem; }
.drop-text { font-size: 1rem; color: rgba(240,230,211,0.7); margin-bottom: 0.4rem; }
.drop-hint { font-size: 0.8rem; color: rgba(240,230,211,0.3); }

.preview-area { display: flex; flex-direction: column; gap: 1rem; }
.preview-img { width: 100%; max-height: 400px; object-fit: contain; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); }
.preview-actions, .text-actions { display: flex; gap: 0.8rem; justify-content: flex-end; }

.btn-primary, .btn-secondary { padding: 0.65rem 1.8rem; border-radius: 50px; border: none; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s; font-family: inherit; }
.btn-primary { background: linear-gradient(135deg, #ba96f0, #7c5ce0); color: #fff; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(186,150,240,0.35); }
.btn-secondary { background: rgba(255,255,255,0.06); color: #f0e6d3; border: 1px solid rgba(255,255,255,0.12); }
.btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.1); }

.text-area { width: 100%; padding: 1rem 1.2rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f0e6d3; font-size: 0.9rem; line-height: 1.8; resize: vertical; font-family: system-ui, sans-serif; outline: none; }
.text-area:focus { border-color: rgba(186,150,240,0.4); }
.text-area::placeholder { color: rgba(240,230,211,0.25); }
.char-count { text-align: right; font-size: 0.75rem; color: rgba(240,230,211,0.25); margin-top: -0.5rem; }

.error-msg { padding: 0.5rem 0.8rem; border-radius: 10px; background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.18); color: #ef5350; font-size: 0.82rem; }

.key-prompt { display: flex; gap: 0.5rem; }
.key-input-inline { flex: 1; padding: 0.55rem 0.8rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #f0e6d3; font-size: 0.85rem; outline: none; font-family: ui-monospace, monospace; }
.key-input-inline:focus { border-color: #ba96f0; }
.key-save-btn { padding: 0.55rem 1.2rem; border-radius: 10px; border: none; background: #ba96f0; color: #fff; font-weight: 600; cursor: pointer; }

/* loading */
.loading-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; }
.vinyl-spinner { width: 60px; height: 60px; border-radius: 50%; border: 3px solid rgba(186,150,240,0.2); border-top-color: #ba96f0; animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 1.1rem; color: #f0e6d3; margin-bottom: 0.4rem; }
.loading-sub { font-size: 0.85rem; color: rgba(240,230,211,0.4); }

.ocr-progress { margin-top: 1.5rem; max-width: 300px; width: 100%; }
.ocr-progress-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); overflow: hidden; margin-bottom: 0.5rem; }
.ocr-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #ba96f0, #7c5ce0); transition: width 0.5s; }
.ocr-progress span { font-size: 0.78rem; color: rgba(240,230,211,0.4); }

/* result */
.result-content { padding-bottom: 3rem; }
.score-section { text-align: center; padding: 2.5rem 1.5rem 1.5rem; }
.score-circle-wrapper { width: 130px; height: 130px; margin: 0 auto 1.2rem; position: relative; }
.score-ring { width: 130px; height: 130px; }
.score-ring-fill { transition: stroke-dashoffset 1.5s ease; }
.score-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.score-number { font-size: 2.5rem; font-weight: 800; color: #f0e6d3; line-height: 1; }
.score-unit { font-size: 0.75rem; color: rgba(240,230,211,0.4); }
.taste-label { font-size: 1.6rem; font-weight: 800; color: #ba96f0; margin-bottom: 0.6rem; }
.taste-summary { max-width: 500px; margin: 0 auto; padding: 0.8rem 1.2rem; border-left: 3px solid #ba96f0; background: rgba(255,255,255,0.04); border-radius: 0 10px 10px 0; color: rgba(240,230,211,0.65); font-style: italic; font-size: 0.9rem; line-height: 1.6; }

.info-section { max-width: 640px; margin: 0 auto; padding: 0.8rem 1.5rem; }
.section-title { font-size: 1.05rem; font-weight: 700; color: #ba96f0; margin-bottom: 0.7rem; }
.info-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem 1.3rem; line-height: 1.8; color: rgba(240,230,211,0.75); font-size: 0.9rem; }
.personality-card { border-left: 3px solid rgba(186,150,240,0.3); }

.song-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.song-chip { display: inline-block; padding: 0.3rem 0.7rem; border-radius: 8px; background: rgba(186,150,240,0.08); border: 1px solid rgba(186,150,240,0.12); font-size: 0.82rem; color: rgba(240,230,211,0.8); }
.chip-artist { color: rgba(240,230,211,0.35); }

.traits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
.trait-card { border-radius: 14px; padding: 1rem 1.2rem; }
.trait-card h3 { font-size: 0.95rem; margin-bottom: 0.5rem; }
.trait-card ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
.trait-card li { font-size: 0.83rem; line-height: 1.6; padding-left: 1rem; position: relative; }
.trait-card li::before { content: ''; position: absolute; left: 0; top: 0.5em; width: 5px; height: 5px; border-radius: 50%; }
.strength-card { background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.15); }
.strength-card h3 { color: #81c784; }
.strength-card li::before { background: #81c784; }
.weakness-card { background: rgba(255,152,0,0.08); border: 1px solid rgba(255,152,0,0.15); }
.weakness-card h3 { color: #ffb74d; }
.weakness-card li::before { background: #ffb74d; }

.rec-list { display: flex; flex-direction: column; gap: 0.6rem; }
.rec-item { display: flex; gap: 0.8rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 0.8rem 1rem; }
.rec-index { width: 28px; height: 28px; border-radius: 50%; background: rgba(186,150,240,0.1); color: #ba96f0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
.rec-info h4 { font-size: 0.9rem; color: #f0e6d3; margin-bottom: 0.2rem; }
.rec-artist { color: #ba96f0; }
.rec-info p { color: rgba(240,230,211,0.45); font-size: 0.78rem; }

.actions { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; padding: 2rem 1.5rem; }
.action-btn { padding: 0.7rem 1.8rem; border-radius: 50px; border: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.3s; font-family: inherit; }
.retake-btn { background: rgba(255,255,255,0.06); color: #f0e6d3; border: 1px solid rgba(255,255,255,0.12); }
.retake-btn:hover { background: rgba(255,255,255,0.1); }
.home-btn { background: linear-gradient(135deg, #ba96f0, #7c5ce0); color: #fff; }
.home-btn:hover { box-shadow: 0 4px 20px rgba(186,150,240,0.35); }

@media (max-width: 500px) { .traits-grid { grid-template-columns: 1fr; } }
</style>
