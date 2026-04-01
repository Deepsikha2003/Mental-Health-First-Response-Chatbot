# Naga AI — Mental Health First Response Chatbot

A full-stack AI-powered mental health chatbot with sentiment analysis, crisis detection, and mood tracking.

---

## Project Structure

```
naga-ai/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py     # Settings (pydantic-settings)
│   │   │   ├── database.py   # SQLAlchemy engine + session
│   │   │   └── security.py   # JWT + bcrypt helpers
│   │   ├── models/
│   │   │   ├── user.py       # Users table
│   │   │   ├── session.py    # Chat sessions + messages
│   │   │   └── mood.py       # Mood logs
│   │   ├── routers/
│   │   │   ├── auth.py       # /auth/signup  /auth/login  /auth/me
│   │   │   ├── chat.py       # /chat/message  /chat/sessions
│   │   │   └── mood.py       # /mood/log  /mood/history  /mood/stats
│   │   └── services/
│   │       ├── sentiment.py  # Keyword NLP — sentiment + crisis tier
│   │       ├── ai_service.py # OpenAI wrapper + fallback responses
│   │       └── emergency.py  # Twilio SMS alert
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/              # Axios API clients
    │   ├── context/          # AuthContext (global auth state)
    │   ├── components/
    │   │   ├── chat/         # MessageBubble, TypingIndicator, etc.
    │   │   ├── dashboard/    # MoodChart, StatCard, etc.
    │   │   └── ui/           # Spinner, CrisisBanner, SentimentBadge
    │   └── pages/            # LoginPage, SignupPage, ChatPage, DashboardPage
    └── vite.config.js
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Database Setup

```sql
-- In psql or pgAdmin:
CREATE DATABASE naga_ai;
```

---

### 2. Backend Setup

```bash
cd naga-ai/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env — set DATABASE_URL and optionally OPENAI_API_KEY

# Start server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd naga-ai/frontend

npm install
npm run dev
```

App available at: http://localhost:5173

---

## Environment Variables (.env)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | JWT signing secret (change in production!) |
| `OPENAI_API_KEY` | Optional | Enables GPT-4o-mini responses (falls back to built-in responses if absent) |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio SMS for emergency alerts |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth |
| `TWILIO_FROM_NUMBER` | Optional | Your Twilio phone number |
| `EMERGENCY_CONTACT_NUMBER` | Optional | Number to SMS on Tier-3 crisis |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/auth/me` | Get current user |
| POST | `/chat/message` | Send message, get AI response |
| GET | `/chat/sessions` | List chat sessions |
| GET | `/chat/sessions/{id}/messages` | Get session messages |
| DELETE | `/chat/sessions/{id}` | Delete session |
| POST | `/mood/log` | Manually log mood |
| GET | `/mood/history` | Mood history (last N days) |
| GET | `/mood/stats` | Aggregated mood stats |

---

## Crisis Detection Tiers

| Tier | Color | Trigger | Response |
|---|---|---|---|
| 0 | ✅ Green | Normal | Standard empathetic support |
| 1 | 🟡 Yellow | Mild distress keywords | Stronger coping suggestions |
| 2 | 🟠 Orange | High distress phrases | Crisis resources shown |
| 3 | 🔴 Red | Self-harm / suicidal ideation | Emergency banner + optional SMS alert |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Recharts, React Router, Axios
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, python-jose, passlib/bcrypt
- **AI**: OpenAI GPT-4o-mini (with keyword-based fallback)
- **Emergency**: Twilio SMS (optional)
