<template>
  <div class="music-test-page">
    <!-- ====== Key 输入 ====== -->
    <div v-if="stage === 'key'" class="key-screen">
      <div class="key-card">
        <span class="key-emoji">🔑</span>
        <h2>需要 DeepSeek API Key</h2>
        <p class="key-desc">
          本测试使用 DeepSeek AI 驱动，每次选择都会影响后续题目，
          最终给出客观犀利的品味评价。
        </p>
        <div class="key-input-row">
          <input
            v-model="apiKeyInput"
            type="password"
            placeholder="sk-xxxxxxxxxxxxxxxx"
            class="key-input"
            @keyup.enter="saveKey"
          />
          <button class="key-btn" @click="saveKey" :disabled="!apiKeyInput.trim()">确认</button>
        </div>
        <p class="key-hint">
          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener">去 DeepSeek 获取 Key →</a>
        </p>
        <button class="back-link" @click="$router.push('/')">← 返回首页</button>
        <div v-if="keyError" class="key-error">{{ keyError }}</div>
      </div>
    </div>

    <!-- ====== 测试中 ====== -->
    <template v-if="stage === 'testing'">
      <header class="test-header">
        <button class="back-btn" @click="confirmQuit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="progress-bar-wrapper">
          <div class="progress-bar"><div class="progress-fill" :style="{ width: (round / TOTAL_ROUNDS * 100) + '%' }"></div></div>
          <span class="progress-text">{{ round }} / {{ TOTAL_ROUNDS }}</span>
        </div>
      </header>

      <main class="question-area">
        <!-- 加载 -->
        <div v-if="loading" class="loading-card">
          <div class="vinyl-spinner"></div>
          <p class="loading-text">{{ round === 1 ? '正在准备第一组歌曲...' : 'AI 分析中，生成下一组对决...' }}</p>
        </div>

        <!-- 错误 -->
        <div v-else-if="errorMsg" class="error-card">
          <span class="error-emoji">😵</span>
          <h3>出了点问题</h3>
          <p>{{ errorMsg }}</p>
          <button class="retry-btn" @click="retryRound">重试</button>
          <button class="back-link" @click="$router.push('/')">← 返回首页</button>
        </div>

        <!-- 题目 -->
        <div v-else class="round-card">
          <div class="round-label">
            <span v-if="currentPair.dimension" class="dimension-badge">{{ currentPair.dimension }}</span>
            第 {{ round }} 轮 · <strong>点击试听后做出选择</strong>
          </div>

          <div class="song-cards">
            <!-- === 歌曲 A === -->
            <div class="song-card" :class="{ selected: selected === 'A', playing: playingSong === 'A' }" @click="selected = 'A'">
              <div class="song-card-glow"></div>

              <!-- 媒体区 -->
              <div class="song-media" @click.stop="togglePlay('A')">
                <img v-if="previewA.artworkUrl" :src="previewA.artworkUrl" class="song-artwork" :class="{ spinning: playingSong === 'A' }" alt="" @error="previewA.artworkUrl = null" />
                <div v-else class="song-cover-placeholder">🎵</div>
                <div class="play-overlay">
                  <span v-if="audioLoading === 'A'" class="audio-spinner"></span>
                  <span v-else-if="playingSong === 'A'">⏸</span>
                  <span v-else>▶</span>
                </div>
              </div>

              <!-- 无 iTunes 预览时显示 YouTube 嵌入 -->
              <div v-if="previewA.youtubeId && !previewA.hasAudio" class="youtube-mini" @click.stop>
                <iframe
                  :src="'https://www.youtube.com/embed/' + previewA.youtubeId + '?autoplay=0&controls=1&rel=0&modestbranding=1'"
                  frameborder="0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                  class="youtube-frame"
                ></iframe>
              </div>

              <!-- iTunes 音频 -->
              <audio v-if="previewA.hasAudio" ref="audioARef" :src="previewA.previewUrl" preload="auto"
                @loadeddata="onAudioReady('A')"
                @ended="onAudioEnded('A')"
                @pause="onAudioPause('A')"
                @play="onAudioPlay('A')"
                @error="onAudioError('A')"
                @waiting="audioLoading = 'A'"
                @canplay="audioLoading = null"
              ></audio>

              <h3 class="song-title">{{ currentPair.songA.title }}</h3>
              <p class="song-artist">{{ currentPair.songA.artist }}</p>
              <p class="song-year" v-if="currentPair.songA.year">{{ currentPair.songA.year }}</p>
              <p class="song-reason">{{ currentPair.songA.reason }}</p>

              <div class="select-indicator">✓</div>
            </div>

            <!-- VS -->
            <div class="vs-divider"><span>VS</span></div>

            <!-- === 歌曲 B === -->
            <div class="song-card" :class="{ selected: selected === 'B', playing: playingSong === 'B' }" @click="selected = 'B'">
              <div class="song-card-glow"></div>

              <div class="song-media" @click.stop="togglePlay('B')">
                <img v-if="previewB.artworkUrl" :src="previewB.artworkUrl" class="song-artwork" :class="{ spinning: playingSong === 'B' }" alt="" @error="previewB.artworkUrl = null" />
                <div v-else class="song-cover-placeholder">🎶</div>
                <div class="play-overlay">
                  <span v-if="audioLoading === 'B'" class="audio-spinner"></span>
                  <span v-else-if="playingSong === 'B'">⏸</span>
                  <span v-else>▶</span>
                </div>
              </div>

              <div v-if="previewB.youtubeId && !previewB.hasAudio" class="youtube-mini" @click.stop>
                <iframe
                  :src="'https://www.youtube.com/embed/' + previewB.youtubeId + '?autoplay=0&controls=1&rel=0&modestbranding=1'"
                  frameborder="0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                  class="youtube-frame"
                ></iframe>
              </div>

              <audio v-if="previewB.hasAudio" ref="audioBRef" :src="previewB.previewUrl" preload="auto"
                @loadeddata="onAudioReady('B')"
                @ended="onAudioEnded('B')"
                @pause="onAudioPause('B')"
                @play="onAudioPlay('B')"
                @error="onAudioError('B')"
                @waiting="audioLoading = 'B'"
                @canplay="audioLoading = null"
              ></audio>

              <h3 class="song-title">{{ currentPair.songB.title }}</h3>
              <p class="song-artist">{{ currentPair.songB.artist }}</p>
              <p class="song-year" v-if="currentPair.songB.year">{{ currentPair.songB.year }}</p>
              <p class="song-reason">{{ currentPair.songB.reason }}</p>

              <div class="select-indicator">✓</div>
            </div>
          </div>

          <button class="confirm-btn" :disabled="!selected" @click="confirmChoice">
            {{ round < TOTAL_ROUNDS ? '下一轮' : '查看结果' }}
          </button>
        </div>
      </main>
    </template>

    <!-- ====== 评估中 ====== -->
    <div v-if="stage === 'evaluating'" class="eval-screen">
      <div class="eval-card">
        <div class="eval-spinner"></div>
        <h2>AI 正在分析你的品味...</h2>
        <p>综合 15 轮选择，生成客观犀利的评价</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getApiKey, setApiKey, generateNextPair, generateFinalEvaluation } from '../utils/deepseek.js'
import { fetchSongPreview } from '../utils/audio.js'

const router = useRouter()
const TOTAL_ROUNDS = 15

const stage = ref('key')
const apiKeyInput = ref('')
const keyError = ref('')
const round = ref(1)
const selected = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const history = reactive([])
const playingSong = ref(null)
const audioLoading = ref(null)

const audioARef = ref(null)
const audioBRef = ref(null)

const previewA = reactive({ previewUrl: null, artworkUrl: null, hasAudio: false, youtubeId: null })
const previewB = reactive({ previewUrl: null, artworkUrl: null, hasAudio: false, youtubeId: null })

const SEED_PAIR = {
  songA: { title: '七里香', artist: '周杰伦', year: '2004', reason: '华语经典情歌，测试你对华语旋律的偏好' },
  songB: { title: 'Shape of You', artist: 'Ed Sheeran', year: '2017', reason: '全球流行热单，测试你对欧美流行节奏的接受度' },
  dimension: '华语经典 vs 欧美流行',
}

// 年代 + 语言统计（传给 DeepSeek 做均匀分布）
const roundStats = reactive({
  eraCounts: {},
  langCounts: {},
})

function classifyEra(year) {
  const y = parseInt(year) || 2020
  if (y < 2000) return '<2000'
  if (y < 2010) return '2000-2009'
  if (y < 2020) return '2010-2019'
  return '2020-2025'
}

function classifyLang(artist, title) {
  // 简单启发式：检测中文字符
  const text = artist + title
  if (/[一-鿿]/.test(text)) return '华语'
  if (/[぀-ゟ゠-ヿ가-힯]/.test(text)) return '日韩'
  return '欧美'
}

function trackSong(song) {
  const era = classifyEra(song.year)
  const lang = classifyLang(song.artist, song.title)
  roundStats.eraCounts[era] = (roundStats.eraCounts[era] || 0) + 1
  roundStats.langCounts[lang] = (roundStats.langCounts[lang] || 0) + 1
}

const currentPair = reactive({
  songA: { title: '', artist: '', year: '', reason: '' },
  songB: { title: '', artist: '', year: '', reason: '' },
  dimension: '',
})

// ===== Key =====
function saveKey() {
  const key = apiKeyInput.value.trim()
  if (!key) return
  if (!key.startsWith('sk-')) { keyError.value = 'Key 格式不正确，应以 sk- 开头'; return }
  keyError.value = ''
  setApiKey(key)
  startTest()
}

async function startTest() {
  stage.value = 'testing'
  round.value = 1
  selected.value = null
  errorMsg.value = ''
  history.length = 0
  // 重置年代/语言统计
  roundStats.eraCounts = {}
  roundStats.langCounts = {}
  loading.value = true
  Object.assign(currentPair, JSON.parse(JSON.stringify(SEED_PAIR)))
  // 记录种子对歌曲
  trackSong(currentPair.songA)
  trackSong(currentPair.songB)
  await loadAudios()
  loading.value = false
}

// ===== 音频加载 =====
async function loadAudios() {
  stopAllAudio()
  previewA.previewUrl = null; previewA.artworkUrl = null; previewA.hasAudio = false; previewA.youtubeId = null
  previewB.previewUrl = null; previewB.artworkUrl = null; previewB.hasAudio = false; previewB.youtubeId = null

  const audio = getAudioA(); if (audio) { audio.pause(); audio.removeAttribute('src') }
  const audioB = getAudioBRef(); if (audioB) { audioB.pause(); audioB.removeAttribute('src') }

  const p = currentPair
  const [rA, rB] = await Promise.all([
    fetchSongPreview(p.songA.title, p.songA.artist),
    fetchSongPreview(p.songB.title, p.songB.artist),
  ])
  Object.assign(previewA, rA)
  Object.assign(previewB, rB)
}

// ===== 播放控制 =====
function togglePlay(side) {
  if (playingSong.value === side) {
    stopAudio(side)
    return
  }
  stopAllAudio()

  const preview = side === 'A' ? previewA : previewB
  if (!preview.hasAudio) return // YouTube 模式不需要手动播放

  const audioEl = side === 'A' ? getAudioA() : getAudioBRef()
  if (audioEl && preview.previewUrl) {
    if (!audioEl.src || audioEl.src !== preview.previewUrl) {
      audioEl.src = preview.previewUrl
      audioEl.load()
    }
    audioEl.currentTime = 0
    audioLoading.value = side
    audioEl.play().then(() => {
      playingSong.value = side
      audioLoading.value = null
    }).catch(() => {
      // 自动播放被阻止 — 静默
      audioLoading.value = null
    })
  }
}

function stopAllAudio() {
  stopAudio('A')
  stopAudio('B')
}
function stopAudio(side) {
  const el = side === 'A' ? getAudioA() : getAudioBRef()
  if (el) { el.pause(); el.currentTime = 0 }
  if (playingSong.value === side) playingSong.value = null
}
function getAudioA() {
  return Array.isArray(audioARef.value) ? audioARef.value[0] : audioARef.value
}
function getAudioBRef() {
  return Array.isArray(audioBRef.value) ? audioBRef.value[0] : audioBRef.value
}

function onAudioReady() { audioLoading.value = null }
function onAudioEnded(side) { if (playingSong.value === side) playingSong.value = null }
function onAudioPause(side) { if (playingSong.value === side) playingSong.value = null }
function onAudioPlay(side) { playingSong.value = side }
function onAudioError(side) {
  audioLoading.value = null
  // iTunes 预览加载失败时，标记为无音频，回退到 YouTube
  const preview = side === 'A' ? previewA : previewB
  if (preview.hasAudio && preview.youtubeId) {
    preview.previewUrl = null
    preview.artworkUrl = null
    preview.hasAudio = false
  }
}

// ===== 选择确认 =====
async function confirmChoice() {
  if (!selected.value) return
  stopAllAudio()

  history.push({
    round: round.value, chosen: selected.value,
    songA: { ...currentPair.songA }, songB: { ...currentPair.songB },
    songName: selected.value === 'A' ? currentPair.songA.title : currentPair.songB.title,
    artist: selected.value === 'A' ? currentPair.songA.artist : currentPair.songB.artist,
  })

  if (round.value >= TOTAL_ROUNDS) {
    stage.value = 'evaluating'
    try {
      const result = await generateFinalEvaluation([...history])
      sessionStorage.setItem('music_taste_result', JSON.stringify(result))
      router.push('/music-result')
    } catch (e) {
      stage.value = 'testing'
      errorMsg.value = handleError(e)
    }
    return
  }

  round.value++
  selected.value = null
  loading.value = true
  errorMsg.value = ''
  try {
    const pair = await generateNextPair([...history], round.value, { eraCounts: {...roundStats.eraCounts}, langCounts: {...roundStats.langCounts} })
    if (!pair.songA?.title || !pair.songB?.title) throw new Error('INVALID_RESPONSE')
    Object.assign(currentPair, pair)
    // 记录新出现的歌曲
    trackSong(currentPair.songA)
    trackSong(currentPair.songB)
    await loadAudios()
  } catch (e) { errorMsg.value = handleError(e) }
  finally { loading.value = false }
}

async function retryRound() {
  errorMsg.value = ''
  loading.value = true
  try {
    const pair = await generateNextPair([...history], round.value, { eraCounts: {...roundStats.eraCounts}, langCounts: {...roundStats.langCounts} })
    if (!pair.songA?.title || !pair.songB?.title) throw new Error('INVALID_RESPONSE')
    Object.assign(currentPair, pair)
    trackSong(currentPair.songA)
    trackSong(currentPair.songB)
    await loadAudios()
  } catch (e) { errorMsg.value = handleError(e) }
  finally { loading.value = false }
}

function confirmQuit() {
  if (history.length > 0 && round.value > 1) {
    if (window.confirm('确定要退出吗？进度不会保存。')) router.push('/')
  } else router.push('/')
}

function handleError(e) {
  const msg = e.message || String(e)
  if (msg === 'NO_API_KEY') return '请先设置 API Key'
  if (msg === 'INVALID_API_KEY') { stage.value = 'key'; keyError.value = 'API Key 无效'; sessionStorage.removeItem('deepseek_api_key'); return '' }
  if (msg === 'INVALID_RESPONSE') return 'AI 返回数据异常，请重试'
  return `请求失败：${msg}`
}

// ===== 初始化 =====
if (getApiKey()) startTest()
</script>

<style scoped>
.music-test-page {
  min-height: 100vh; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%);
  color: #f0e6d3;
}

/* key */
.key-screen { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.key-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 2.5rem 2rem; max-width: 460px; width: 100%; text-align: center; }
.key-emoji { font-size: 3.5rem; display: block; margin-bottom: 1rem; }
.key-card h2 { font-size: 1.3rem; color: #81c784; margin-bottom: 0.8rem; }
.key-desc { color: rgba(240,230,211,0.6); font-size: 0.9rem; line-height: 1.7; margin-bottom: 1.5rem; }
.key-input-row { display: flex; gap: 0.5rem; margin-bottom: 0.8rem; }
.key-input { flex: 1; padding: 0.7rem 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: #f0e6d3; font-size: 0.9rem; outline: none; font-family: ui-monospace,Consolas,monospace; transition: border-color 0.3s; }
.key-input:focus { border-color: #81c784; }
.key-btn { padding: 0.7rem 1.5rem; border-radius: 12px; border: none; background: linear-gradient(135deg,#81c784,#4caf50); color: #0f0c29; font-weight: 700; cursor: pointer; white-space: nowrap; }
.key-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.key-hint { font-size: 0.8rem; color: rgba(240,230,211,0.4); margin-bottom: 1rem; }
.key-hint a { color: #81c784; text-decoration: none; }
.key-error { margin-top: 1rem; padding: 0.6rem 1rem; border-radius: 10px; background: rgba(244,67,54,0.12); border: 1px solid rgba(244,67,54,0.2); color: #ef5350; font-size: 0.85rem; }
.back-link { background: none; border: none; color: rgba(240,230,211,0.4); cursor: pointer; font-size: 0.85rem; margin-top: 0.5rem; }
.back-link:hover { color: rgba(240,230,211,0.7); }

/* header */
.test-header { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; position: sticky; top: 0; background: rgba(15,12,41,0.85); backdrop-filter: blur(16px); z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.06); }
.back-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f0e6d3; cursor: pointer; flex-shrink: 0; }
.back-btn:hover { background: rgba(255,255,255,0.12); }
.progress-bar-wrapper { flex: 1; display: flex; align-items: center; gap: 0.8rem; }
.progress-bar { flex: 1; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.1); overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg,#81c784,#4caf50); transition: width 0.4s; }
.progress-text { font-size: 0.85rem; color: rgba(240,230,211,0.6); white-space: nowrap; }

/* question area */
.question-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem; }
.loading-card, .error-card { text-align: center; max-width: 400px; }
.vinyl-spinner { width: 60px; height: 60px; border-radius: 50%; border: 3px solid rgba(129,199,132,0.2); border-top-color: #81c784; margin: 0 auto 1.5rem; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 1.1rem; color: #f0e6d3; margin-bottom: 0.5rem; }
.error-emoji { font-size: 3rem; display: block; margin-bottom: 1rem; }
.error-card h3 { color: #ef5350; margin-bottom: 0.5rem; }
.error-card p { color: rgba(240,230,211,0.6); font-size: 0.9rem; margin-bottom: 1.5rem; word-break: break-all; }
.retry-btn { padding: 0.6rem 1.8rem; border-radius: 50px; border: none; background: linear-gradient(135deg,#81c784,#4caf50); color: #0f0c29; font-weight: 700; cursor: pointer; margin-bottom: 0.5rem; }

/* round card */
.round-card { max-width: 960px; width: 100%; text-align: center; }
.round-label { font-size: 0.9rem; color: rgba(240,230,211,0.55); margin-bottom: 1.5rem; }
.dimension-badge { display: inline-block; padding: 0.2rem 0.8rem; border-radius: 50px; background: rgba(129,199,132,0.12); border: 1px solid rgba(129,199,132,0.2); color: #81c784; font-size: 0.8rem; margin-right: 0.5rem; }

/* song cards */
.song-cards { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: start; margin-bottom: 2rem; }
.song-card { position: relative; background: rgba(255,255,255,0.04); border: 2px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.5rem 1.2rem; text-align: center; cursor: pointer; transition: all 0.35s; color: #f0e6d3; font-family: inherit; }
.song-card:hover { border-color: rgba(129,199,132,0.3); background: rgba(255,255,255,0.07); transform: translateY(-3px); }
.song-card.selected { border-color: #81c784; background: rgba(129,199,132,0.1); box-shadow: 0 0 30px rgba(129,199,132,0.15); }
.song-card.playing { border-color: #ffb74d; box-shadow: 0 0 24px rgba(255,183,77,0.2); }
.song-card-glow { position: absolute; inset: 0; border-radius: 20px; opacity: 0; transition: opacity 0.35s; pointer-events: none; }
.song-card.selected .song-card-glow { opacity: 1; background: radial-gradient(circle at center, rgba(129,199,132,0.08), transparent 70%); }

/* media zone */
.song-media { position: relative; width: 90px; height: 90px; margin: 0 auto 0.8rem; border-radius: 50%; overflow: hidden; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; flex-shrink: 0; }
.song-media:hover { transform: scale(1.08); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
.song-artwork { width: 100%; height: 100%; object-fit: cover; display: block; transition: filter 0.3s; }
.song-artwork.spinning { animation: vinylSpin 3s linear infinite; }
@keyframes vinylSpin { to { transform: rotate(360deg); } }
.song-cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; background: linear-gradient(135deg, rgba(129,199,132,0.15), rgba(76,175,80,0.1)); border-radius: 50%; }
.play-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; opacity: 0.7; transition: opacity 0.3s; }
.song-media:hover .play-overlay { opacity: 1; background: rgba(0,0,0,0.6); }
.playing .play-overlay { opacity: 1; background: rgba(255,183,77,0.35); }
.audio-spinner { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.8s linear infinite; display: inline-block; }

/* YouTube mini embed */
.youtube-mini { margin: 0.3rem 0 0.6rem; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; max-height: 120px; }
.youtube-frame { width: 100%; height: 100%; border: none; }

/* text */
.song-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.25rem; color: #f0e6d3; }
.song-artist { font-size: 0.85rem; color: rgba(240,230,211,0.5); margin-bottom: 0.1rem; }
.song-year { font-size: 0.75rem; color: rgba(240,230,211,0.3); margin-bottom: 0.5rem; }
.song-reason { font-size: 0.78rem; color: rgba(240,230,211,0.4); line-height: 1.5; font-style: italic; }

.select-indicator { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: transparent; transition: all 0.3s; }
.song-card.selected .select-indicator { background: #81c784; color: #0f0c29; }
.vs-divider { display: flex; align-items: flex-start; justify-content: center; padding-top: 40px; }
.vs-divider span { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-weight: 800; font-size: 0.8rem; color: rgba(240,230,211,0.3); }

/* confirm */
.confirm-btn { padding: 0.9rem 3rem; border-radius: 50px; border: none; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s; background: rgba(255,255,255,0.06); color: rgba(240,230,211,0.3); border: 1px solid rgba(255,255,255,0.1); }
.confirm-btn:not(:disabled) { background: linear-gradient(135deg,#81c784,#4caf50); color: #0f0c29; border: none; box-shadow: 0 4px 20px rgba(129,199,132,0.25); }
.confirm-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(129,199,132,0.4); }
.confirm-btn:disabled { cursor: not-allowed; }

/* eval */
.eval-screen { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.eval-spinner { width: 60px; height: 60px; border-radius: 50%; border: 3px solid rgba(129,199,132,0.2); border-top-color: #81c784; margin: 0 auto 1.5rem; animation: spin 1s linear infinite; }
.eval-card { text-align: center; }
.eval-card h2 { color: #81c784; margin-bottom: 0.5rem; }
.eval-card p { color: rgba(240,230,211,0.5); }

@media (max-width: 700px) {
  .song-cards { grid-template-columns: 1fr; }
  .vs-divider { padding-top: 0; padding: 0.2rem 0; }
  .vs-divider span { width: 36px; height: 36px; }
}
</style>
