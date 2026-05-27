# StratLab

StratLab is a minimal starting point for a quantitative strategy experimentation app.

## Structure

```text
frontend/   React + Vite + TypeScript + Tailwind CSS
backend/    Flask backend
```

## Backend Quickstart

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.sample .env
python app.py
```

## Frontend Quickstart

```powershell
cd frontend
npm install
Copy-Item .env.sample .env
npm run dev
```

Business logic, API routes, database integration, and authentication are intentionally not implemented yet.
