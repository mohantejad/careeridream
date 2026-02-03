# careerIDream (Prototype)

AI-assisted resume and cover-letter studio. Users paste a job description, generate tailored drafts, edit inline, export to DOCX/PDF, and save drafts with fit-score insights.

This repo is a **prototype** intended for portfolio/demo use.

## Features
- Resume + cover letter generation from JD + profile
- Resume parsing (PDF/DOCX) into structured JSON
- Draft saving and dashboard with fit score
- Template switching and export (DOCX/PDF)

## Tech stack
- Frontend: Next.js (App Router), React, Tailwind
- Backend: Django REST Framework, PostgreSQL
- LLM: Groq API (JSON structured outputs)

## Project structure
```
backend/   # Django API
frontend/  # Next.js app
```

## Quick start (local)

### Backend
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` in `backend/` (see env vars below), then run:
```
python3 manage.py migrate
python3 manage.py runserver
```

### Frontend
```
cd frontend
npm install
```

Create a `.env.local` in `frontend/`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Run:
```
npm run dev
```

## Environment variables

### Backend (`backend/.env`)
Required:
```
DJANGO_SECRET_KEY=...
DEBUG=True
DATABASE_URL=postgresql://...
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
```

Common (optional, depending on features):
```
DJANGO_ALLOWED_HOSTS=...
CORS_ALLOWED_ORIGINS=...
CSRF_TRUSTED_ORIGINS=...
DOMAIN=...
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
EMAIL_USE_TLS=True
EMAIL_API_KEY=...
GOOGLE_AUTH_KEY=...
GOOGLE_AUTH_SECRET=...
REDIRECT_URLS=...
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain
```

## Scripts
Frontend:
```
npm run dev
npm run build
npm run start
```

Backend:
```
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver
```

## Deployment notes
- Backend: configure `DATABASE_URL`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`.
- Frontend: set `NEXT_PUBLIC_API_BASE_URL` to your backend URL.

## License
Prototype code for personal/portfolio use.
