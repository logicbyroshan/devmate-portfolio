import React, { useState, useEffect } from 'react';
import { STATIC_PROJECTS, PROJECT_DOCUMENTATION } from '../api/hydratePortfolio';

const PROJECT_GALLERIES = {
  cardflow: [
    {
      src: '/static/images/cardflow-banner.webp',
      title: 'Platform Overview & Core Dashboard',
      caption: 'Full-stack production dashboard managing 136K+ ID card records and automated workflows.'
    },
    {
      src: '/static/images/screenshot_documentation.png',
      title: 'Automated Processing Engine',
      caption: 'High-throughput batch image processing, card composition, and generation pipeline.'
    },
    {
      src: '/static/images/screenshot_projects.png',
      title: 'Analytics & Multi-School Portals',
      caption: 'Role-based access control, real-time activity tracking, and cross-platform sync.'
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

export default function ProjectDetailPage({ slug, onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0);

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
    document.title = `${projectName} Case Study | Roshan Damor`;
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
            {projectName} <span className="text-gradient">Case Study</span>
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

          {/* Rich Case Study Document Body */}
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
