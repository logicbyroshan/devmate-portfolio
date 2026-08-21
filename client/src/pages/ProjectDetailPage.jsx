import React, { useEffect } from 'react';
import { STATIC_PROJECTS, PROJECT_DOCUMENTATION } from '../api/hydratePortfolio';

export default function ProjectDetailPage({ slug, onNavigate }) {
  // Normalize slug and find project
  const cleanSlug = String(slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const project = STATIC_PROJECTS.find(p => {
    const pSlug = (p.project_name || p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return pSlug === cleanSlug || cleanSlug.includes(pSlug) || pSlug.includes(cleanSlug);
  }) || STATIC_PROJECTS[0];

  const projectName = project?.project_name || project?.title || 'CardFlow';
  const categoryName = project?.category?.name || 'Enterprise SaaS';
  const bannerImg = project?.thumbnail || '/static/images/cardflow-banner.webp';
  const docHtml = PROJECT_DOCUMENTATION[projectName] || PROJECT_DOCUMENTATION[project?.title] || project?.documentation || '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${projectName} Case Study | Roshan Damor`;
  }, [projectName]);

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Top Sticky Navigation */}
        <nav className="page-top-nav" aria-label="Project Navigation">
          <button
            type="button"
            className="page-back-btn"
            onClick={() => onNavigate('home', 'projects')}
          >
            <i className="fas fa-arrow-left"></i> Back to Portfolio
          </button>

          <a href="#home" className="page-brand-logo" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
            <img src="/static/images/logo.webp" alt="Roshan Damor" width="120" height="30" />
          </a>

          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            data-modal="modal-rexi"
          >
            <i className="fas fa-dragon"></i> Ask Rexi AI
          </button>
        </nav>

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

        {/* Hero Card & Banner */}
        <div className="project-detail-hero-card">
          <div className="project-detail-banner-wrap">
            <img
              src={bannerImg}
              alt={projectName}
              className="project-detail-banner"
              loading="eager"
            />
            <div className="project-detail-banner-overlay"></div>
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
                <span key={idx} className="project-tech-badge" style={{ fontSize: '13px', padding: '6px 12px' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Rich Case Study Document Injection */}
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

        {/* Back Navigation Bar at bottom */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '16px' }}
            onClick={() => onNavigate('home', 'projects')}
          >
            <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Return to All Projects
          </button>
        </div>
      </div>
    </div>
  );
}
