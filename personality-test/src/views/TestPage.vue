<template>
  <div class="test-page">
    <header class="test-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="progress-bar-wrapper">
        <div class="progress-bar"><div class="progress-fill" :style="{ width: progressPercent + '%' }"></div></div>
        <span class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</span>
      </div>
    </header>

    <main class="question-area">
      <transition name="slide-fade" mode="out-in">
        <div class="question-card" :key="currentIndex">
          <div class="dim-badge">{{ currentDim.emoji }} {{ currentDim.label }}</div>
          <p class="question-text">{{ currentQuestion.text }}</p>

          <div class="options">
            <button class="option-btn option-high"
              @click="selectAnswer(0)"
              :class="{ selected: selected === 0 }">
              <span class="option-check">{{ selected === 0 ? '✓' : '' }}</span>
              <span class="option-text">{{ currentQuestion.high }}</span>
            </button>
            <button class="option-btn option-low"
              @click="selectAnswer(1)"
              :class="{ selected: selected === 1 }">
              <span class="option-check">{{ selected === 1 ? '✓' : '' }}</span>
              <span class="option-text">{{ currentQuestion.low }}</span>
            </button>
          </div>
        </div>
      </transition>
    </main>

    <footer class="test-footer">
      <button class="nav-btn prev-btn" @click="prevQuestion" :disabled="currentIndex === 0">上一题</button>

      <div class="dots">
        <span v-for="(q, i) in questions" :key="i" class="dot"
          :class="{ active: i === currentIndex, answered: answers[i] !== undefined }"
          @click="goToQuestion(i)"
        ></span>
      </div>

      <button v-if="currentIndex < questions.length - 1" class="nav-btn next-btn" @click="nextQuestion" :disabled="selected === null">
        下一题
      </button>
      <button v-else class="nav-btn submit-btn" @click="submitTest" :disabled="!allAnswered">
        查看结果
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { questions, dimensions } from '../data/questions.js'

const router = useRouter()
const currentIndex = ref(0)
const selected = ref(null)
const answers = ref(new Array(questions.length).fill(undefined))

const currentQuestion = computed(() => questions[currentIndex.value])
const currentDim = computed(() => dimensions.find((d) => d.key === currentQuestion.value.dimension))
const progressPercent = computed(() => {
  const answered = answers.value.filter((a) => a !== undefined).length
  return Math.round((answered / questions.length) * 100)
})
const allAnswered = computed(() => answers.value.every((a) => a !== undefined))

watch(currentIndex, () => { selected.value = answers.value[currentIndex.value] ?? null })

function selectAnswer(idx) {
  selected.value = idx
  answers.value[currentIndex.value] = idx
}

function nextQuestion() {
  if (currentIndex.value < questions.length - 1) currentIndex.value++
}

function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}

function goToQuestion(index) {
  if (answers.value[currentIndex.value] === undefined && selected.value !== null) {
    answers.value[currentIndex.value] = selected.value
  }
  currentIndex.value = index
}

function goBack() {
  if (currentIndex.value === 0) router.push('/')
  else prevQuestion()
}

function submitTest() {
  sessionStorage.setItem('personality_answers', JSON.stringify(answers.value))
  router.push('/result')
}
</script>

<style scoped>
.test-page { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%); color: #f0e6d3; }

.test-header { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; position: sticky; top: 0; background: rgba(15,12,41,0.85); backdrop-filter: blur(16px); z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.06); }
.back-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #f0e6d3; cursor: pointer; flex-shrink: 0; transition: background 0.3s; }
.back-btn:hover { background: rgba(255,255,255,0.12); }
.progress-bar-wrapper { flex: 1; display: flex; align-items: center; gap: 0.8rem; }
.progress-bar { flex: 1; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.1); overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #e2c488, #c9974a); transition: width 0.4s ease; }
.progress-text { font-size: 0.85rem; color: rgba(240,230,211,0.6); white-space: nowrap; }

.question-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem; }
.question-card { max-width: 520px; width: 100%; text-align: center; }
.dim-badge { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 50px; background: rgba(226,196,136,0.1); border: 1px solid rgba(226,196,136,0.2); color: #e2c488; font-size: 0.82rem; margin-bottom: 1.2rem; }
.question-text { font-size: 1.3rem; font-weight: 600; line-height: 1.7; margin-bottom: 2.5rem; color: #f0e6d3; }

.options { display: flex; flex-direction: column; gap: 1rem; }
.option-btn { display: flex; align-items: center; gap: 1rem; padding: 1.2rem 1.4rem; border-radius: 16px; border: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f0e6d3; cursor: pointer; transition: all 0.3s; text-align: left; font-size: 1rem; font-family: inherit; }
.option-btn:hover { border-color: rgba(226,196,136,0.35); background: rgba(255,255,255,0.08); }
.option-btn.selected { border-color: #e2c488; background: rgba(226,196,136,0.12); box-shadow: 0 0 24px rgba(226,196,136,0.15); }
.option-check { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); font-weight: 700; font-size: 0.85rem; flex-shrink: 0; transition: background 0.3s; color: transparent; }
.selected .option-check { background: #e2c488; color: #0f0c29; }
.option-text { flex: 1; }

.test-footer { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem 1.5rem; background: rgba(15,12,41,0.85); backdrop-filter: blur(16px); border-top: 1px solid rgba(255,255,255,0.06); }
.dots { display: flex; gap: 0.35rem; flex-wrap: nowrap; justify-content: center; max-width: 320px; overflow-x: auto; padding: 4px 0; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.12); cursor: pointer; transition: all 0.3s; flex-shrink: 0; }
.dot.answered { background: rgba(226,196,136,0.35); }
.dot.active { background: #e2c488; transform: scale(1.6); box-shadow: 0 0 8px rgba(226,196,136,0.5); }

.nav-btn { padding: 0.7rem 1.5rem; border-radius: 50px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: #f0e6d3; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap; }
.nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.submit-btn { background: linear-gradient(135deg, #e2c488, #c9974a); color: #0f0c29; border: none; font-weight: 700; }
.submit-btn:hover:not(:disabled) { box-shadow: 0 4px 24px rgba(226,196,136,0.4); }

.slide-fade-enter-active { transition: all 0.4s ease; }
.slide-fade-leave-active { transition: all 0.25s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(40px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-40px); }

@media (max-width: 500px) {
  .question-text { font-size: 1.1rem; }
  .option-btn { padding: 1rem 1.1rem; }
  .test-footer { flex-wrap: wrap; gap: 0.8rem; justify-content: center; }
  .dots { order: -1; width: 100%; max-width: none; }
}
</style>
