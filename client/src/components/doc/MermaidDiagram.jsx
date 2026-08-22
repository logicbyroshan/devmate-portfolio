import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
      darkMode: true,
      background: 'transparent',
      primaryColor: '#2e1065',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#8b5cf6',
      lineColor: '#38bdf8',
      secondaryColor: '#1e1b4b',
      tertiaryColor: '#0f172a',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      nodeBorder: '#7c3aed',
      clusterBkg: 'rgba(15, 23, 42, 0.7)',
      clusterBorder: '#6366f1',
      titleColor: '#38bdf8',
      edgeLabelBackground: '#090d2e',
      actorBkg: '#1e1b4b',
      actorBorder: '#7c3aed',
      actorTextColor: '#ffffff',
      actorLineColor: '#38bdf8',
      signalColor: '#38bdf8',
      signalTextColor: '#f1f5f9'
    }
  });
  mermaidInitialized = true;
}

export default function MermaidDiagram({ chart, title, subtitle, diagramType = 'Flowchart' }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    initMermaid();
    let isMounted = true;
    const renderId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    mermaid.render(renderId, chart.trim())
      .then(({ svg }) => {
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError('Failed to render diagram dynamically. Displaying structured view.');
        }
      });

    return () => {
      isMounted = false;
      const el = document.getElementById(renderId);
      if (el) el.remove();
    };
  }, [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="doc-mermaid-card">
      <div className="doc-mermaid-header">
        <div className="doc-mermaid-meta">
          <span className="doc-badge-pill">
            <i className={diagramType === 'ERD' ? 'fas fa-database' : 'fas fa-project-diagram'}></i>
            {diagramType === 'ERD' ? 'Mermaid ER Diagram' : 'Mermaid Flowchart'}
          </span>
          {title && <h4 className="doc-mermaid-title">{title}</h4>}
        </div>
        <div className="doc-mermaid-actions">
          <div className="doc-zoom-controls">
            <button className="doc-ctrl-btn" onClick={handleZoomOut} title="Zoom Out" aria-label="Zoom Out">
              <i className="fas fa-search-minus"></i>
            </button>
            <span className="doc-zoom-label">{Math.round(zoomLevel * 100)}%</span>
            <button className="doc-ctrl-btn" onClick={handleZoomIn} title="Zoom In" aria-label="Zoom In">
              <i className="fas fa-search-plus"></i>
            </button>
            <button className="doc-ctrl-btn" onClick={handleResetZoom} title="Reset Zoom" aria-label="Reset Zoom">
              <i className="fas fa-redo-alt"></i>
            </button>
          </div>
          <button 
            className={`doc-ctrl-btn ${showCode ? 'active' : ''}`}
            onClick={() => setShowCode(!showCode)}
            title="Toggle Mermaid Syntax"
            aria-label="Toggle Mermaid Syntax"
          >
            <i className="fas fa-code"></i> {showCode ? 'Hide Code' : 'Syntax'}
          </button>
          <button 
            className="doc-ctrl-btn"
            onClick={handleCopy}
            title="Copy Mermaid Code"
            aria-label="Copy Mermaid Code"
          >
            <i className={copied ? 'fas fa-check' : 'far fa-copy'}></i>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {subtitle && <p className="doc-mermaid-subtitle">{subtitle}</p>}

      {showCode && (
        <div className="doc-mermaid-code-view">
          <pre><code>{chart.trim()}</code></pre>
        </div>
      )}

      <div className="doc-mermaid-canvas-wrapper" ref={containerRef}>
        {error ? (
          <div className="doc-mermaid-error">
            <i className="fas fa-info-circle"></i>
            <span>{error}</span>
          </div>
        ) : (
          <div 
            className="doc-mermaid-svg-container"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center top' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
