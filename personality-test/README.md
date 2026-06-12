# 🧭 FindMe — 发现你的内在世界

三个维度探索自我：人格、品味、歌单。科学量表 + AI 驱动。

## ✨ 功能

| 功能 | 说明 | 技术 |
|------|------|------|
| 🧠 **大五人格分析** | IPIP 国际人格项目库，30 题 OCEAN 五维度，雷达图报告 | Vue 3 |
| 🎵 **音乐品味测试** | 15 轮歌曲对决，AI 动态出题，iTunes 试听 + YouTube | DeepSeek API |
| 📋 **歌单分析** | 截图上传 OCR 识别 / 文字导入，AI 解码品味 | Tesseract.js + DeepSeek |

## 🚀 快速启动

```bash
npm install
```

### 配置 API Key（音乐测试和歌单分析需要）

```bash
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
# 或者在页面中直接输入（仅存储在浏览器 sessionStorage）
```

获取 Key：[https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys)（新用户有免费额度）

```bash
npm run dev       # 开发模式
npm run build     # 生产构建
```

## 📁 项目结构

```
src/
├── views/           # 页面组件
│   ├── HomePage.vue       # 首页（三功能卡片）
│   ├── TestPage.vue       # 人格测试（30题）
│   ├── ResultPage.vue     # 人格报告（雷达图+解读）
│   ├── MusicTestPage.vue  # 音乐测试（15轮对决）
│   ├── MusicResultPage.vue # 音乐报告（评分+推荐）
│   └── PlaylistPage.vue   # 歌单分析（OCR+AI）
├── data/
│   └── questions.js       # IPIP 题目和维度定义
├── utils/
│   ├── scoring.js         # 大五人格计分
│   ├── deepseek.js        # DeepSeek API 调用
│   ├── audio.js           # iTunes 试听 + YouTube 搜索
│   └── playlist.js        # Tesseract OCR + 歌单分析
└── router/
    └── index.js           # Vue Router 配置
```

## 🛠️ 技术栈

- **Vue 3** (Composition API + `<script setup>`)
- **Vite** (开发代理 DeepSeek API)
- **Vue Router 4**
- **Tesseract.js**（客户端 OCR，离线可用）
- **DeepSeek API**（AI 出题 + 品味分析）
- **iTunes Search API**（免费歌曲预览）
