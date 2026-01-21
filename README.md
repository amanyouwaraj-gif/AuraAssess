# AuraAssess: AI-Powered Adaptive Coding Examiner

AuraAssess is a high-fidelity recruitment simulation platform. It leverages the Google Gemini API to dynamically synthesize company-specific coding assessments, technical MCQs, and logic puzzles tailored to professional seniority levels—from Intern to Architect.

## 🚀 Key Features

- **Company-Specific DNA**: Generates questions based on the engineering culture of firms like Google, Amazon, Meta, and more.
- **Adaptive Leveling**: Tailored difficulty distributions (Very Easy to Ultra Hard) based on the target role.
- **Real-time Code Execution**: Integrated Ace Editor with a "Code Judge" simulation for 15+ test cases.
- **Brutal Evaluation**: A rigorous AI examiner that provides granular feedback, zero-score enforcement for omissions, and optimal reference solutions.
- **Persistence Layer**: Simulated Neon PostgreSQL integration using local storage to track career growth and readiness quotients.

## 🛠️ Tech Stack

- **Frontend**: React 19 (via ESM), Tailwind CSS.
- **AI Engine**: Google Gemini 2.0 (Gemini-3-Pro-Preview & Flash).
- **Editor**: Ace Editor.
- **Module System**: Native Browser ES6 Modules with Import Maps.

---

## 💻 Local Development

Since AuraAssess uses native ES6 modules and TypeScript, you need a local environment that can serve static files and handle `.tsx` transpilation.

### 1. Prerequisites
- **Node.js** (v18+)
- **An API Key**: Obtain a Gemini API key from the [Google AI Studio](https://aistudio.google.com/).

### 2. Setup
Clone the repository to your local machine:
```bash
git clone <your-repo-url>
cd aura-assess
```

### 3. Run with a Static Server
If you are using a tool like **Vite** or a simple dev server that supports JSX/TSX:

```bash
# Example using npx and a simple dev server (if using a build tool like Vite)
npm install
npm run dev
```

If you are running it purely as a static site (ensure your environment handles the `.tsx` imports via your preferred bundler or dev server):
1. Ensure the `process.env.API_KEY` is available or injected via your build tool (e.g., a `.env` file for Vite).
2. Open the dev server URL in your browser.

---

## ☁️ Deployment on Vercel

Vercel is the recommended platform for deploying AuraAssess due to its excellent support for React and environment variables.

### 1. Prepare your Repository
Ensure your code is pushed to a Git provider (GitHub, GitLab, or Bitbucket).

### 2. Import to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"New Project"**.
2. Select your repository.

### 3. Configure Environment Variables
AuraAssess **requires** a Google Gemini API key to function.
1. In the **Environment Variables** section of the Vercel deployment settings, add:
   - **Key**: `API_KEY`
   - **Value**: `your_google_gemini_api_key_here`

### 4. Build Settings
- **Framework Preset**: If you are using Vite, select **Vite**.
- **Build Command**: `npm run build` (or your relevant build script).
- **Output Directory**: `dist` (or your relevant output folder).

### 5. Deploy
Click **Deploy**. Once finished, Vercel will provide a production URL for your instance of AuraAssess.

---

## 🔒 Security Note

- **API Usage**: This application makes direct calls to the Gemini API. Ensure your API key is kept secret and not hardcoded into the source files.
- **Data Privacy**: All user data and exam history are currently stored in the browser's `localStorage`, simulating a secure connection to a Neon PostgreSQL instance. No sensitive data is sent to external servers except for the prompts sent to Google Gemini for assessment generation and grading.

---

*AuraAssess — Precision Recruitment Simulation.*