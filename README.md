<div align="center">
  <img src="client/public/static/images/logo.webp" alt="Roshan Damor Logo" width="120" style="border-radius: 50%; box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);"/>
  <h1>🚀 Roshan Damor — AI Engineer & Full Stack Developer Portfolio</h1>
  <p><b>A high-performance, ultra-modern Monorepo Web Application built with React, Vite & Django REST Framework</b></p>

  <p>
    <a href="http://localhost:5173"><img src="https://img.shields.io/badge/Live_Portfolio-Online-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo"/></a>
    <a href="http://localhost:8000/admin"><img src="https://img.shields.io/badge/Django_Admin-v5.2-092E20?style=for-the-badge&logo=django" alt="Django Admin"/></a>
    <a href="https://reactjs.org"><img src="https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react" alt="React 18"/></a>
    <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-v5-646CFF?style=for-the-badge&logo=vite" alt="Vite 5"/></a>
    <a href="https://www.python.org"><img src="https://img.shields.io/badge/Python-v3.11+-3776AB?style=for-the-badge&logo=python" alt="Python 3.11"/></a>
  </p>
</div>

---

## 🌟 Visual Preview & Showcase

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <b>✨ Interactive Hero & Glassmorphic UI</b><br/><br/>
      <img src="client/public/static/images/screenshot_hero.png" alt="Hero Section" width="100%" style="border-radius: 10px; border: 1px solid rgba(124,58,237,0.3);"/>
    </td>
    <td width="50%" align="center">
      <b>💻 Dynamic Projects Showcase</b><br/><br/>
      <img src="client/public/static/images/screenshot_projects.png" alt="Projects Showcase" width="100%" style="border-radius: 10px; border: 1px solid rgba(124,58,237,0.3);"/>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>📖 Technical Documentation & ER Diagrams</b><br/><br/>
      <img src="client/public/static/images/screenshot_documentation.png" alt="Documentation Modal" width="100%" style="border-radius: 10px; border: 1px solid rgba(124,58,237,0.3);"/>
    </td>
    <td width="50%" align="center">
      <b>🤖 Ask Rexi — AI Assistant Modal</b><br/><br/>
      <img src="client/public/static/images/screenshot_rexi_ai.png" alt="Ask Rexi AI Assistant Modal" width="100%" style="border-radius: 10px; border: 1px solid rgba(124,58,237,0.3);"/>
    </td>
  </tr>
</table>

---

## 🎯 Executive Overview

This repository represents a full-stack, enterprise-ready personal portfolio platform designed for an AI Engineer and Full Stack Developer. It combines a lightning-fast React frontend with a robust Django REST backend, providing both an engaging visitor experience and an effortless content management workflow.

### Key Highlights
- **Unified Sizing & Dual-State Modals**: All interactive modals (Blog previews, Technical Articles, Project Details, Rexi AI Chat, and Resume Overviews) share standard dimensions (`680px` max-width) and toggle smoothly into fullscreen mode (`95vw` x `92vh`).
- **Documentation Engine**: Support for embedded database **ER Diagrams**, PK/FK key tags, technical step cards, alert callout blocks, and syntax-highlighted code frames.
- **Dynamic API Hydration**: Real-time bootstrap fetching (`GET /api/bootstrap/`) with local fallback hydration to ensure zero layout jump and fast rendering.
- **Integrated Audio Engine**: Ambient background sound controls with optimized volume (`0.05` ambient level) and interactive sound feedback.
- **Anti-Spam & Security Core**: Backend rate-limiting, IP duplicate suppression, and payload validation on contact API routes.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + Vite 5** | High-performance SPA with client-side routing & dynamic hydration |
| **Styling & Design** | **Vanilla CSS3** | Custom dark mode glassmorphic design system, smooth micro-animations |
| **Icons & Typography** | **FontAwesome 6 + Google Fonts** | *Aclonica*, *Outfit*, and *Inter* typography paired with rich tech icons |
| **Audio Processing** | **Howler.js / Custom JS Engine** | Low-latency ambient audio engine with user volume control |
| **Backend Core** | **Python 3.11+ / Django 5.2** | Secure ORM layer, admin dashboard, and REST services |
| **API Framework** | **Django REST Framework (DRF)** | Serialized JSON endpoints, Simple JWT authentication, throttling |
| **Database** | **SQLite (Dev) / PostgreSQL (Prod)** | Relational database storage with automated migration scripts |
| **Container & Cloud** | **Docker + Nginx + Gunicorn** | Multi-stage Docker deployment optimized for DigitalOcean / VPS |

---

## 🏗️ System Architecture & Data Flow

### 1. High-Level Context Diagram

```mermaid
flowchart LR
    Visitor([🌐 Visitor / Recruiter]) -->|HTTP / HTTPS| ReactApp[📱 React 18 SPA]
    ReactApp -->|GET /api/bootstrap/| DjangoAPI[⚡ Django REST API]
    ReactApp -->|POST /api/contact/| DjangoAPI
    DjangoAPI --> Database[(💾 PostgreSQL / SQLite)]
    AdminUser([🔐 Portfolio Owner]) -->|Django Admin Auth| AdminDashboard[🛠️ Content Management System]
    AdminDashboard --> Database
```

### 2. Monorepo Request & Hydration Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Visitor
    participant Client as React + Vite Client
    participant API as Django REST API
    participant DB as Database

    Visitor->>Client: Accesses Portfolio
    Client->>Client: Render shell & static fallback markup
    Client->>API: GET /api/bootstrap/
    API->>DB: Query Profile, Projects, Skills & Experiences
    DB-->>API: Return ORM Datasets
    API-->>Client: 200 OK (JSON Bootstrap Payload)
    Client->>Client: Execute hydratePortfolio.js & Refresh SEO Metadata
    Client->>Visitor: Interactive, fully populated UI ready
```

---

## 🚀 Feature Spotlight

### 1. Technical Documentation & Article Viewer
- **Sticky Glassmorphic Header**: Keeps full screen and close controls visible while scrolling through long technical articles.
- **ER Diagram Visualizer**: High-density database schema cards showing entity relationships, primary keys (`PK`), and foreign keys (`FK`).
- **Callout & Code Headers**: Rich alert callouts (`.doc-callout-note`, `.doc-callout-tip`) and formatted code frames with language tags.

### 2. Ask Rexi — AI Assistant Integration
- Interactive AI chat interface for recruiters and visitors to query portfolio skills, background, and project details in real time.

### 3. Comprehensive Content Admin
- Auth-protected Django dashboard for instant updates to Projects, Skills, Timeline, and Inbox messages without re-deploying frontend code.

### 4. SEO & AI Crawler Readiness
- Standardized `llms.txt`, OpenGraph metadata, JSON-LD structured data (`Person`, `WebSite`), `sitemap.xml`, and `robots.txt` built into static outputs.

---

## 📁 Repository Structure

```text
Code Portfolio/
├── client/                     # React + Vite Frontend App
│   ├── public/
│   │   ├── portfolio-body.html  # Main DOM structure & Modal definitions
│   │   └── static/
│   │       ├── css/            # Modular stylesheets (modal.css, main.css, etc.)
│   │       ├── js/             # Interactive engines (modal.js, sounds.js)
│   │       └── images/         # Screenshots, logos, & project media assets
│   ├── src/
│   │   ├── api/                # API client & hydratePortfolio.js script
│   │   ├── App.jsx             # React entry wrapper
│   │   └── main.jsx            # Vite mount point
│   └── package.json
├── server/                     # Django REST Backend
│   ├── portfolio/              # Core Django app (models, serializers, api_views)
│   ├── server/                 # Django settings & URL routing
│   ├── manage.py
│   └── requirements.txt
├── README.md                   # System Documentation
└── DIGITALOCEAN_PRODUCTION_GUIDE.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **Python**: `v3.11` or higher
- **Git**

### 1. Backend Setup (Django)
```bash
# Navigate to backend directory
cd server

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 2. Frontend Setup (React)
```bash
# Open a new terminal and navigate to client directory
cd client

# Install NPM packages
npm install

# Start Vite dev server
npm run dev
```
Visit `http://localhost:5173` to view the public application and `http://localhost:8000/admin` to access the Django Content Manager.

---

## 🔒 Security & Performance Features

- **CORS & CSRF Protection**: Strict origin whitelisting configured via `django-cors-headers`.
- **Anti-Spam Throttling**: IP-based rate limiting on the `/api/contact/` endpoint.
- **Lazy Loaded Media**: Optimized WebP image formats and native browser `loading="lazy"` attributes.

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/logicbyroshan">Roshan Damor</a></sub>
</div>
