# 🎬 Video Highlight Tool

一個以 Vue 3 打造的 AI 輔助影片剪輯 DEMO 工具，模擬文字轉影片轉錄流程，使用者可選擇重點句子、自動生成 Highlight Clip，並即時預覽剪輯成果。此專案為應徵 GliaCloud Frontend Engineer 職位所開發的作業作品。

## 🚀 Demo（線上體驗）

👉 [點我觀看 Demo](https://video-highlight-tool-delta.vercel.app/)

---

## 🧩 專案功能

### ✅ 基本功能
- 🎥 影片上傳與原生播放控制
- 🧠 模擬 AI 處理流程（faker.js 生成 transcript）
- ✍️ 編輯區：顯示段落標題與逐句 transcript，可勾選 highlight
- 📺 預覽區：播放 highlight 結果、同步字幕 overlay
- 🔁 雙向同步：播放時自動高亮句子、點擊跳轉影片段落
- 📱 RWD 響應式設計，支援桌機與手機介面

### 💡 額外強化
- 🎚️ 使用 `vue3-slider` 實作自訂 highlight timeline
- 🧪 自製 transcript mock API（延遲模擬、資料完整）
- 🖋️ 精簡 UI，搭配 Master CSS 與 Bootstrap Icons
- 📦 模組化程式架構與 Pinia 狀態管理

---

## 🛠️ 技術選型

| 技術 | 說明 |
|------|------|
| [Vue 3](https://vuejs.org/) | Composition API + `setup()` 結構清晰 |
| [Pinia](https://pinia.vuejs.org/) | 狀態集中管理 highlight 選擇與影片進度 |
| [@faker-js/faker](https://www.npmjs.com/package/@faker-js/faker) | 產生模擬 transcript 資料 |
| [vue3-slider](https://www.npmjs.com/package/vue3-slider) | 滑桿同步 highlight 時間軸 |
| [Master CSS](https://master.co/) | 輕量級原子 CSS 框架 |
| [jenesius-vue-modal](https://www.npmjs.com/package/jenesius-vue-modal) | 簡易彈窗控制 |
| [OverlayScrollbars](https://kingsora.github.io/OverlayScrollbars/) | 自訂卷軸與捲動控制（增強 UX） |
| Vite | 開發快、建構快、原生 ES 模組支援 |

---

