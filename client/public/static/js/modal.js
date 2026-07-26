/* ══════════════════════════════════════════
   MODAL — Shared open/close logic + Rexi chat
   ══════════════════════════════════════════ */

(function () {
    'use strict';

    let rexiInitialized = false;

    // ── Open / Close ──────────────────────────────────────────────────────────

    function openModal(id) {
        const overlay = document.getElementById(id);
        if (!overlay) return;
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        overlay.classList.add('modal-visible');
        if (id === 'modal-rexi') {
            initRexi();
        }
        overlay.querySelector('.modal-close')?.focus();
    }

    function closeModal(overlay) {
        overlay.classList.remove('modal-visible');
        if (!document.querySelector('.modal-overlay.modal-visible')) {
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }

    // Prevent background wheel scrolling when modal is open
    document.addEventListener('wheel', function (e) {
        const open = document.querySelector('.modal-overlay.modal-visible');
        if (!open) return;
        const modalBox = e.target.closest('.modal-box');
        if (!modalBox) {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevent background touchmove scrolling when modal is open
    document.addEventListener('touchmove', function (e) {
        const open = document.querySelector('.modal-overlay.modal-visible');
        if (!open) return;
        const modalBox = e.target.closest('.modal-box');
        if (!modalBox) {
            e.preventDefault();
        }
    }, { passive: false });

    // ── Wire trigger buttons ──────────────────────────────────────────────────

    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('[data-modal]');
        if (trigger) {
            e.preventDefault();
            openModal(trigger.dataset.modal);
            return;
        }

        // close button inside modal
        const closeBtn = e.target.closest('.modal-close');
        if (closeBtn) {
            const overlay = closeBtn.closest('.modal-overlay');
            if (overlay) closeModal(overlay);
            return;
        }

        // click on the backdrop (not the card itself)
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
    });

    // Escape key closes topmost visible modal
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches('[data-modal][role="button"]')) {
            e.preventDefault();
            openModal(e.target.dataset.modal);
            return;
        }

        if (e.key !== 'Escape') return;
        const open = document.querySelector('.modal-overlay.modal-visible');
        if (open) closeModal(open);
    });

    // ── Rexi Chat ─────────────────────────────────────────────────────────────

    const REXI_KNOWLEDGE = {
        name:       'Roshan Damor',
        role:       'AI Full Stack Developer',
        location:   'Bhopal, Madhya Pradesh, India',
        tech:       'React, Next.js, Node.js, Python, Django, FastAPI, AWS, Docker, PostgreSQL, MongoDB, TypeScript, Tailwind CSS',
        dsa:        '1300+ DSA problems solved across LeetCode, CodeForces and HackerRank',
        projects:   'CardFlow (ID Management), JobPilot (AI Job Matcher), VidyaFlow (School OS), RiseTogether',
        experience: 'Full-stack software engineering; built and shipped production applications',
        contact:    'mail@logicbyroshan.in | Available via LinkedIn or the contact form on this site',
        education:  'B.Tech Computer Science with specialization in AI & Machine Learning',
        hobbies:    'Competitive programming, open-source contributions, exploring new AI tools',
    };

    const REXI_RESPONSES = [
        {
            pattern: /who are you|who r u|what are you|your name|who created you|who made you|about you|about yourself/i,
            reply:   `I'm **Rexi** 🐉 — the official dragon mascot & AI Assistant for Roshan Damor's portfolio, powered by **Qwen3-0.6B**!\n\nI can answer questions about Roshan's skills, projects, work experience, DSA statistics, or how to contact him. What would you like to know?`,
        },
        {
            pattern: /who is roshan|about roshan|who is he|roshan damor|who is roshan damor|tell me about roshan/i,
            reply:   `Roshan Damor is an **${REXI_KNOWLEDGE.role}** based in ${REXI_KNOWLEDGE.location}. A builder at heart with a love for clean code, AI solutions, and hard problems! 🚀`,
        },
        {
            pattern: /role|job|work|does|what/i,
            reply:   `Roshan is an **${REXI_KNOWLEDGE.role}** — building AI-powered solutions, scalable web apps, and modern cloud applications. 💻`,
        },
        {
            pattern: /tech|stack|skill|language|framework/i,
            reply:   `Roshan's core stack: **${REXI_KNOWLEDGE.tech}**. He picks the right tool for every job. 🛠️`,
        },
        {
            pattern: /dsa|algorithm|leetcode|problem|competitive/i,
            reply:   `${REXI_KNOWLEDGE.dsa}. Strong in dynamic programming, graphs, and system design. 🧠`,
        },
        {
            pattern: /project/i,
            reply:   `He's built: ${REXI_KNOWLEDGE.projects}. Check the Projects section for live demos! 🔭`,
        },
        {
            pattern: /experience|intern|work history/i,
            reply:   `${REXI_KNOWLEDGE.experience}. His experience spans frontend, backend, AI, and cloud. ☁️`,
        },
        {
            pattern: /contact|reach|email|hire/i,
            reply:   `${REXI_KNOWLEDGE.contact}. He's open to exciting opportunities! 📩`,
        },
        {
            pattern: /education|college|degree|study/i,
            reply:   `${REXI_KNOWLEDGE.education}. Always learning, always building. 🎓`,
        },
        {
            pattern: /hobby|interest|free time|passion/i,
            reply:   `${REXI_KNOWLEDGE.hobbies}. Never a dull moment! 🎮`,
        },
        {
            pattern: /location|where|city/i,
            reply:   `Based in ${REXI_KNOWLEDGE.location}. Open to remote and on-site opportunities worldwide. 🌍`,
        },
        {
            pattern: /hello|hi|hey|howdy|greet/i,
            reply:   `Hey there! 👋 I'm Rexi. Ask me anything about Roshan — his skills, projects, experience, or how to reach him!`,
        },
        {
            pattern: /thanks|thank you|thx/i,
            reply:   `You're welcome! 😊 Anything else you'd like to know?`,
        },
    ];

    function getRexiReply(text) {
        for (const entry of REXI_RESPONSES) {
            if (entry.pattern.test(text)) return entry.reply;
        }
        return `Hmm, I'm not sure about that one. Try asking about Roshan's skills, projects, experience, tech stack, or how to contact him! 🤔`;
    }

    function formatMarkdown(text) {
        if (!text) return '';
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
        return html;
    }

    function appendMessage(container, text, isUser) {
        const msgEl = document.createElement('div');
        msgEl.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-bot');

        const avatarEl = document.createElement('div');
        avatarEl.className = 'chat-avatar';
        avatarEl.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-dragon"></i>';

        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'chat-bubble';
        if (isUser) {
            bubbleEl.textContent = text;
        } else {
            bubbleEl.innerHTML = formatMarkdown(text);
        }

        if (isUser) {
            msgEl.appendChild(bubbleEl);
            msgEl.appendChild(avatarEl);
        } else {
            msgEl.appendChild(avatarEl);
            msgEl.appendChild(bubbleEl);
        }

        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
        return msgEl;
    }

    function showTyping(container) {
        const typingEl = document.createElement('div');
        typingEl.className = 'chat-msg chat-msg-bot chat-typing';

        const avatarEl = document.createElement('div');
        avatarEl.className = 'chat-avatar';
        avatarEl.innerHTML = '<i class="fas fa-dragon"></i>';

        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'chat-bubble';
        bubbleEl.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

        typingEl.appendChild(avatarEl);
        typingEl.appendChild(bubbleEl);
        container.appendChild(typingEl);
        container.scrollTop = container.scrollHeight;
        return typingEl;
    }

    function initRexi() {
        // Wire fullscreen toggle button (works regardless of rexiInitialized flag)
        const fullscreenBtn = document.getElementById('rexi-fullscreen-btn');
        if (fullscreenBtn && !fullscreenBtn.dataset.bound) {
            fullscreenBtn.dataset.bound = 'true';
            fullscreenBtn.addEventListener('click', function () {
                const modalBox = this.closest('.modal-box-rexi');
                if (modalBox) {
                    modalBox.classList.toggle('modal-box-fullscreen');
                    const isFullscreen = modalBox.classList.contains('modal-box-fullscreen');
                    this.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
                    this.setAttribute('title', isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen');
                }
            });
        }

        if (rexiInitialized) return;

        const input      = document.getElementById('rexi-input');
        const sendBtn    = document.getElementById('rexi-send');
        const messages   = document.getElementById('rexi-messages');
        if (!input || !sendBtn || !messages) return;

        rexiInitialized = true;

        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            sendBtn.disabled = true;

            appendMessage(messages, text, true);

            const typingEl = showTyping(messages);
            const startTime = Date.now();

            try {
                const apiBase = window.PORTFOLIO_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api';
                const response = await fetch(`${apiBase}/rexi/chat/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text }),
                });

                // Ensure at least 1.4s typing animation for a realistic human pace
                const elapsed = Date.now() - startTime;
                const minDelay = 1400 + Math.random() * 600;
                if (elapsed < minDelay) {
                    await new Promise(r => setTimeout(r, minDelay - elapsed));
                }

                if (response.ok) {
                    const data = await response.json();
                    typingEl.remove();
                    appendMessage(messages, data.reply || getRexiReply(text), false);
                } else {
                    typingEl.remove();
                    appendMessage(messages, getRexiReply(text), false);
                }
            } catch (err) {
                typingEl.remove();
                appendMessage(messages, getRexiReply(text), false);
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        }

        sendBtn.addEventListener('click', sendMessage);

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}());
