# AuraAssess: AI-Powered Adaptive Coding Examiner

AuraAssess is a high-fidelity recruitment simulation platform that bridges the gap between candidate ability and enterprise expectations. Using the **Google Gemini 3 API**, it dynamically synthesizes company-specific assessments tailored to seniority levels from Intern to Architect.

## 🚀 Core Features

- **Dynamic DNA Synthesis**: Generates assessments based on real engineering cultures (Google, Amazon, Meta, etc.).
- **Adaptive Difficulty**: Difficulty scales based on logic density and implementation contract depth.
- **Neon Persistence**: Professional-grade persistence using **Neon PostgreSQL** for tracking career growth and readiness quotients.
- **Real-time Code Judge**: Integrated Ace Editor with diagnostic reports against 15+ test cases evaluated by AI.

---

## 🛠️ Environment Configuration

To operate the application, you must configure two critical environment variables.

### 1. Google Gemini API Key
Obtain a key from the [Google AI Studio](https://ai.google.dev/).
- **Variable Name**: `API_KEY`

### 2. Neon PostgreSQL Connection String
AuraAssess requires a PostgreSQL database to store user history and practice attempts.
- **Variable Name**: `DATABASE_URL`
- **Format**: `postgresql://user:password@endpoint.aws.neon.tech/neondb?sslmode=require`

---

## 💻 Local Development Setup

1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file in the project root:
   ```env
   API_KEY=your_gemini_api_key_here
   DATABASE_URL=your_neon_connection_string_here
   ```

3. **Run**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

---

## 🌐 Production Deployment

AuraAssess is optimized for **Vercel** or **Netlify**.

### Deployment Steps:
1. Push your code to a GitHub/GitLab repository.
2. Connect your repository to your deployment provider (e.g., Vercel).
3. **Important**: Add the following in the **Environment Variables** section of your provider's dashboard:
   - `API_KEY`: Your Gemini API Key.
   - `DATABASE_URL`: Your Neon PostgreSQL Connection String.
4. Deploy the site.

### Infrastructure Resilience:
If `DATABASE_URL` is missing during deployment, the application will gracefully prompt the user to provide a temporary connection string via a secure "Infrastructure Setup" screen.

---

## 🏗️ Technical Architecture

- **AI Engine**: `@google/genai` (Gemini-3-Flash-Preview).
- **Database**: `@neondatabase/serverless` (Neon PostgreSQL).
- **Editor**: `react-ace` + `ace-builds` (ESM optimized).
- **Styling**: Tailwind CSS.
- **Runtime**: React 19 (Native ES Modules via Import Maps).

*AuraAssess — Precision recruitment through adaptive AI synthesis.*