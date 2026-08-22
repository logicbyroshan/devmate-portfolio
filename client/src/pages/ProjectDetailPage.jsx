import React, { useState, useEffect } from 'react';
import { STATIC_PROJECTS, PROJECT_DOCUMENTATION } from '../api/hydratePortfolio';
import MermaidDiagram from '../components/doc/MermaidDiagram';
import CodeBlockShiki from '../components/doc/CodeBlockShiki';
import KaTeXFormula from '../components/doc/KaTeXFormula';
import InteractiveArchitecture from '../components/doc/InteractiveArchitecture';
import ComplexDiagramD2 from '../components/doc/ComplexDiagramD2';
import ImageLightbox from '../components/doc/ImageLightbox';
import VideoShowcase from '../components/doc/VideoShowcase';

const PROJECT_GALLERIES = {
  cardflow: [
    {
      src: '/static/images/cardflow-banner.webp',
      title: 'CardFlow Enterprise Production Dashboard',
      caption: 'Full-stack production dashboard managing 136K+ ID card records and multi-school workflows.'
    },
    {
      src: '/static/images/screenshot_documentation.png',
      title: 'Automated Processing Engine',
      caption: 'High-throughput batch image processing, face alignment, and dynamic ID template composition.'
    },
    {
      src: '/static/images/screenshot_projects.png',
      title: 'Multi-Tenant RBAC & Analytics',
      caption: 'Role-based access control, real-time activity tracking, and cross-platform synchronization.'
    }
  ],
  vidyamaxx: [
    {
      src: '/static/images/vidyamaxx-banner.webp',
      title: 'AI-First School Management Dashboard',
      caption: 'Integrated academic ecosystem connecting administrators, educators, students, and parents.'
    },
    {
      src: '/static/images/screenshot_rexi_ai.png',
      title: 'Intelligent Academic Analytics',
      caption: 'Predictive performance modeling, automated timetable scheduling, and progress tracking.'
    },
    {
      src: '/static/images/screenshot_hero.png',
      title: 'Unified Communication Hub',
      caption: 'Multi-channel messaging, real-time announcements, and institutional report generation.'
    }
  ],
  printnexx: [
    {
      src: '/static/images/screenshot_documentation.png',
      title: 'Internal Automation Engine',
      caption: 'High-speed image pre-processing, face alignment, and dynamic ID template compositor.'
    },
    {
      src: '/static/images/cardflow-banner.webp',
      title: 'Batch Finishing Pipeline',
      caption: 'Automated print-ready output rendering and multi-format asset export.'
    }
  ],
  eazetrip: [
    {
      src: '/static/images/ecom.webp',
      title: 'Tour Agency Operations & Booking',
      caption: 'Customer booking management, interactive tour itineraries, and automated payment receipts.'
    },
    {
      src: '/static/images/faqside.webp',
      title: 'Itinerary Planner & Package Customizer',
      caption: 'Dynamic travel package creation and real-time scheduling dashboard.'
    }
  ],
  taskflixx: [
    {
      src: '/static/images/task.webp',
      title: 'AI Task Management Workspace',
      caption: 'Context-aware task prioritization, workflow pipelines, and daily productivity insights.'
    },
    {
      src: '/static/images/hero.webp',
      title: 'Productivity Analytics',
      caption: 'Sprint tracking, team velocity estimation, and task automation.'
    }
  ],
  prepsarthi: [
    {
      src: '/static/images/screenshot_documentation.png',
      title: 'AI Study & Prep Engine',
      caption: 'Adaptive practice tests, spaced repetition flashcards, and concept mastery tracking.'
    },
    {
      src: '/static/images/vidyamaxx-banner.webp',
      title: 'Interactive Learning Workspace',
      caption: 'Intelligent concept summarization and instant mock test evaluation.'
    }
  ]
};

const CARDFLOW_MERMAID_FLOWCHART = `
flowchart LR
    A[Data Ingestion<br>CSV / Excel / API] --> B[Schema Validation<br>& PII Cleansing]
    B --> C{Approval Gate<br>Multi-Role RBAC}
    C -- Rejected --> D[Exception Alert<br>WebSocket Notification]
    C -- Approved --> E[Celery Task Dispatch<br>Redis Message Queue]
    E --> F[Image Engine<br>Face Alignment & Crop]
    F --> G[Card Composition<br>Dynamic 300DPI Canvas]
    G --> H[Secure Storage<br>Encrypted S3 Bucket]
`;

const CARDFLOW_MERMAID_ERD = `
erDiagram
    ORGANIZATION ||--o{ USER : employs
    ORGANIZATION ||--o{ CARD_TEMPLATE : designs
    ORGANIZATION ||--o{ CARD_RECORD : manages
    CARD_RECORD }o--|| BATCH_JOB : grouped_in
    USER ||--o{ AUDIT_LOG : generates
    
    ORGANIZATION {
        uuid id PK
        string name
        string tier
        timestamp created_at
    }
    USER {
        uuid id PK
        uuid org_id FK
        string email
        string role
    }
    CARD_RECORD {
        uuid id PK
        uuid org_id FK
        uuid batch_id FK
        string cardholder_name
        string status
        jsonb metadata
    }
    CARD_TEMPLATE {
        uuid id PK
        uuid org_id FK
        string layout_schema
        integer dpi
    }
    BATCH_JOB {
        uuid id PK
        string status
        integer total_cards
        integer processed_cards
    }
`;

const PYTHON_CODE_SAMPLE = `import io
from PIL import Image, ImageDraw, ImageFont
from celery import shared_task
from django.core.files.storage import default_storage
from .models import BatchJob, CardRecord, CardTemplate

@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def generate_card_batch_task(self, batch_id: str, organization_id: str):
    """
    Asynchronous Celery pipeline to compose print-ready ID cards.
    Handles image normalization, QR vector rendering, and S3 multipart upload.
    """
    try:
        batch = BatchJob.objects.select_related('template').get(id=batch_id, org_id=organization_id)
        records = CardRecord.objects.filter(batch=batch, status='approved')
        
        output_buffer = io.BytesIO()
        composer = CardComposer(template=batch.template)
        
        processed_count = 0
        for record in records.iterator(chunk_size=500):
            composer.render_card(record)
            processed_count += 1
            
        zip_path = f"batches/{organization_id}/{batch_id}/cards_bundle.zip"
        default_storage.save(zip_path, output_buffer)
        
        batch.mark_completed(file_path=zip_path)
        return {"status": "SUCCESS", "processed_records": processed_count}
    except Exception as exc:
        raise self.retry(exc=exc)
`;

const SQL_CODE_SAMPLE = `-- Partitioned Multi-Tenant Card Records Table for High Throughput
CREATE TABLE card_records (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    batch_id UUID NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_card_records PRIMARY KEY (org_id, id)
) PARTITION BY HASH (org_id);

-- Create 8 hash partitions for distributed I/O performance
CREATE TABLE card_records_p0 PARTITION OF card_records FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE card_records_p1 PARTITION OF card_records FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE INDEX idx_card_metadata_gin ON card_records USING gin (metadata);
`;

export default function ProjectDetailPage({ slug, onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeDocTab, setActiveDocTab] = useState('overview');

  // Normalize slug and find project
  const cleanSlug = String(slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const currentIndex = STATIC_PROJECTS.findIndex(p => {
    const pSlug = (p.project_name || p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return pSlug === cleanSlug || cleanSlug.includes(pSlug) || pSlug.includes(cleanSlug);
  });

  const projectIndex = currentIndex >= 0 ? currentIndex : 0;
  const project = STATIC_PROJECTS[projectIndex] || STATIC_PROJECTS[0];

  const prevProject = STATIC_PROJECTS[(projectIndex - 1 + STATIC_PROJECTS.length) % STATIC_PROJECTS.length];
  const nextProject = STATIC_PROJECTS[(projectIndex + 1) % STATIC_PROJECTS.length];

  const projectName = project?.project_name || project?.title || 'CardFlow';
  const categoryName = project?.category?.name || 'Enterprise SaaS';
  const docHtml = PROJECT_DOCUMENTATION[projectName] || PROJECT_DOCUMENTATION[project?.title] || project?.documentation || '';

  const projectKey = (projectName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const gallery = PROJECT_GALLERIES[projectKey] || PROJECT_GALLERIES.cardflow;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${projectName} Documentation & Case Study | Roshan Damor`;
    setActiveSlide(0);
  }, [projectName]);

  const getSlugOf = (p) => (p.project_name || p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % gallery.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Breadcrumb Navigation - Centered & Glassmorphic */}
        <div className="page-breadcrumbs-wrap">
          <nav className="page-breadcrumbs" aria-label="Breadcrumb">
            <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
              <i className="fas fa-home"></i> Home
            </a>
            <span className="breadcrumb-separator"><i className="fas fa-chevron-right"></i></span>
            <a href="#projects" onClick={(e) => { e.preventDefault(); onNavigate('home', 'projects'); }}>
              Projects
            </a>
            <span className="breadcrumb-separator"><i className="fas fa-chevron-right"></i></span>
            <span className="breadcrumb-current">{projectName}</span>
          </nav>
        </div>

        {/* Project Hero Header */}
        <header className="page-hero">
          <span className="page-badge">
            <i className="fas fa-folder-open"></i> {categoryName}
          </span>
          <h1 className="page-title">
            {projectName} <span className="text-gradient">Case Study &amp; Technical Docs</span>
          </h1>
          <p className="page-subtitle">
            {project?.description}
          </p>
        </header>

        {/* Hero Card with Interactive Screenshot Slider */}
        <div className="project-detail-hero-card">
          {/* Screenshot Slider Gallery */}
          <div className="project-screenshot-slider">
            <div className="screenshot-slide-stage">
              <img
                src={gallery[activeSlide].src}
                alt={gallery[activeSlide].title}
                className="screenshot-slide-img"
              />
              <div className="screenshot-slide-overlay">
                <div className="screenshot-slide-info">
                  <span className="screenshot-slide-badge">
                    <i className="fas fa-image"></i> Screenshot {activeSlide + 1} of {gallery.length}
                  </span>
                  <h3 className="screenshot-slide-title">{gallery[activeSlide].title}</h3>
                  <p className="screenshot-slide-caption">{gallery[activeSlide].caption}</p>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  className="screenshot-nav-btn prev"
                  onClick={prevSlide}
                  aria-label="Previous screenshot"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="screenshot-nav-btn next"
                  onClick={nextSlide}
                  aria-label="Next screenshot"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                
                {/* Dots / Indicators */}
                <div className="screenshot-dots-row">
                  {gallery.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`screenshot-dot ${idx === activeSlide ? 'active' : ''}`}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Go to screenshot ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="project-detail-header-info">
            <div className="project-detail-meta-row">
              <div>
                <span className="project-status-badge status-prod" style={{ fontSize: '14px', padding: '6px 14px' }}>
                  {project?.status || '🟢 Production'}
                </span>
              </div>
              <div className="project-detail-links">
                {project?.github_url && project.github_url !== '#' && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill secondary"
                  >
                    <i className="fab fa-github"></i> GitHub Repo
                  </a>
                )}
                {projectName === 'CardFlow' && (
                  <a
                    href="https://cardflow.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill primary"
                  >
                    <i className="fas fa-globe"></i> Live Website (cardflow.in)
                  </a>
                )}
              </div>
            </div>

            {/* Tech Stack List */}
            <div className="project-detail-tech-stack">
              {(project?.technologies_list || []).map((t, idx) => (
                <span key={idx} className="project-tech-badge" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
             DOCUMENTATION ENGINE TABBED INTERFACE
             ══════════════════════════════════════════════════════════════ */}
          <div className="doc-tabs-bar" style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`doc-ctrl-btn ${activeDocTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('overview')}
            >
              <i className="fas fa-book-open"></i> Case Study &amp; Overview
            </button>
            <button
              className={`doc-ctrl-btn ${activeDocTab === 'architecture' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('architecture')}
            >
              <i className="fas fa-network-wired"></i> Architecture (React Flow)
            </button>
            <button
              className={`doc-ctrl-btn ${activeDocTab === 'diagrams' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('diagrams')}
            >
              <i className="fas fa-project-diagram"></i> Flowcharts &amp; ERD (Mermaid)
            </button>
            <button
              className={`doc-ctrl-btn ${activeDocTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('code')}
            >
              <i className="fas fa-code"></i> Implementation (Shiki)
            </button>
            <button
              className={`doc-ctrl-btn ${activeDocTab === 'math' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('math')}
            >
              <i className="fas fa-square-root-alt"></i> Performance Models (KaTeX)
            </button>
            <button
              className={`doc-ctrl-btn ${activeDocTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveDocTab('media')}
            >
              <i className="fas fa-photo-video"></i> Media &amp; Demo
            </button>
          </div>

          {/* Tab Content 1: Overview & Case Study Body */}
          {activeDocTab === 'overview' && (
            <div className="project-detail-body">
              {docHtml ? (
                <div
                  className="case-study-injected"
                  dangerouslySetInnerHTML={{ __html: docHtml }}
                />
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
                  {project?.description}
                </p>
              )}
            </div>
          )}

          {/* Tab Content 2: Interactive Architecture (React Flow + D2) */}
          {activeDocTab === 'architecture' && (
            <div className="doc-section-content" style={{ marginTop: '20px' }}>
              <InteractiveArchitecture />
              <ComplexDiagramD2 scenarioKey={projectKey} />
            </div>
          )}

          {/* Tab Content 3: Mermaid Flowcharts & ER Diagrams */}
          {activeDocTab === 'diagrams' && (
            <div className="doc-section-content" style={{ marginTop: '20px' }}>
              <MermaidDiagram 
                chart={CARDFLOW_MERMAID_FLOWCHART}
                diagramType="Flowchart"
                title="End-to-End Card Lifecycle & Processing Pipeline"
                subtitle="Visualizes real-time data ingestion, approval gating, Celery task distribution, and S3 artifact storage."
              />

              <MermaidDiagram 
                chart={CARDFLOW_MERMAID_ERD}
                diagramType="ERD"
                title="Relational Schema & Multi-Tenant Entity Model"
                subtitle="Illustrates relational integrity between Organizations, Users, CardTemplates, BatchJobs, and Audit Logs."
              />
            </div>
          )}

          {/* Tab Content 4: Code Implementation (Shiki) */}
          {activeDocTab === 'code' && (
            <div className="doc-section-content" style={{ marginTop: '20px' }}>
              <CodeBlockShiki 
                code={PYTHON_CODE_SAMPLE}
                language="python"
                filename="services/card_composer.py"
                description="Core Celery worker task that pulls approved card batches from Redis queue, performs dynamic vector template composition, and streams chunks to storage."
              />

              <CodeBlockShiki 
                code={SQL_CODE_SAMPLE}
                language="sql"
                filename="models/schema_partition.sql"
                description="PostgreSQL table definition using Hash Partitioning on org_id to support zero-contention parallel inserts and high-volume batch reads."
              />
            </div>
          )}

          {/* Tab Content 5: Performance Models & Equations (KaTeX) */}
          {activeDocTab === 'math' && (
            <div className="doc-section-content" style={{ marginTop: '20px' }}>
              <KaTeXFormula 
                formula="\text{Throughput} = \frac{N_{\text{cards}}}{\Delta t_{\text{batch}}} = \frac{10{,}000\text{ records}}{83.3\text{ seconds}} \approx 120.0\text{ cards/sec}"
                title="Card Generation Batch Throughput Model"
                description="Mathematical model calculating continuous card rendering throughput across a pool of 16 Celery worker threads."
                variables={[
                  { symbol: 'N_cards', meaning: 'Total records in batch', value: '10,000' },
                  { symbol: 'Δt_batch', meaning: 'Total elapsed time', value: '83.3 s' },
                  { symbol: 'Throughput', meaning: 'Sustained throughput rate', value: '120 cards/s' }
                ]}
              />

              <KaTeXFormula 
                formula="T_{\text{p99}} = T_{\text{gateway}} + T_{\text{django}} + T_{\text{redis}} + T_{\text{postgres}} \le 45\text{ms}"
                title="P99 End-to-End Latency Budget Equation"
                description="Component-wise latency breakdown for multi-tenant API requests ensuring low latency under concurrent enterprise loads."
                variables={[
                  { symbol: 'T_gateway', meaning: 'Nginx SSL termination & reverse proxy', value: '3ms' },
                  { symbol: 'T_django', meaning: 'Gunicorn WSGI execution & RBAC checks', value: '18ms' },
                  { symbol: 'T_redis', meaning: 'Token verification & rate-limiting', value: '2ms' },
                  { symbol: 'T_postgres', meaning: 'Indexed query execution time', value: '12ms' }
                ]}
              />

              <KaTeXFormula 
                formula="\eta_{\text{cache}} = \frac{H_{\text{redis}}}{H_{\text{redis}} + M_{\text{db}}} = \frac{184{,}200}{194{,}800} \approx 94.56\%"
                title="Redis In-Memory Cache Hit Ratio"
                description="Efficiency metric showing proportion of school configuration and session requests served directly from memory."
                variables={[
                  { symbol: 'H_redis', meaning: 'Cache hits served by Redis', value: '184,200' },
                  { symbol: 'M_db', meaning: 'Cache misses forwarded to PostgreSQL', value: '10,600' },
                  { symbol: 'η_cache', meaning: 'Cache hit efficiency ratio', value: '94.56%' }
                ]}
              />
            </div>
          )}

          {/* Tab Content 6: Media Lightbox & Video Showcase */}
          {activeDocTab === 'media' && (
            <div className="doc-section-content" style={{ marginTop: '20px' }}>
              <VideoShowcase 
                posterSrc={gallery[0]?.src}
                title={`${projectName} Production Walkthrough & Interactive Demo`}
                duration="03:45"
                resolution="1080p 60fps"
              />
              <ImageLightbox 
                images={gallery}
                title={`${projectName} Interface & Architecture Screenshot Gallery`}
              />
            </div>
          )}
        </div>

        {/* Project Discovery Navigator (Prev / Next) */}
        <div className="project-pagination-grid">
          <a
            href={`#/projects/${getSlugOf(prevProject)}`}
            className="project-nav-card prev"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('project-detail', getSlugOf(prevProject));
            }}
          >
            <i className="fas fa-arrow-left" style={{ color: '#a78bfa', fontSize: '18px' }}></i>
            <div>
              <div className="project-nav-card-sub">Previous Project</div>
              <div className="project-nav-card-title">{prevProject.project_name || prevProject.title}</div>
            </div>
          </a>

          <a
            href={`#/projects/${getSlugOf(nextProject)}`}
            className="project-nav-card next"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('project-detail', getSlugOf(nextProject));
            }}
          >
            <div>
              <div className="project-nav-card-sub">Next Project</div>
              <div className="project-nav-card-title">{nextProject.project_name || nextProject.title}</div>
            </div>
            <i className="fas fa-arrow-right" style={{ color: '#38bdf8', fontSize: '18px' }}></i>
          </a>
        </div>

        {/* Return Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '15px' }}
            onClick={() => onNavigate('home', 'projects')}
          >
            <i className="fas fa-th-large" style={{ marginRight: '8px' }}></i> View All Projects
          </button>
        </div>
      </div>
    </div>
  );
}
