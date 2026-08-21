import React, { useEffect } from 'react';
import { STATIC_PROJECTS, PROJECT_DOCUMENTATION } from '../api/hydratePortfolio';

export default function ProjectDetailPage({ slug, onNavigate }) {
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
  const bannerImg = project?.thumbnail || '/static/images/cardflow-banner.webp';
  const docHtml = PROJECT_DOCUMENTATION[projectName] || PROJECT_DOCUMENTATION[project?.title] || project?.documentation || '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${projectName} Case Study | Roshan Damor`;
  }, [projectName]);

  const getSlugOf = (p) => (p.project_name || p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Breadcrumb Navigation */}
        <div className="page-breadcrumbs">
          <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Home</a>
          <span className="breadcrumb-separator">/</span>
          <a href="#projects" onClick={(e) => { e.preventDefault(); onNavigate('home', 'projects'); }}>Projects</a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{projectName}</span>
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

        {/* Hero Card with Full-Width Gradient Showcase Banner */}
        <div className="project-detail-hero-card">
          <div className="project-detail-banner-wrap">
            <div className={`universal-project-thumb universal-gradient-${(projectIndex % 5) + 1}`}>
              <div className="universal-thumb-bg-pattern"></div>
              <i className="fas fa-cubes universal-thumb-watermark"></i>
              <div className="universal-thumb-content">
                <span className="universal-thumb-tag">{categoryName}</span>
                <h2 className="universal-thumb-title">{projectName}</h2>
                <p className="universal-thumb-sub">{project?.description}</p>
                <div className="universal-thumb-tech-row">
                  {(project?.technologies_list || []).slice(0, 5).map((t, idx) => (
                    <span key={idx} className="universal-thumb-tech-pill">{t}</span>
                  ))}
                </div>
              </div>
            </div>
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
