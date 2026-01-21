# AuraAssess: AI-Powered Adaptive Coding Examiner

AuraAssess is a high-fidelity recruitment simulation platform that bridges the gap between candidate ability and enterprise expectations.

## 🚀 Local Setup (Fixed Version)

If you previously encountered a `vite` or `ERESOLVE` error, follow these steps to reset:

### 1. Clear Previous Attempts
```bash
rm -rf node_modules package-lock.json
```

### 2. Clean Installation
```bash
npm install
```
*Note: We have aligned the project to React 18 to ensure full compatibility with the Ace Editor component library.*

### 3. Environment Setup
Create a `.env` file:
```env
API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_url
```

### 4. Launch
```bash
npm run dev
```

---

## 🏗️ Technical Stack
- **AI Engine**: Gemini 3 Flash
- **Database**: Neon (PostgreSQL)
- **Framework**: React 18 + Vite
- **Editor**: Ace Editor (Diagnostic Mode)
