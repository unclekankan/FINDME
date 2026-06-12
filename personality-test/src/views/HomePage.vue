<template>
  <div class="home-page">
    <div class="bg-decoration">
      <span class="bg-icon" v-for="item in bgIcons" :key="item.id" :style="item.style">{{ item.icon }}</span>
    </div>

    <div class="hero-section">
      <div class="hero-badge">✨ 发现你的内在世界</div>
      <h1 class="hero-title">
        你是什么样的人？
        <br />
        <span class="highlight">让测试来告诉你</span>
      </h1>
      <p class="hero-desc">
        三个工具，从人格、品味、歌单三个维度探索你的内在——
        <br />
        用科学量表和 AI 解码独一无二的你。
      </p>

      <div class="test-cards">
        <!-- 人格分析 -->
        <div class="test-card card-personality">
          <div class="card-glow"></div>
          <div class="card-icon-wrapper"><span class="card-icon">🧠</span></div>
          <h2 class="card-title">大五人格分析</h2>
          <p class="card-subtitle">IPIP 国际人格项目库</p>
          <ul class="card-features">
            <li><span class="check">🔬</span> OCEAN 科学五维度</li>
            <li><span class="check">🧩</span> 30 道精选题</li>
            <li><span class="check">📊</span> 雷达图+详细解读</li>
            <li><span class="check">⏱️</span> ~5 分钟</li>
          </ul>
          <button class="card-btn btn-gold" @click="$router.push('/test')">
            <span>开始测试</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- 音乐品味 -->
        <div class="test-card card-music">
          <div class="card-glow"></div>
          <div class="card-icon-wrapper"><span class="card-icon">🎵</span></div>
          <h2 class="card-title">音乐品味测试</h2>
          <p class="card-subtitle">15 轮对决 · AI 评测</p>
          <ul class="card-features">
            <li><span class="check">🤖</span> DeepSeek 动态出题</li>
            <li><span class="check">🎧</span> iTunes 试听 + YT</li>
            <li><span class="check">📊</span> 犀利品味评分</li>
            <li><span class="check">⏱️</span> ~5 分钟</li>
          </ul>
          <button class="card-btn btn-green" @click="$router.push('/music-test')">
            <span>开始测试</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- 歌单分析 -->
        <div class="test-card card-playlist">
          <div class="card-glow"></div>
          <div class="card-icon-wrapper"><span class="card-icon">📋</span></div>
          <h2 class="card-title">歌单分析</h2>
          <p class="card-subtitle">导入歌单 · AI 解码品味</p>
          <ul class="card-features">
            <li><span class="check">📸</span> 截图上传自动识别</li>
            <li><span class="check">📝</span> 文字粘贴批量解析</li>
            <li><span class="check">🎯</span> 品味画像+推荐</li>
            <li><span class="check">⚡</span> ~30 秒出结果</li>
          </ul>
          <button class="card-btn btn-purple" @click="$router.push('/playlist')">
            <span>开始分析</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const allIcons = ['👑', '⚔️', '🎨', '🔬', '📜', '🌙', '🍶', '🎋', '⚛️', '🏛️', '🌻', '🕊️', '🎵', '🎸', '🎹', '🎧', '🎼', '🥁', '📋', '💿']

const bgIcons = Array.from({ length: 18 }, (_, i) => ({
  id: i, icon: allIcons[i],
  style: { top: `${Math.random() * 90}%`, left: `${Math.random() * 90}%`, fontSize: `${1 + Math.random() * 2.5}rem`, opacity: 0.04 + Math.random() * 0.07 },
}))
</script>

<style scoped>
.home-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: linear-gradient(135deg, #0f0c29, #1a1a3e, #24243e); padding: 2rem 1rem; }
.bg-decoration { position: absolute; inset: 0; pointer-events: none; }
.bg-icon { position: absolute; user-select: none; }
.hero-section { position: relative; z-index: 1; text-align: center; max-width: 1100px; width: 100%; }
.hero-badge { display: inline-block; padding: 0.4rem 1.2rem; border-radius: 50px; background: rgba(255,255,255,0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); color: #e2c488; font-size: 0.9rem; font-weight: 500; margin-bottom: 1.5rem; letter-spacing: 0.05em; }
.hero-title { font-size: clamp(1.6rem, 4vw, 2.5rem); font-weight: 800; color: #f0e6d3; line-height: 1.35; margin-bottom: 0.8rem; }
.highlight { background: linear-gradient(135deg, #e2c488, #c9974a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-desc { color: rgba(240,230,211,0.55); font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem; }

/* cards grid */
.test-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.2rem; }
.test-card { position: relative; background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.6rem 1.3rem; text-align: center; transition: transform 0.4s, border-color 0.4s, box-shadow 0.4s; overflow: hidden; }
.test-card:hover { transform: translateY(-5px); }
.card-personality:hover { border-color: rgba(226,196,136,0.35); box-shadow: 0 8px 36px rgba(226,196,136,0.1); }
.card-music:hover { border-color: rgba(129,199,132,0.35); box-shadow: 0 8px 36px rgba(129,199,132,0.1); }
.card-playlist:hover { border-color: rgba(186,150,240,0.35); box-shadow: 0 8px 36px rgba(186,150,240,0.1); }

.card-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 160px; height: 2px; border-radius: 50%; opacity: 0; transition: opacity 0.4s; }
.card-personality .card-glow { background: radial-gradient(ellipse, rgba(226,196,136,0.6), transparent); }
.card-music .card-glow { background: radial-gradient(ellipse, rgba(129,199,132,0.6), transparent); }
.card-playlist .card-glow { background: radial-gradient(ellipse, rgba(186,150,240,0.6), transparent); }
.test-card:hover .card-glow { opacity: 1; }

.card-icon-wrapper { margin-bottom: 0.8rem; }
.card-icon { font-size: 2.5rem; display: inline-block; animation: float 3s ease-in-out infinite; }
.card-personality .card-icon { animation-delay: 0s; }
.card-music .card-icon { animation-delay: 0.4s; }
.card-playlist .card-icon { animation-delay: 0.8s; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

.card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; }
.card-personality .card-title { color: #e2c488; }
.card-music .card-title { color: #81c784; }
.card-playlist .card-title { color: #ba96f0; }

.card-subtitle { font-size: 0.78rem; color: rgba(240,230,211,0.4); margin-bottom: 1rem; }

.card-features { list-style: none; text-align: left; margin-bottom: 1.3rem; display: flex; flex-direction: column; gap: 0.45rem; }
.card-features li { font-size: 0.82rem; color: rgba(240,230,211,0.65); display: flex; align-items: center; gap: 0.4rem; }
.check { flex-shrink: 0; }

.card-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.65rem 1.6rem; font-size: 0.9rem; font-weight: 700; border: none; border-radius: 50px; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; }
.card-btn:hover { transform: translateY(-2px); }
.btn-gold { color: #0f0c29; background: linear-gradient(135deg,#e2c488,#c9974a); box-shadow: 0 4px 18px rgba(226,196,136,0.2); }
.btn-gold:hover { box-shadow: 0 6px 26px rgba(226,196,136,0.35); }
.btn-green { color: #0f0c29; background: linear-gradient(135deg,#81c784,#4caf50); box-shadow: 0 4px 18px rgba(129,199,132,0.2); }
.btn-green:hover { box-shadow: 0 6px 26px rgba(129,199,132,0.35); }
.btn-purple { color: #0f0c29; background: linear-gradient(135deg,#ba96f0,#7c5ce0); box-shadow: 0 4px 18px rgba(186,150,240,0.2); }
.btn-purple:hover { box-shadow: 0 6px 26px rgba(186,150,240,0.35); }

@media (max-width: 800px) {
  .test-cards { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
  .test-card { padding: 1.3rem 1.2rem; }
}
</style>
