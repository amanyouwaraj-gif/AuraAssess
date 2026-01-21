# 🧬 AuraAssess: AI-Powered Adaptive Coding Examiner

---

## 🚀 [**CLICK HERE TO OPEN THE LIVE APP**](https://ai.studio/apps/drive/1fc64F4evgRf-oPiovOyyEl_fWldOaD_H?fullscreenApplet=true)
**Production Endpoint:** `https://aura-assess.vercel.app`

---

## 🌟 Overview
AuraAssess is a professional-grade recruitment simulation platform. It bridges the gap between candidate ability and enterprise expectations by using **Gemini 3 Flash** to dynamically synthesize company-specific assessments tailored to seniority levels from Intern to Architect.

### 🎯 Why AuraAssess?
Unlike static platforms, AuraAssess generates **unique, un-googleable questions** in real-time, specifically tuned to the "DNA" of the target company you provide.

---

## 🛠️ Quick Start Guide
1. **Infrastructure Setup**: Enter your **Neon PostgreSQL** connection string (found in your Neon.tech dashboard).
2. **Authentication**: Sign up or Login to your secure logic cluster.
3. **Synthesis**: Enter any company name (e.g., *OpenAI*, *NVIDIA*, *Google*). Even if it's not in our list, the AI researches and builds questions based on that company's specific engineering culture.
4. **Practice**: Use the "Practice Mode" to sharpen skills on specific DSA topics without a timer.

---

## 🚀 Technical Highlights

- **Instant Synthesis**: Powered by Gemini 3 Flash with zero thinking budget for sub-second generation.
- **Deep Company Research**: AI identifies the specific "vibe," common topics, and difficulty levels of any tech company on the fly.
- **Neon Persistence**: Every single session, code trace, and readiness score is archived in a serverless PostgreSQL database.
- **Real-time Code Judge**: Integrated Ace Editor that validates your logic against 15+ hidden and visible test cases evaluated by the AI.

---

## 💻 Developer Configuration

If you are running this locally, ensure your environment variables are set:

- `API_KEY`: Your Google Gemini API Key.
- `DATABASE_URL`: Your Neon PostgreSQL Connection String.

### Local Install:
```bash
npm install
npm run dev
```

---

## 🏗️ Technical Architecture

- **AI Engine**: `@google/genai` (Gemini-3-Flash-Preview).
- **Database**: `@neondatabase/serverless` (Neon PostgreSQL).
- **Editor**: `react-ace` (ESM optimized).
- **Styling**: Tailwind CSS + Custom Dark Mode UI.

*AuraAssess — Precision recruitment through adaptive AI synthesis.*