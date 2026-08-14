# HireFlow AI 🚀

> An AI-powered job search copilot that helps students track applications, analyze job opportunities, evaluate resume matches, and prepare stronger applications.

## ✨ Features

### 🔐 Authentication
- User signup and login
- JWT-based authentication
- Protected API routes
- Secure session handling

### 📊 Application Tracker
- Add job applications
- View applications
- Edit applications
- Delete applications
- Track application status
- Track next actions
- Dashboard statistics

### 🤖 AI Job Analyzer
Paste a job description and get:
- Job match score
- Matching skills
- Missing skills
- Recommended skills
- Key requirements
- Seniority
- Application recommendation

### 📄 AI Resume + Job Matcher
Upload a PDF/DOCX/TXT resume or paste resume text and compare it against a job description.

Provides:
- Match score
- Matching skills
- Missing skills
- Experience analysis
- Strengths
- Resume improvement suggestions
- Application recommendation

### 🚀 AI Application Copilot
Generate a complete application preparation kit:
- Tailored cover letter
- Why you're a good fit
- Skills to highlight
- 5 likely interview questions
- Interview preparation tips

The AI is instructed not to invent experience, skills, projects, or achievements that aren't supported by the resume.

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- TanStack Router
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

### AI
- Google Gemini
- Gemini 3.6 Flash

### Other
- Git
- GitHub
- REST APIs

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │    HireFlow AI      │
                    │      Frontend       │
                    │ React + Vite        │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      Express        │
                    │      Backend        │
                    └──────┬───────┬──────┘
                           │       │
                    ┌──────▼───┐   │
                    │ MongoDB   │   │
                    │  Atlas    │   │
                    └───────────┘   │
                                    ▼
                           ┌────────────────┐
                           │ Google Gemini  │
                           │   AI Engine    │
                           └────────────────┘
