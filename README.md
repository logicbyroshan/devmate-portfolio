# DevMate Portfolio — Roshan Damor

A production-grade personal portfolio with a **Django REST API backend** and a **React + Vite frontend**, serving real project case studies, experience, skills, and a working contact form.

---

## 🏗️ Architecture

```
DevMate/
├── client/          # React + Vite frontend (SPA)
│   ├── src/
│   │   ├── App.jsx                    # Root component — hydrates static HTML, loads legacy scripts
│   │   ├── portfolio-body.html        # Static HTML body (loaded as raw string, injected via dangerouslySetInnerHTML)
│   │   └── api/
│   │       ├── portfolioApi.js        # API fetch layer (calls /api/bootstrap/ on load)
│   │       └── hydratePortfolio.js   # DOM hydration — merges API data into static HTML
│   └── public/static/
│       ├── css/                       # Section-level CSS files + responsive.css
│       └── js/                        # Legacy section scripts (modal, faq, contact, projects, etc.)
│
└── server/          # Django backend (REST API)
    ├── config/      # Django settings, CORS, rate limiting
    ├── portfolio/   # Core app — models, views, serializers, fixtures
    │   └── fixtures/
    │       └── initial_data.json      # Database seed (load with: python manage.py loaddata initial_data)
    └── media/
        └── projects/thumbnails/       # Project banner images (WebP, optimized)
```

---

## 🚀 Quick Start

### Backend (Django)

```bash
cd server
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
cp .env.example .env            # Fill in your values

python manage.py migrate
python manage.py loaddata portfolio/fixtures/initial_data.json
python manage.py runserver 127.0.0.1:8000
```

### Frontend (Vite + React)

```bash
cd client
npm install
cp .env.example .env            # Set VITE_API_BASE_URL=http://127.0.0.1:8000
npm run dev                     # Runs at http://localhost:5173
```

---

## 📡 API Reference

Base URL (development): `http://127.0.0.1:8000`

All endpoints are **read-only (GET)**. Write operations are handled via the Django admin panel at `/admin/`.

### Core Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/bootstrap/` | GET | **Recommended** — returns profile + featured projects + skills + experience in one call |
| `/api/projects/` | GET | All published projects (paginated) |
| `/api/projects/{slug}/` | GET | Single project by slug |
| `/api/projects/featured/` | GET | Featured projects (top 6) |
| `/api/experience/` | GET | Work experience timeline |
| `/api/skills/` | GET | All skills grouped by category |
| `/api/skills/top/` | GET | Top 10 skills by proficiency |
| `/api/achievements/` | GET | Certifications and achievements |
| `/api/categories/` | GET | All categories (projects, skills, experience) |
| `/api/profile/` | GET | User profile + social links + meta |
| `/api/summary/` | GET | Aggregate counts (projects, skills, years etc.) |
| `/api/contact/` | POST | Submit contact message |
| `/api/health/` | GET | Health check |

### Bootstrap Response Shape

```json
{
  "profile": { "full_name": "Roshan Damor", "title": "...", "bio": "...", ... },
  "projects": [ { "id": 1, "title": "CardFlow", "documentation": "<html>...", "thumbnail": "...", ... } ],
  "skills": [ { "name": "Django", "category": {...}, "proficiency": 95 } ],
  "experience": [ { "position": "Software Engineer", "company_name": "Adarsh ID Cards", ... } ]
}
```

### Project Object Shape

```json
{
  "id": 1,
  "title": "CardFlow",
  "slug": "cardflow",
  "project_name": "CardFlow",
  "description": "Short description shown on the project card",
  "documentation": "<div class=\"case-study-container\">...</div>",
  "category": { "name": "Enterprise SaaS" },
  "technologies": "Django, React, PostgreSQL, Redis, Celery",
  "technologies_list": ["Django", "React", "PostgreSQL", "Redis", "Celery"],
  "thumbnail": "http://localhost:8000/media/projects/thumbnails/cardflow-banner.webp",
  "github_url": "https://github.com/logicbyroshan/cardfloww-idcard-management-saas.git",
  "live_url": "https://logicbyroshan.in",
  "status": "published",
  "is_featured": true,
  "order": 1
}
```

> **Note**: The `documentation` field contains rich case-study HTML. The frontend additionally maintains `PROJECT_DOCUMENTATION` in `hydratePortfolio.js` as the canonical clean-encoded version. The JS version always takes priority over the DB version for named projects (CardFlow, VidyaMaxx).

### Contact POST Body

```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "message": "Hello, I'd like to discuss a project.",
  "is_urgent": false
}
```

**Success response:**
```json
{ "success": true, "id": 1, "message": "Thank you for reaching out. Your message has been received." }
```

---

## 🔒 Security

- **CORS**: Configured for `localhost:5173` (dev) and production domain. Update `CORS_ALLOWED_ORIGINS` in `config/settings.py`.
- **Rate limiting**: 100 req/hour (anonymous), 1000 req/hour (authenticated).
- **Read-only API**: All data mutations go through `/admin/`.
- **Filtering**: Only `is_active=True` and `status=published` records are returned.

---

## 🖼️ Media / Images

Project banner images live in `server/media/projects/thumbnails/` and are served at `/media/projects/thumbnails/<filename>`.

Current banners:
- `cardflow-banner.webp` — CardFlow (optimized WebP ~28KB)
- `vidyamaxx-banner.webp` — VidyaMaxx (optimized WebP ~29KB)

To add a new banner: place the file in `server/media/projects/thumbnails/` and update the project's `thumbnail` field via `/admin/`.

---

## 🗃️ Data Management

**Seed the database:**
```bash
python manage.py loaddata portfolio/fixtures/initial_data.json
```

**Export current DB state:**
```python
# Run from server/ directory
import os, django, json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.core import serializers
from portfolio.models import Category, UserProfile, Skill, Experience, Achievement, Project

output = []
for model in [Category, UserProfile, Skill, Experience, Achievement, Project]:
    import json as _json
    data = _json.loads(serializers.serialize('json', model.objects.all()))
    output.extend(data)

with open('portfolio/fixtures/initial_data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
```

---

## 🔧 Environment Variables

### Server (`server/.env`)

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 📦 Key Dependencies

### Backend
- `django` — Web framework
- `djangorestframework` — REST API
- `django-cors-headers` — CORS handling
- `Pillow` — Image processing

### Frontend
- `react` + `vite` — UI framework + build tool
- `font-awesome` — Icons (via CDN)
- `google-fonts` — Outfit, Aclonica (via CDN)

---

## 🚢 Production Notes

1. Set `DEBUG=False` and configure a proper `SECRET_KEY`
2. Update `CORS_ALLOWED_ORIGINS` with your production domain
3. Run `python manage.py collectstatic` to serve static files
4. Use Gunicorn + Nginx for production serving
5. Run `npm run build` in `client/` to build the production bundle
