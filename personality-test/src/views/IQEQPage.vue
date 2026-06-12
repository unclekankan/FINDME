<template>
  <div class="iqeq-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="tab-bar">
        <button class="tab-btn" :class="{ active: mode === 'iq' }" @click="switchMode('iq')">🧠 智商 IQ</button>
        <button class="tab-btn" :class="{ active: mode === 'eq' }" @click="switchMode('eq')">💗 情商 EQ</button>
      </div>
    </header>

    <main class="quiz-area">
      <transition name="slide-fade" mode="out-in">
        <div class="quiz-card" :key="mode + currentIdx">
          <div class="q-meta">
            <span class="q-mode-badge">{{ mode === 'iq' ? '🧠 IQ' : '💗 EQ' }}</span>
            <span class="q-progress">{{ currentIdx + 1 }} / {{ currentQuestions.length }}</span>
          </div>
          <p class="q-text">{{ currentQuestion.text }}</p>

          <div class="q-options">
            <button
              v-for="(opt, oi) in currentQuestion.options"
              :key="oi"
              class="q-opt"
              :class="{ selected: selected === oi }"
              @click="selectAnswer(oi)"
            >
              <span class="opt-letter">{{ 'ABCDEF'[oi] }}</span>
              <span class="opt-text">{{ opt }}</span>
              <span class="opt-check">{{ selected === oi ? '✓' : '' }}</span>
            </button>
          </div>

          <div class="q-nav">
            <button class="nav-btn" @click="prevQ" :disabled="currentIdx === 0">上一题</button>
            <div class="q-dots">
              <span v-for="(_, i) in currentQuestions" :key="i" class="q-dot"
                :class="{ active: i === currentIdx, answered: answers[i] !== undefined }"
                @click="currentIdx = i"
              ></span>
            </div>
            <button v-if="currentIdx < currentQuestions.length - 1" class="nav-btn next-btn" @click="nextQ" :disabled="selected === null">下一题</button>
            <button v-else class="nav-btn submit-btn" @click="submit" :disabled="!allAnswered">
              查看结果
            </button>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { iqQuestions, eqQuestions, scoreIQ, scoreEQ } from '../data/iqeq.js'
import { setIQEQProfile } from '../utils/profile.js'

const router = useRouter()
const mode = ref('iq')
const currentIdx = ref(0)
const selected = ref(null)
const iqAnswers = ref(new Array(20).fill(undefined))
const eqAnswers = ref(new Array(20).fill(undefined))

const currentQuestions = computed(() => mode.value === 'iq' ? iqQuestions : eqQuestions)
const currentQuestion = computed(() => currentQuestions.value[currentIdx.value])
const answers = computed(() => mode.value === 'iq' ? iqAnswers : eqAnswers)
const allAnswered = computed(() => answers.value.value.every((a) => a !== undefined))

watch(currentIdx, () => { selected.value = answers.value.value[currentIdx.value] ?? null })

function selectAnswer(idx) {
  selected.value = idx
  answers.value.value[currentIdx.value] = idx
}
function nextQ() { if (currentIdx.value < currentQuestions.value.length - 1) currentIdx.value++ }
function prevQ() { if (currentIdx.value > 0) currentIdx.value-- }
function switchMode(m) {
  mode.value = m
  currentIdx.value = 0
  selected.value = (m === 'iq' ? iqAnswers : eqAnswers).value[0] ?? null
}
function goBack() { currentIdx.value === 0 ? router.push('/') : prevQ() }

function submit() {
  const iq = scoreIQ(iqAnswers.value)
  const eq = scoreEQ(eqAnswers.value)

  // 判断哪边还没做
  if (mode.value === 'iq' && eqAnswers.value.some((a) => a === undefined)) {
    // IQ 做完了，切到 EQ
    mode.value = 'eq'
    currentIdx.value = 0
    selected.value = eqAnswers.value[0] ?? null
    return
  }
  if (mode.value === 'eq' && iqAnswers.value.some((a) => a === undefined)) {
    mode.value = 'iq'
    currentIdx.value = 0
    selected.value = iqAnswers.value[0] ?? null
    return
  }

  // 两边都做完了
  sessionStorage.setItem('iqeq_iq', JSON.stringify(iq))
  sessionStorage.setItem('iqeq_eq', JSON.stringify(eq))
  setIQEQProfile(iq, eq)
  router.push('/iqeq-result')
}

// 初始化已保存的答案
const savedIQ = sessionStorage.getItem('iqeq_iq_answers')
const savedEQ = sessionStorage.getItem('iqeq_eq_answers')
if (savedIQ) { const arr = JSON.parse(savedIQ); for (let i = 0; i < arr.length; i++) iqAnswers.value[i] = arr[i] }
if (savedEQ) { const arr = JSON.parse(savedEQ); for (let i = 0; i < arr.length; i++) eqAnswers.value[i] = arr[i] }
// 定期保存
watchEffect(() => { sessionStorage.setItem('iqeq_iq_answers', JSON.stringify(iqAnswers.value)) })
watchEffect(() => { sessionStorage.setItem('iqeq_eq_answers', JSON.stringify(eqAnswers.value)) })
</script>

<style scoped>
.iqeq-page { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%); color: #f0e6d3; }

.page-header { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1.2rem; background: rgba(15,12,41,0.9); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 10; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f0e6d3; cursor: pointer; flex-shrink: 0; transition: background 0.3s; }
.back-btn:hover { background: rgba(255,255,255,0.12); }
.tab-bar { display: flex; gap: 0.4rem; flex: 1; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 0.25rem; }
.tab-btn { flex: 1; padding: 0.5rem; border-radius: 10px; border: none; background: transparent; color: rgba(240,230,211,0.45); font-size: 0.88rem; cursor: pointer; transition: all 0.3s; font-family: inherit; }
.tab-btn.active { background: rgba(186,150,240,0.12); color: #ba96f0; font-weight: 600; }

.quiz-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.quiz-card { max-width: 560px; width: 100%; text-align: center; }
.q-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.q-mode-badge { padding: 0.25rem 0.7rem; border-radius: 50px; background: rgba(186,150,240,0.1); border: 1px solid rgba(186,150,240,0.15); color: #ba96f0; font-size: 0.8rem; }
.q-progress { font-size: 0.82rem; color: rgba(240,230,211,0.35); }
.q-text { font-size: 1.15rem; font-weight: 600; line-height: 1.7; margin-bottom: 2rem; color: #f0e6d3; }

.q-options { display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 2rem; }
.q-opt { display: flex; align-items: center; gap: 0.8rem; padding: 0.9rem 1rem; border-radius: 14px; border: 2px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #f0e6d3; cursor: pointer; transition: all 0.3s; text-align: left; font-size: 0.95rem; font-family: inherit; }
.q-opt:hover { border-color: rgba(186,150,240,0.3); background: rgba(255,255,255,0.06); }
.q-opt.selected { border-color: #ba96f0; background: rgba(186,150,240,0.1); box-shadow: 0 0 20px rgba(186,150,240,0.1); }
.opt-letter { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.08); font-weight: 700; font-size: 0.85rem; flex-shrink: 0; transition: all 0.3s; }
.selected .opt-letter { background: #ba96f0; color: #0f0c29; }
.opt-text { flex: 1; }
.opt-check { width: 20px; text-align: center; color: #ba96f0; font-weight: 700; }

.q-nav { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; }
.q-dots { display: flex; gap: 0.3rem; flex-wrap: nowrap; overflow-x: auto; max-width: 200px; }
.q-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.1); cursor: pointer; flex-shrink: 0; transition: all 0.3s; }
.q-dot.answered { background: rgba(186,150,240,0.3); }
.q-dot.active { background: #ba96f0; transform: scale(1.8); }
.nav-btn { padding: 0.55rem 1.3rem; border-radius: 50px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #f0e6d3; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap; font-family: inherit; }
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.submit-btn { background: linear-gradient(135deg,#ba96f0,#7c5ce0); color: #fff; border: none; }
.submit-btn:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(186,150,240,0.3); }

.slide-fade-enter-active { transition: all 0.35s ease; }
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(30px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-30px); }
</style>
