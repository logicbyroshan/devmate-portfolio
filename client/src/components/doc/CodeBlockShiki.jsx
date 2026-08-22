import React, { useState } from 'react';

// High-fidelity syntax tokenizer replicating Shiki themes
function highlightSyntax(code, lang = 'python') {
  const lines = code.split('\n');
  
  return lines.map((line) => {
    let formatted = line
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (lang === 'python') {
      // Comments
      if (formatted.trim().startsWith('#')) {
        return `<span class="shiki-comment">${formatted}</span>`;
      }
      formatted = formatted
        // Strings
        .replace(/(['"])(?:(?=(\\?))\2.)*?\1/g, '<span class="shiki-string">$&</span>')
        // Keywords
        .replace(/\b(def|class|return|import|from|as|async|await|if|elif|else|for|while|try|except|with|pass|raise|lambda|True|False|None|self|yield)\b/g, '<span class="shiki-keyword">$1</span>')
        // Builtins & decorators
        .replace(/@[\w.]+/g, '<span class="shiki-decorator">$&</span>')
        .replace(/\b(int|str|dict|list|set|bool|tuple|print|len|range|enumerate|super|Exception|isinstance)\b/g, '<span class="shiki-type">$1</span>')
        // Functions
        .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="shiki-func">$1</span>')
        // Numbers
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="shiki-num">$1</span>');
    } else if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
      // Comments
      if (formatted.trim().startsWith('//')) {
        return `<span class="shiki-comment">${formatted}</span>`;
      }
      formatted = formatted
        // Strings
        .replace(/(['"`])(?:(?=(\\?))\2.)*?\1/g, '<span class="shiki-string">$&</span>')
        // Keywords
        .replace(/\b(const|let|var|function|return|import|export|default|from|async|await|if|else|for|while|try|catch|throw|class|extends|new|this|typeof|instanceof)\b/g, '<span class="shiki-keyword">$1</span>')
        // Types & Objects
        .replace(/\b(React|useState|useEffect|useRef|useCallback|Promise|Array|Object|String|Number|Boolean|JSON|console|document|window)\b/g, '<span class="shiki-type">$1</span>')
        // Functions
        .replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="shiki-func">$1</span>')
        // Numbers
        .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="shiki-num">$1</span>');
    } else if (lang === 'sql') {
      formatted = formatted
        // Comments
        .replace(/(--.*$)/g, '<span class="shiki-comment">$1</span>')
        // Strings
        .replace(/(['"])(?:(?=(\\?))\2.)*?\1/g, '<span class="shiki-string">$&</span>')
        // Keywords
        .replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|DEFAULT|CASCADE|CONSTRAINT)\b/gi, '<span class="shiki-keyword">$&</span>')
        // Types
        .replace(/\b(UUID|VARCHAR|INTEGER|BIGINT|BOOLEAN|TIMESTAMP|JSONB|TEXT|SERIAL|DECIMAL|DATE)\b/gi, '<span class="shiki-type">$&</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="shiki-num">$1</span>');
    } else if (lang === 'bash' || lang === 'sh') {
      if (formatted.trim().startsWith('#')) {
        return `<span class="shiki-comment">${formatted}</span>`;
      }
      formatted = formatted
        .replace(/(['"])(?:(?=(\\?))\2.)*?\1/g, '<span class="shiki-string">$&</span>')
        .replace(/\b(docker|docker-compose|kubectl|git|npm|pip|python|gunicorn|nginx|celery|redis-cli|psql|systemctl|curl)\b/g, '<span class="shiki-keyword">$1</span>')
        .replace(/(--[\w-]+|-[\w]+)/g, '<span class="shiki-decorator">$1</span>');
    }

    return formatted;
  });
}

export default function CodeBlockShiki({ code, language = 'python', filename, description }) {
  const [copied, setCopied] = useState(false);
  const formattedLines = highlightSyntax(code.trim(), language.toLowerCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLangIcon = (lang) => {
    switch (lang.toLowerCase()) {
      case 'python': return 'fab fa-python';
      case 'javascript':
      case 'js': return 'fab fa-js-square';
      case 'typescript':
      case 'ts': return 'fas fa-code';
      case 'sql': return 'fas fa-database';
      case 'bash':
      case 'sh': return 'fas fa-terminal';
      case 'json': return 'fas fa-brackets-curly';
      default: return 'fas fa-code';
    }
  };

  return (
    <div className="doc-shiki-container">
      <div className="doc-shiki-header">
        <div className="doc-shiki-window-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        <div className="doc-shiki-title-wrap">
          <i className={getLangIcon(language)}></i>
          <span className="doc-shiki-filename">{filename || `${language.toUpperCase()} Implementation`}</span>
          <span className="doc-shiki-lang-badge">{language.toUpperCase()}</span>
        </div>
        <button 
          className="doc-shiki-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          title="Copy code"
        >
          <i className={copied ? 'fas fa-check' : 'far fa-copy'}></i>
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {description && <div className="doc-shiki-description">{description}</div>}

      <div className="doc-shiki-editor">
        <div className="doc-shiki-line-numbers" aria-hidden="true">
          {formattedLines.map((_, i) => (
            <span key={i} className="line-num">{i + 1}</span>
          ))}
        </div>
        <pre className="doc-shiki-code">
          <code>
            {formattedLines.map((lineHtml, i) => (
              <span key={i} className="code-line" dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }} />
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
