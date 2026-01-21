# AuraAssess: AI-Powered Adaptive Coding Examiner

# 🚀 [CLICK HERE TO OPEN THE APP](https://aura-assess.vercel.app)

---

## 🌟 Overview
AuraAssess is a high-fidelity recruitment simulation platform. It bridges the gap between candidate ability and enterprise expectations by using **Gemini 3 Flash** to dynamically synthesize company-specific assessments tailored to seniority levels from Intern to Architect.

## 🔗 Live Production Link
**[https://aura-assess.vercel.app](https://aura-assess.vercel.app)**

---

## 🛠️ Quick Start Guide
To use the app for the first time:
1. **Infrastructure Setup**: Enter your **Neon PostgreSQL** connection string (found in your Neon.tech dashboard).
2. **Authentication**: Sign up or Login to your secure logic cluster.
3. **Synthesis**: Enter any company name (e.g., *OpenAI*, *NVIDIA*, *Google*). Even if it's not in the list, the AI will research and build questions based on that company's engineering culture.
4. **Practice**: Use the "Practice Mode" to sharpen skills on specific DSA topics without a timer.

---

## 🚀 Key Features

- **Instant Synthesis**: Switched to Gemini 3 Flash with zero thinking budget for sub-second question generation.
- **Deep Research**: The AI researches company-specific "DNA" (vibe, common topics, difficulty levels) in real-time.
- **Neon Persistence**: Every session is archived in a serverless PostgreSQL database.
- **Real-time Code Judge**: Integrated Ace Editor that validates your logic against 15+ hidden and visible test cases.

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
