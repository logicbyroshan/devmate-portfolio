import React, { useState } from 'react';

export default function AppNavbar({ currentRoute, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
      {/* Navigation for Desktop - Exact Original Navbar Structure */}
      <div className="navbar navbar-desktop">
        <div className="container nav-container">
          <nav role="navigation" className="nav-menu">
            <a
              href="#skills"
              className="nav-link"
              onClick={(e) => handleNav(e, 'home', 'skills')}
            >
              Skills
            </a>
            <a
              href="#projects"
              className="nav-link"
              onClick={(e) => handleNav(e, 'home', 'projects')}
            >
              Projects
            </a>
            <a
              href="#experience"
              className="nav-link"
              onClick={(e) => handleNav(e, 'home', 'experience')}
            >
              Experience
            </a>
          </nav>

          <a
            href="#home"
            className="brand"
            onClick={(e) => handleNav(e, 'home')}
            aria-label="Roshan Damor Logo"
          >
            <img
              src="/static/images/logo.webp"
              alt="Roshan Damor Logo"
              className="logo-image"
              width="135"
              height="34"
              decoding="async"
            />
          </a>

          <div className="nav-actions">
            <a
              href="#/about"
              className="btn btn-secondary btn-nav"
              onClick={(e) => handleNav(e, 'about')}
            >
              About
            </a>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRexi}
              aria-label="Ask Rexi AI Assistant"
            >
              Ask Rexi
            </button>
          </div>
        </div>
      </div>

      {/* Navigation for Mobile - Exact Original Navbar Structure */}
      <div className="navbar navbar-mobile">
        <div className="container nav-container-mobile">
          <button
            className={`hamburger-menu ${mobileMenuOpen ? 'active' : ''}`}
            id="hamburgerMenu"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <a
            href="#home"
            className="brand"
            onClick={(e) => handleNav(e, 'home')}
            aria-label="Roshan Damor Logo"
          >
            <img
              src="/static/images/logo.webp"
              alt="Roshan Damor Logo"
              className="logo-image"
              width="135"
              height="34"
              decoding="async"
            />
          </a>

          <button
            type="button"
            className="btn btn-primary mobile-resume-btn"
            onClick={handleRexi}
            aria-label="Ask Rexi"
          >
            <i className="fas fa-dragon"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
          <nav className="mobile-nav">
            <a
              href="#skills"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'home', 'skills')}
            >
              Skills
            </a>
            <a
              href="#projects"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'home', 'projects')}
            >
              Projects
            </a>
            <a
              href="#experience"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'home', 'experience')}
            >
              Experience
            </a>
            <a
              href="#/about"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'about')}
            >
              About
            </a>
          </nav>
          <div className="mobile-nav-actions" style={{ padding: '0 30px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleRexi}
            >
              Ask Rexi
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        <div
          className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
          id="mobileOverlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </div>
    </>
  );
}
