# CHAOS Agent — Starter Workspace

A starter monorepo for a mobile-first AI-agent PWA with a Node.js backend. It is structured to open directly in Antigravity IDE or VS Code.

## Included
- `frontend/`: React + TypeScript + Vite PWA starter
- `backend/`: Express + TypeScript API starter
- Research/chat endpoint using OpenAI Responses API (requires an API key)
- PDF generation endpoint using PDFKit
- Email endpoint using Resend with explicit confirmation flag
- Supabase client setup for future authenticated cloud history
- `.env.example`, health endpoint, basic validation and setup instructions

## Important
This is a starter scaffold, not a fully deployed production product. Cloud authentication, complete per-user history synchronization, advanced conversation retrieval, comprehensive tests, and production hardening still need to be implemented and verified. Never commit real API keys.

## Requirements
- Node.js 20+ (Node 22 recommended)
- npm
- API keys/accounts only for features you enable: OpenAI, Resend, Supabase

## Open in Antigravity
1. Extract this ZIP.
2. Open the extracted `chaos-agent-starter` folder as the workspace.
3. Open a terminal in the workspace.
4. Copy `backend/.env.example` to `backend/.env` and fill only the credentials you have.
5. Install and run the backend and frontend in separate terminals.

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
PowerShell alternative to copy env:
```powershell
Copy-Item .env.example .env
```
Backend runs at `http://localhost:4000`.

### Frontend
In a second terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
PowerShell alternative:
```powershell
Copy-Item .env.example .env
```
Vite prints the local URL, usually `http://localhost:5173`.

## Environment
Backend variables are documented in `backend/.env.example`.
- `OPENAI_API_KEY`: enables AI chat/research.
- `OPENAI_MODEL`: defaults to `gpt-4.1-mini`; choose a model enabled for your account.
- `RESEND_API_KEY` and `EMAIL_FROM`: enable email sending.
- `EMAIL_SEND_ENABLED=true`: opt-in gate for email endpoint.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: server-side only; never expose the service-role key to the browser.

## Current API
- `GET /api/health`
- `POST /api/chat` — `{ "message": "...", "history": [] }`
- `POST /api/pdf` — `{ "title": "...", "content": "..." }`, returns a PDF download
- `POST /api/email` — `{ "to": "...", "subject": "...", "text": "...", "confirmed": true }`

Email sending is disabled unless `EMAIL_SEND_ENABLED=true` and credentials are configured. Do not test sending to real recipients without authorization.

## Before hackathon implementation
- Wait for and follow the official CHAOS problem statement.
- Freeze the MVP and shared contracts with the team lead.
- Add Supabase Auth and user-scoped RLS policies before storing private history in the cloud.
- Implement IndexedDB/Dexie persistence and safe history retrieval.
- Add source citation rendering, PDF validation/repair, email idempotency and tests.
- Test on real Android and iOS browsers. PWA behavior varies by browser/OS.
