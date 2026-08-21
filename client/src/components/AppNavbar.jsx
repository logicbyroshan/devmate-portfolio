import React, { useState } from 'react';

export default function AppNavbar({ currentRoute, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSubpage = currentRoute.name !== 'home';

  const handleNav = (e, target, anchor) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(target, anchor);
  };

  const handleRexi = () => {
    setMobileMenuOpen(false);
    if (typeof window.openModal === 'function') {
      window.openModal('modal-rexi');
    } else {
      const modal = document.getElementById('modal-rexi');
      if (modal) {
        modal.classList.add('modal-visible');
        document.body.classList.add('modal-open');
      }
    }
  };

  return (
    <header className="unified-navbar-wrapper">
      <div className="unified-navbar-container">
        {/* Left: Brand Logo */}
        <a
          href="#home"
          className="unified-nav-brand"
          onClick={(e) => handleNav(e, 'home')}
          aria-label="Roshan Damor Home"
        >
          <img
            src="/static/images/logo.webp"
            alt="Roshan Damor Logo"
            className="unified-nav-logo"
            width="135"
            height="34"
            decoding="async"
          />
        </a>

        {/* Center: Desktop Nav Links */}
        <nav className="unified-nav-links" aria-label="Main Navigation">
          <a
            href="#home"
            className={`unified-nav-link ${currentRoute.name === 'home' && !window.location.hash.includes('#about') && !window.location.hash.includes('#projects') && !window.location.hash.includes('#experience') && !window.location.hash.includes('#contact') ? 'active' : ''}`}
            onClick={(e) => handleNav(e, 'home')}
          >
            Home
          </a>
          <a
            href="#/about"
            className={`unified-nav-link ${currentRoute.name === 'about' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, 'about')}
          >
            About
          </a>
          <a
            href="#projects"
            className={`unified-nav-link ${currentRoute.name === 'project-detail' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, 'home', 'projects')}
          >
            Projects
          </a>
          <a
            href="#/experience"
            className={`unified-nav-link ${currentRoute.name === 'experience' ? 'active' : ''}`}
            onClick={(e) => handleNav(e, 'experience')}
          >
            Experience
          </a>
          <a
            href="#contact"
            className="unified-nav-link"
            onClick={(e) => handleNav(e, 'home', 'contact')}
          >
            Contact
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="unified-nav-actions">
          {isSubpage && (
            <button
              type="button"
              className="unified-nav-back-btn"
              onClick={(e) => handleNav(e, 'home')}
              title="Return to Portfolio Home"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Home</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary unified-rexi-btn"
            onClick={handleRexi}
            aria-label="Ask Rexi AI Assistant"
          >
            <i className="fas fa-dragon"></i>
            <span>Ask Rexi</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className={`unified-hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="unified-mobile-drawer">
          <nav className="unified-mobile-nav">
            <a
              href="#home"
              className={`unified-mobile-link ${currentRoute.name === 'home' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'home')}
            >
              <i className="fas fa-home"></i> Home
            </a>
            <a
              href="#/about"
              className={`unified-mobile-link ${currentRoute.name === 'about' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'about')}
            >
              <i className="fas fa-user-tie"></i> About Me
            </a>
            <a
              href="#projects"
              className={`unified-mobile-link ${currentRoute.name === 'project-detail' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'home', 'projects')}
            >
              <i className="fas fa-folder-open"></i> Projects
            </a>
            <a
              href="#/experience"
              className={`unified-mobile-link ${currentRoute.name === 'experience' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'experience')}
            >
              <i className="fas fa-briefcase"></i> Experience
            </a>
            <a
              href="#contact"
              className="unified-mobile-link"
              onClick={(e) => handleNav(e, 'home', 'contact')}
            >
              <i className="fas fa-envelope"></i> Contact
            </a>

            <div className="unified-mobile-actions">
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleRexi}
              >
                <i className="fas fa-dragon"></i> Ask Rexi AI Assistant
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
