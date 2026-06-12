<template>
  <div class="result-page">
    <div v-if="!iq && !eq" class="not-found">
      <span class="nf-emoji">🧠</span>
      <h2>暂无测试结果</h2>
      <p>请先完成智商/情商测试</p>
      <button class="go-btn" @click="$router.push('/iqeq')">去测试</button>
    </div>

    <template v-else>
      <section class="score-section">
        <h1 class="main-title">IQ & EQ 报告</h1>
        <div class="dual-scores">
          <div v-if="iq" class="score-card iq-card">
            <div class="score-circle iq-circle">{{ iq.iq }}</div>
            <h2 class="score-label iq-label">{{ iq.label }}</h2>
            <p class="score-desc">{{ iq.desc }}</p>
            <div class="score-stats">
              <span>正确 {{ iq.correct }}/{{ iq.total }} 题</span>
            </div>
          </div>
          <div v-if="eq" class="score-card eq-card">
            <div class="score-circle eq-circle">{{ eq.pct }}</div>
            <h2 class="score-label eq-label">{{ eq.label }}</h2>
            <p class="score-desc">{{ eq.desc }}</p>
            <div class="eq-dim-bars">
              <div class="eq-dim-row" v-for="(d, k) in eq.dims" :key="k">
                <span class="eq-dim-label">{{ d.label }}</span>
                <div class="eq-dim-track"><div class="eq-dim-fill" :style="{width:d.pct+'%'}"></div></div>
                <span class="eq-dim-pct">{{ d.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="actions">
        <button class="action-btn retake-btn" @click="$router.push('/iqeq')">🔄 重新测试</button>
        <button class="action-btn profile-btn" @click="$router.push('/profile')">👤 查看我的画像</button>
        <button class="action-btn home-btn" @click="$router.push('/')">🏠 回到首页</button>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const iq = ref(null)
const eq = ref(null)

onMounted(() => {
  try { iq.value = JSON.parse(sessionStorage.getItem('iqeq_iq')) } catch {}
  try { eq.value = JSON.parse(sessionStorage.getItem('iqeq_eq')) } catch {}
})
</script>

<style scoped>
.result-page { min-height: 100vh; background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%); color: #f0e6d3; padding-bottom: 4rem; }

.not-found { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.nf-emoji { font-size: 4rem; }
.not-found h2 { color: #ba96f0; }
.not-found p { color: rgba(240,230,211,0.5); }
.go-btn { padding: 0.7rem 2rem; border-radius: 50px; border: none; background: linear-gradient(135deg,#ba96f0,#7c5ce0); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; }

.score-section { text-align: center; padding: 2.5rem 1.5rem 2rem; }
.main-title { font-size: 1.8rem; font-weight: 800; color: #ba96f0; margin-bottom: 2rem; }
.dual-scores { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 800px; margin: 0 auto; }

.score-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 2rem 1.5rem; text-align: center; }
.iq-card { border-color: rgba(100,180,255,0.2); }
.eq-card { border-color: rgba(255,150,180,0.2); }

.score-circle { width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; margin: 0 auto 1rem; }
.iq-circle { background: rgba(100,180,255,0.15); border: 3px solid rgba(100,180,255,0.3); color: #64b4ff; }
.eq-circle { background: rgba(255,150,180,0.15); border: 3px solid rgba(255,150,180,0.3); color: #ff96b4; }

.score-label { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
.iq-label { color: #64b4ff; }
.eq-label { color: #ff96b4; }

.score-desc { font-size: 0.85rem; color: rgba(240,230,211,0.55); line-height: 1.7; margin-bottom: 0.8rem; }
.score-stats { font-size: 0.8rem; color: rgba(240,230,211,0.3); }

.eq-dim-bars { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem; }
.eq-dim-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; }
.eq-dim-label { width: 4.5rem; text-align: right; color: rgba(240,230,211,0.45); }
.eq-dim-track { flex: 1; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.08); overflow: hidden; }
.eq-dim-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg,#ff96b4,#e87090); transition: width 1s ease; }
.eq-dim-pct { width: 2.5rem; color: rgba(240,230,211,0.3); }

.actions { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; padding: 2rem 1.5rem; }
.action-btn { padding: 0.7rem 1.8rem; border-radius: 50px; border: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.3s; }
.retake-btn { background: rgba(255,255,255,0.06); color: #f0e6d3; border: 1px solid rgba(255,255,255,0.12); }
.retake-btn:hover { background: rgba(255,255,255,0.1); }
.profile-btn { background: rgba(186,150,240,0.1); color: #ba96f0; border: 1px solid rgba(186,150,240,0.2); }
.profile-btn:hover { background: rgba(186,150,240,0.18); }
.home-btn { background: linear-gradient(135deg,#ba96f0,#7c5ce0); color: #fff; }
.home-btn:hover { box-shadow: 0 4px 20px rgba(186,150,240,0.35); }

@media (max-width: 520px) { .dual-scores { grid-template-columns: 1fr; } }
</style>
