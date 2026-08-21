function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeUrl(url, fallback = '#') {
  if (!url) return fallback;

  try {
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(String(url), baseOrigin);
    const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);
    return allowedProtocols.has(parsed.protocol) ? parsed.href : fallback;
  } catch {
    return fallback;
  }
}

function setMetaByName(name, content) {
  if (!content) return;

  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
  if (!content) return;

  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLinkHref(rel, href) {
  if (!href) return;

  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function setJsonLdById(id, payload) {
  const script = document.getElementById(id);
  if (!script || !payload) return;

  script.textContent = JSON.stringify(payload);
}

function toAbsoluteUrl(url, fallback) {
  const candidate = safeUrl(url, fallback);
  try {
    return new URL(candidate, window.location.origin).href;
  } catch {
    return fallback;
  }
}

function updateSeoMetadata(profile, projects) {
  const fullName = profile?.full_name || 'Roshan Damor';
  const alternateName = 'Roshand Damor';
  const canonicalUrl = 'https://logicbyroshan.in/';
  const title = profile?.meta_title || `${fullName} | Software Engineer Portfolio`;
  const description = profile?.meta_description || `${fullName} is a software engineer focused on building production-grade web systems, SaaS platforms, and practical AI-powered applications.`;
  const keywords = profile?.meta_keywords || 'Roshan Damor, Software Engineer, Portfolio, Full Stack, AI Engineer, React, Django, Python';
  const ogImage = toAbsoluteUrl(
    projects?.[0]?.thumbnail || '/static/images/hero.png',
    'https://logicbyroshan.in/static/images/hero.png',
  );

  document.title = title;
  setMetaByName('description', description);
  setMetaByName('keywords', keywords);
  setMetaByName('author', fullName);
  setMetaByName('twitter:title', title);
  setMetaByName('twitter:description', description);
  setMetaByName('twitter:image', ogImage);

  setMetaByProperty('og:title', title);
  setMetaByProperty('og:description', description);
  setMetaByProperty('og:url', canonicalUrl);
  setMetaByProperty('og:image', ogImage);
  setMetaByProperty('og:image:alt', `${fullName} portfolio`);

  setLinkHref('canonical', canonicalUrl);

  const sameAs = [profile?.github, profile?.linkedin, profile?.twitter, profile?.youtube, profile?.website]
    .map((url) => safeUrl(url, ''))
    .filter((url) => Boolean(url));

  setJsonLdById('seo-schema-person', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${canonicalUrl}#person`,
        name: fullName,
        alternateName: [alternateName],
        url: canonicalUrl,
        image: ogImage,
        jobTitle: profile?.title || 'Software Engineer',
        description,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: `${fullName} Portfolio`,
        description,
        publisher: { '@id': `${canonicalUrl}#person` },
      },
    ],
  });
}

function formatDateRange(startDate, endDate, currentlyWorking) {
  if (!startDate) return 'Timeline not specified';

  const start = new Date(startDate);
  const startLabel = Number.isNaN(start.getTime())
    ? String(startDate)
    : start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (currentlyWorking) {
    return `${startLabel} - Present`;
  }

  if (!endDate) {
    return startLabel;
  }

  const end = new Date(endDate);
  const endLabel = Number.isNaN(end.getTime())
    ? String(endDate)
    : end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return `${startLabel} - ${endLabel}`;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element && text) {
    element.textContent = text;
  }
}

function updateProfile(profile) {
  if (!profile) return;

  const heroHeading = document.querySelector('.hero-heading');
  if (heroHeading) {
    const fullName = profile.full_name || 'Roshan Damor';
    let title = profile.title || 'Software Engineer';
    let titleHtml = escapeHtml(title).replaceAll('\n', '<br>');
    heroHeading.innerHTML = `${escapeHtml(fullName)}<br><span class="text-gradient">${titleHtml}</span>`;
  }

  setText('.about-description', profile.bio || 'Software Engineer focused on building production-grade web systems, SaaS platforms, and practical AI-powered applications.');

  const contactValues = document.querySelectorAll('.contact-value');
  if (contactValues.length >= 3) {
    contactValues[0].textContent = profile.email || contactValues[0].textContent;
    contactValues[1].textContent = profile.phone || contactValues[1].textContent;
    contactValues[2].textContent = profile.location || contactValues[2].textContent;
  }

  const footerContactValues = document.querySelectorAll('.footer-contact-list li span');
  if (footerContactValues.length >= 3) {
    footerContactValues[0].textContent = profile.email || footerContactValues[0].textContent;
    footerContactValues[1].textContent = profile.phone || footerContactValues[1].textContent;
    footerContactValues[2].textContent = profile.location || footerContactValues[2].textContent;
  }

  const socials = {
    github: profile.github,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
  };

  document.querySelectorAll('.footer-social-btn').forEach((link) => {
    const label = (link.getAttribute('aria-label') || '').toLowerCase();
    if (label.includes('github') && socials.github) {
      link.href = socials.github;
    }
    if (label.includes('linkedin') && socials.linkedin) {
      link.href = socials.linkedin;
    }
    if ((label.includes('twitter') || label.includes('x')) && socials.twitter) {
      link.href = socials.twitter;
    }
  });
}

const STATIC_PROJECTS = [
  {
    title: 'CardFlow',
    project_name: 'CardFlow',
    description: 'Production ID card management platform built for schools and organizations, covering data management, automated workflows, card generation and cross-platform operations.',
    category: { name: 'Enterprise SaaS' },
    status: '🟢 Production',
    status_class: 'status-prod',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'Redis', 'Celery'],
    thumbnail: '/static/images/ecom.webp',
    has_github: false,
    live_url: 'https://logicbyroshan.in/#projects',
    primary_btn: 'Case Study',
  },
  {
    title: 'VidyaMaxx',
    project_name: 'VidyaMaxx',
    description: 'AI-integrated school management platform bringing academics, administration, communication and school operations into one system.',
    category: { name: 'AI-Integrated SaaS' },
    status: '🟡 Pilot Testing',
    status_class: 'status-pilot',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'Redis', 'AI'],
    thumbnail: '/static/images/faqside.webp',
    has_github: false,
    live_url: 'https://logicbyroshan.in/#projects',
    primary_btn: 'Case Study',
  },
  {
    title: 'PrintNexx',
    project_name: 'PrintNexx',
    description: 'Internal image-processing and card-generation tool built to automate photo preparation, image finishing and ID card generation workflows.',
    category: { name: 'Internal Engineering Tool' },
    status: '🟢 In Active Use',
    status_class: 'status-prod',
    technologies_list: ['Python', 'OpenCV', 'Image Processing', 'Automation'],
    thumbnail: '/static/images/task.webp',
    has_github: false,
    secondary_btn: 'Technical Overview',
    primary_btn: 'Case Study',
  },
  {
    title: 'EazeTrip',
    project_name: 'EazeTrip',
    description: 'Travel management platform developed for a tour agency to manage customers, bookings, tours and operational workflows.',
    category: { name: 'Client Project' },
    status: '🟢 Production',
    status_class: 'status-prod',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'REST API', 'AI'],
    thumbnail: '/static/images/hero.webp',
    has_github: false,
    live_url: 'https://logicbyroshan.in/#projects',
    primary_btn: 'Case Study',
  },
  {
    title: 'TaskFlixx',
    project_name: 'TaskFlixx',
    description: 'AI-powered task management application designed to combine everyday task organization with intelligent productivity workflows.',
    category: { name: 'AI Productivity' },
    status: '🟢 Live',
    status_class: 'status-prod',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'AI', 'REST API'],
    thumbnail: '/static/images/mybgimg.webp',
    github_url: 'https://github.com/logicbyroshan',
    has_github: true,
    primary_btn: 'Case Study',
  },
  {
    title: 'PrepSarthi',
    project_name: 'PrepSarthi',
    description: 'AI-powered learning and preparation platform designed to help users organize study workflows, practice concepts and prepare more effectively.',
    category: { name: 'AI Learning Platform' },
    status: '🔵 Open Source',
    status_class: 'status-oss',
    technologies_list: ['Python', 'Django', 'React', 'PostgreSQL', 'AI'],
    thumbnail: '/static/images/about/about1.webp',
    github_url: 'https://github.com/logicbyroshan',
    has_github: true,
    primary_btn: 'Case Study',
  },
];

const STATIC_SKILL_CARDS = [
  {
    title: 'Software Engineering',
    icon: 'fa-puzzle-piece',
    skills: ['Python', 'Java', 'C/C++', 'JavaScript', 'TypeScript', 'Django', 'DRF', 'FastAPI', 'Flask', 'Node.js', 'REST APIs', 'System Design', 'Git'],
  },
  {
    title: 'AI & Data',
    icon: 'fa-robot',
    skills: ['LLMs', 'RAG', 'AI Agents', 'AI Workflows', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas', 'ML'],
  },
  {
    title: 'Application Development',
    icon: 'fa-globe',
    skills: ['React', 'Vue', 'HTML/CSS', 'Tailwind', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'React Native', 'Electron'],
  },
  {
    title: 'Infrastructure & Systems',
    icon: 'fa-cloud',
    skills: ['Docker', 'Nginx', 'Gunicorn', 'Linux', 'Celery', 'Redis', 'GitHub Actions', 'CI/CD', 'Deployment', 'Background Jobs'],
  },
];

function updateSkills(skills) {
  const techGrid = document.querySelector('.tech-grid');
  if (!techGrid) return;

  if (!skills || !skills.length) {
    // Render the 4 static cards
    techGrid.innerHTML = STATIC_SKILL_CARDS
      .map((card) => {
        const listItems = card.skills.map((name) => `<li>${escapeHtml(name)}</li>`).join('');
        return `
          <div class="tech-card">
            <div class="tech-icon-wrapper">
              <i class="fas ${card.icon}"></i>
            </div>
            <h3 class="tech-card-title">${escapeHtml(card.title)}</h3>
            <ul class="skills-list">${listItems}</ul>
          </div>
        `;
      })
      .join('');
    return;
  }

  // Group by category name
  const groups = new Map();
  skills.forEach((skill) => {
    const catName = skill.category?.name || skill.category_name;
    if (catName) {
      if (!groups.has(catName)) {
        groups.set(catName, []);
      }
      groups.get(catName).push(skill.name);
    }
  });

  // Render the 4 category cards, populating with live items if available or static fallbacks
  const cardsToRender = STATIC_SKILL_CARDS.map((staticCard) => {
    const liveItems = groups.get(staticCard.title);
    return {
      title: staticCard.title,
      icon: staticCard.icon,
      skills: (liveItems && liveItems.length > 0) ? liveItems : staticCard.skills,
    };
  });

  techGrid.innerHTML = cardsToRender
    .map((card) => {
      const listItems = card.skills.map((name) => `<li>${escapeHtml(name)}</li>`).join('');
      return `
        <div class="tech-card">
          <div class="tech-icon-wrapper">
            <i class="fas ${card.icon}"></i>
          </div>
          <h3 class="tech-card-title">${escapeHtml(card.title)}</h3>
          <ul class="skills-list">${listItems}</ul>
        </div>
      `;
    })
    .join('');
}

export function getCombinedProjects(projects = []) {
  const validLiveProjects = Array.isArray(projects) ? projects.filter(Boolean) : [];

  if (validLiveProjects.length >= STATIC_PROJECTS.length) {
    return validLiveProjects.slice(0, 8);
  }
  if (validLiveProjects.length > 0) {
    const neededStaticCount = Math.max(0, STATIC_PROJECTS.length - validLiveProjects.length);
    return [
      ...validLiveProjects,
      ...STATIC_PROJECTS.slice(validLiveProjects.length, validLiveProjects.length + neededStaticCount),
    ];
  }
  return STATIC_PROJECTS;
}

function updateProjects(projects = []) {
  const slider = document.querySelector('.projects-slider');
  if (!slider) return;

  const combinedProjects = getCombinedProjects(projects);

  slider.innerHTML = combinedProjects
    .map((project, index) => {
      const techBadges = (project.technologies_list || [])
        .slice(0, 5)
        .map((tech) => `<span class="project-tech-badge">${escapeHtml(tech)}</span>`)
        .join('');

      const categoryName = project.category?.name || 'Enterprise SaaS';
      const imageUrl = project.thumbnail || '/static/images/ecom.webp';
      const projectName = project.project_name || project.title;
      const statusText = project.status || '🟢 Production';
      const statusClass = project.status_class || 'status-prod';
      const githubLink = safeUrl(project.github_url || 'https://github.com/logicbyroshan');
      const hasGithub = project.has_github ?? (Boolean(project.github_url) && !project.github_url.includes('#'));
      const secondaryBtn = project.secondary_btn || (hasGithub ? '' : 'Live Preview');

      let buttonsHtml = `<button type="button" class="btn btn-primary project-btn" data-modal="modal-project">Case Study</button>`;
      if (hasGithub) {
        buttonsHtml += `<a href="${escapeHtml(githubLink)}" class="github-btn" target="_blank" rel="noopener noreferrer" aria-label="Open project repository"><i class="fab fa-github"></i></a>`;
      } else if (secondaryBtn === 'Technical Overview') {
        buttonsHtml += `<button type="button" class="btn btn-secondary" data-modal="modal-project">Technical Overview</button>`;
      } else if (secondaryBtn === 'Live Preview') {
        buttonsHtml += `<a href="https://logicbyroshan.in/#projects" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Live Preview</a>`;
      }

      return `
        <div class="project-card ${index === 0 ? 'active' : ''}" data-index="${index}" data-modal="modal-project">
          <div class="project-content">
            <div class="project-meta-row">
              <span class="project-nickname">${escapeHtml(categoryName)}</span>
              <span class="project-status-badge ${statusClass}">${escapeHtml(statusText)}</span>
            </div>
            <h3 class="project-title">${escapeHtml(projectName)}</h3>
            <p class="project-description">${escapeHtml(project.description || '')}</p>
            <div class="project-tech-stack">${techBadges}</div>
            <div class="project-buttons">
              ${buttonsHtml}
            </div>
          </div>
          <div class="project-image">
            <span class="project-category">${escapeHtml(categoryName)}</span>
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(projectName)}" width="1200" height="800" loading="lazy" decoding="async">
          </div>
        </div>
      `;
    })
    .join('');
}

function updateExperience(experience) {
  if (!experience.length) return;

  const timeline = document.querySelector('.roadmap-timeline');
  if (!timeline) return;

  const items = experience.slice(0, 6);
  const timelineLine = '<div class="timeline-line"></div>';

  const rows = items
    .map((item, index) => {
      const sideClass = index % 2 === 0 ? 'roadmap-left' : 'roadmap-right';
      const description = item.short_description || item.detailed_description || '';

      return `
        <div class="roadmap-item ${sideClass}">
          <div class="roadmap-card">
            <span class="roadmap-date">${escapeHtml(formatDateRange(item.start_date, item.end_date, item.currently_working))}</span>
            <h3 class="roadmap-title">${escapeHtml(item.position)}</h3>
            <p class="roadmap-description">${escapeHtml(description)}</p>
          </div>
          <div class="roadmap-dot"></div>
        </div>
      `;
    })
    .join('');

  timeline.innerHTML = `${timelineLine}${rows}`;
}

export function hydratePortfolioDom(data) {
  updateSeoMetadata(data?.profile, data?.projects || []);
  updateProfile(data?.profile);
  updateSkills(data?.skills || []);
  updateProjects(data?.projects || []);
  updateExperience(data?.experience || []);
}

export { STATIC_PROJECTS, STATIC_SKILL_CARDS, updateProjects, updateSkills };
