import React, { useEffect, useState } from 'react';
import { BLOG_ARTICLES } from '../api/blogData';
import CodeBlockShiki from '../components/doc/CodeBlockShiki';

export default function BlogDetailPage({ slug, onNavigate }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const article = BLOG_ARTICLES[slug] || BLOG_ARTICLES['understanding-microservices-architecture'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${article.title} | Roshan Damor Blog`;
  }, [article]);

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const relatedArticles = Object.values(BLOG_ARTICLES).filter(a => a.slug !== article.slug);

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Article Editorial Header */}
        <header className="page-hero blog-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span className="page-badge" style={{ margin: 0 }}>
              <i className="fas fa-newspaper"></i> {article.category}
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              <i className="far fa-clock"></i> {article.readTime}
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              <i className="far fa-calendar-alt"></i> {article.date}
            </span>
          </div>

          <h1 className="page-title" style={{ textAlign: 'left', fontSize: '38px', lineHeight: '1.25' }}>
            {article.title}
          </h1>

          <p className="page-subtitle" style={{ textAlign: 'left', margin: '0 0 24px', maxWidth: '100%', fontSize: '17px', color: 'rgba(255, 255, 255, 0.85)' }}>
            {article.subtitle}
          </p>

          {/* Author & Share Bar */}
          <div className="blog-author-bar">
            <div className="blog-author-info">
              <img src={article.author.avatar} alt={article.author.name} className="blog-author-avatar" />
              <div>
                <span className="blog-author-name">{article.author.name}</span>
                <span className="blog-author-role">{article.author.role}</span>
              </div>
            </div>
            <div className="blog-share-actions">
              <button 
                type="button" 
                className="doc-ctrl-btn" 
                onClick={handleShareCopy}
                title="Copy Article Link"
              >
                <i className={copiedLink ? "fas fa-check" : "fas fa-link"}></i>
                {copiedLink ? "Link Copied!" : "Share"}
              </button>
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="doc-ctrl-btn"
                title="Share on X / Twitter"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="doc-ctrl-btn"
                title="Share on LinkedIn"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </header>

        {/* Featured Editorial Banner — same width column as article body */}
        <div className="blog-featured-banner-wrap blog-column-width">
          <img 
            src={article.image} 
            alt={article.title} 
            className="blog-featured-img" 
          />
        </div>

        {/* Main Article Reading Container — same width column */}
        <article className="blog-reading-container blog-column-width">

          {/* TL;DR Executive Summary */}
          {article.tldr && (
            <div className="blog-tldr-box">
              <div className="blog-tldr-header">
                <i className="fas fa-bolt"></i>
                <span>Executive Summary (TL;DR)</span>
              </div>
              <p className="blog-tldr-text">{article.tldr}</p>
            </div>
          )}

          {/* Table of Contents */}
          {article.toc && article.toc.length > 0 && (
            <nav className="blog-toc-box" aria-label="Table of Contents">
              <h4 className="blog-toc-title"><i className="fas fa-list-ul"></i> Table of Contents</h4>
              <ul className="blog-toc-list">
                {article.toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Article Sections */}
          <div className="blog-body-prose">
            {article.sections.map((sec) => (
              <section key={sec.id} id={sec.id} className="blog-article-section">
                <h2 className="blog-section-title">{sec.heading}</h2>
                <div className="blog-section-content">
                  {sec.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('>')) {
                      return (
                        <blockquote key={pIdx} className="blog-blockquote">
                          {paragraph.replace(/^>\s*/, '')}
                        </blockquote>
                      );
                    }
                    if (paragraph.startsWith('-')) {
                      return (
                        <ul key={pIdx} className="blog-prose-list">
                          {paragraph.split('\n').map((item, iIdx) => (
                            <li key={iIdx} dangerouslySetInnerHTML={{ __html: item.replace(/^-\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIdx} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                    );
                  })}
                </div>

                {sec.codeSnippet && (
                  <div style={{ margin: '24px 0' }}>
                    <CodeBlockShiki
                      code={sec.codeSnippet.code}
                      language={sec.codeSnippet.language}
                      filename={sec.codeSnippet.filename}
                      description={sec.codeSnippet.description}
                    />
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Key Takeaways Box */}
          {article.takeaways && article.takeaways.length > 0 && (
            <div className="blog-takeaways-card" id="key-takeaways">
              <div className="blog-takeaways-header">
                <i className="fas fa-check-double"></i>
                <span>Key Takeaways &amp; Engineering Checklist</span>
              </div>
              <ul className="blog-takeaways-list">
                {article.takeaways.map((point, idx) => (
                  <li key={idx}>
                    <i className="fas fa-check-circle"></i>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Author Signature Card */}
          <div className="blog-author-card">
            <img src={article.author.avatar} alt={article.author.name} className="author-card-avatar" />
            <div className="author-card-details">
              <div className="author-card-title">Written by {article.author.name}</div>
              <p className="author-card-bio">{article.author.bio}</p>
              <div className="author-card-actions">
                <a href="#about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="btn btn-secondary btn-sm">
                  <i className="fas fa-user"></i> Full Profile
                </a>
                <a href="https://github.com/logicbyroshan" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <i className="fab fa-github"></i> GitHub
                </a>
                <a href="https://linkedin.com/in/logicbyroshan" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <i className="fab fa-linkedin-in"></i> LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Related Articles Navigation */}
          {relatedArticles.length > 0 && (
            <div className="blog-related-wrap">
              <div className="blog-related-heading">
                <span>Continue Reading</span>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home', 'blog'); }}>
                  View All Articles <i className="fas fa-arrow-right"></i>
                </a>
              </div>
              <div className="blog-related-grid">
                {relatedArticles.slice(0, 2).map((rel) => (
                  <div 
                    key={rel.slug} 
                    className="blog-related-card"
                    onClick={() => onNavigate('blog-detail', null, rel.slug)}
                    role="button"
                    tabIndex="0"
                  >
                    <div className="blog-related-img-wrap">
                      <img src={rel.image} alt={rel.title} />
                    </div>
                    <div className="blog-related-meta">
                      <span className="blog-related-badge">{rel.category}</span>
                      <h4 className="blog-related-title">{rel.title}</h4>
                      <span className="blog-related-date"><i className="far fa-clock"></i> {rel.readTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
