# HireFlow AI

HireFlow AI helps job seekers manage applications and use AI assistance to improve job targeting, resume alignment, and interview preparation.

## Features

- Authentication (signup, login, JWT sessions)
- Application tracking (create, read, update, delete)
- Dashboard analytics from real application data
- AI Job Analyzer
- AI Resume Matcher
- AI Application Copilot

## Tech Stack

Frontend:

- React
- TanStack Router
- Tailwind CSS

Backend:

- Node.js
- Express
- MongoDB

AI:

- Google Gemini (`gemini-3.6-flash`)

## Setup

1. Clone the repository.
2. Install frontend dependencies:

```sh
npm install
```

3. Install backend dependencies:

```sh
cd backend
npm install
cd ..
```

4. Create `backend/.env` from `backend/.env.example`.
5. Add MongoDB URI.
6. Add JWT secret.
7. Add Gemini API key.
8. Start backend:

```sh
cd backend
node server.js
```

9. Start frontend:

```sh
npm run dev
```

## API Overview

- Auth:
	- `POST /api/auth/signup`
	- `POST /api/auth/login`
	- `GET /api/auth/me`
- Applications (JWT required):
	- `POST /api/applications`
	- `GET /api/applications`
	- `GET /api/applications/:id`
	- `PUT /api/applications/:id`
	- `DELETE /api/applications/:id`
- AI (JWT required):
	- `POST /api/ai/analyze-job`
	- `POST /api/ai/analyze-resume`
	- `POST /api/ai/application-copilot`

## Development Commands

- Frontend dev server: `npm run dev`
- Frontend build: `npm run build`
- Frontend lint: `npm run lint`
- Backend syntax checks:
	- `node --check backend/server.js`
	- `node --check backend/routes/authRoutes.js`
	- `node --check backend/routes/applicationRoutes.js`
	- `node --check backend/routes/aiRoutes.js`
	- `node --check backend/services/aiService.js`

## Security Notes

- Keep secrets only in `backend/.env`:
	- `MONGO_URI`
	- `JWT_SECRET`
	- `GEMINI_API_KEY`
- Never commit real credentials.
- Use `backend/.env.example` as a placeholder template only.
- AI endpoints are JWT-protected and run Gemini calls server-side so API keys never reach the frontend.
