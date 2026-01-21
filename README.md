
# AuraAssess: AI-Powered Adaptive Coding Examiner

AuraAssess is a world-class recruitment simulation platform designed to bridge the gap between candidate ability and enterprise expectations. It leverages the Google Gemini 2.0 API to dynamically synthesize company-specific coding assessments, technical MCQs, and logic puzzles tailored to professional seniority levels.

## 🚀 Key Features

- **Dynamic DNA Synthesis**: Generates questions based on the real engineering culture of firms like Google, Amazon, Meta, and Netflix.
- **Cognitive Complexity Scaling**: Difficulty is determined by logic density and implementation contract depth, not just algorithmic Big-O.
- **High-Fidelity Code Judge**: Integrated Ace Editor with a "Code Judge" simulation providing real-time diagnostic reports against 15+ test cases.
- **Persistence Simulation**: Uses a high-performance simulation of a Neon PostgreSQL layer (via `localStorage`) to track career growth and readiness quotients.
- **Brutal AI Examiner**: Provides granular feedback and optimal implementation solutions for every scenario.

---

## 🔒 Security & Environment Configuration

To protect your credentials, AuraAssess strictly adheres to modern environment variable protocols.

### 1. The `.env` File
Create a `.env` file in the root directory to store your sensitive keys. This file is ignored by version control to prevent leaks.

```env
# Google Gemini API Key (Mandatory)
API_KEY=your_gemini_api_key_here

# Neon PostgreSQL API Key (Optional / Future Implementation)
# NEON_API_KEY=your_neon_key_here
```

---

## 💻 Local Development Setup

Follow these steps to initialize the AuraAssess environment on your machine.

### Prerequisites
- **Node.js** (v18.0 or higher)
- **NPM** or **Yarn**

### Installation
1. **Clone the Repository**:
   ```bash
   git clone <your-repository-url>
   cd aura-assess
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Create a `.env` file in the root folder.
   - Add `API_KEY=your_key_here` to the file.

4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 🌐 Deployment (Latest Version)

AuraAssess is optimized for zero-configuration deployment on **Vercel** or **Netlify**.

### Deploying to Vercel
1. Push your code to a Git provider (GitHub/GitLab/Bitbucket).
2. Connect your repository to the [Vercel Dashboard](https://vercel.com/new).
3. **Crucial Step**: In the "Environment Variables" section of the deployment settings, add the following:
   - **Key**: `API_KEY`
   - **Value**: Your actual Gemini API key string.
4. Click **Deploy**. Vercel will automatically handle the build and provide a secure production URL.

### Deploying to Netlify
1. Connect your repository to [Netlify](https://app.netlify.com/start).
2. Go to **Site Settings > Environment Variables**.
3. Add the `API_KEY` variable as described above.
4. Trigger a new deploy.

---

## 🛠️ Technical Specifications

- **AI Engine**: Google GenAI (Gemini-3-Flash & Gemini-3-Pro).
- **Editor Core**: Ace Editor v1.38.0.
- **UI Framework**: React 19 + Tailwind CSS.
- **Module System**: Native Browser ES6 Modules via Import Maps.

*AuraAssess — High-Fidelity Recruitment Simulation.*
