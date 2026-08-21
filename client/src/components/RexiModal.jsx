import React from 'react';

export default function RexiModal() {
  return (
    <div className="modal-overlay" id="modal-rexi">
      <div className="modal-box modal-box-rexi">
        <div className="modal-header-bar modal-rexi-header">
          <div className="modal-header-left modal-rexi-header-left">
            <div className="modal-icon-wrap modal-icon-green modal-icon-compact">
              <i className="fas fa-dragon"></i>
            </div>
            <h2 className="modal-title modal-title-compact">Ask Rexi</h2>
            <span className="rexi-model-badge">Qwen3-0.6B</span>
          </div>
          <div className="modal-header-right modal-rexi-header-right">
            <button
              type="button"
              className="modal-header-btn modal-expand-btn"
              id="rexi-fullscreen-btn"
              aria-label="Full Page View"
              title="Full Page View"
            >
              <i className="fas fa-expand"></i>
            </button>
            <button
              type="button"
              className="modal-header-btn modal-close"
              aria-label="Close"
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="modal-chat">
          <div className="chat-messages" id="rexi-messages">
            <div className="chat-msg chat-msg-bot">
              <div className="chat-avatar">
                <i className="fas fa-dragon"></i>
              </div>
              <div className="chat-bubble">
                Hey! 👋 I&apos;m Rexi, Roshan&apos;s AI assistant powered by ⚡ <b>Qwen3-0.6B</b>. Ask me about his skills, projects, experience, or anything else!
              </div>
            </div>
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              id="rexi-input"
              placeholder="Ask me something..."
              autoComplete="off"
            />
            <button
              className="chat-send-btn"
              id="rexi-send"
              type="button"
              aria-label="Send message to Rexi"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
