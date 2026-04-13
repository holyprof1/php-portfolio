document.addEventListener("DOMContentLoaded", async () => {
  const siteKey = document.body.dataset.portfolioSite || "main";
  hideLoader();
  await loadPortfolioData();

  window.addEventListener("load", hideLoader, { once: true });

  if (document.getElementById("typed")) {
    new Typed("#typed", {
      strings: [
        "Full Stack PHP Developer",
        "Laravel Expert",
        "WordPress Specialist",
        "Technical Support Developer",
        "Website Fix & Integration Expert"
      ],
      typeSpeed: 60,
      backSpeed: 40,
      backDelay: 1800,
      loop: true,
      showCursor: true,
      cursorChar: "|"
    });
  }

  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 900,
      once: true,
      offset: 100
    });
  }

  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 80);
  });

  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }

  injectSearchUi();
  bindSearchModal(siteKey);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (event) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach((section) => {
      const top = section.offsetTop;
      if (window.scrollY >= top - 200) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  });

  const particlesContainer = document.getElementById("particles");
  if (particlesContainer) {
    for (let i = 0; i < 28; i += 1) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${Math.random() * 4 + 4}s`;
      particlesContainer.appendChild(particle);
    }
  }

  const statNumbers = document.querySelectorAll(".stat-number[data-count]");
  const animateCounter = (element) => {
    const target = Number(element.getAttribute("data-count"));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const update = () => {
      current += increment;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    };

    update();
  };

  if (statNumbers.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains("counted")) {
          animateCounter(entry.target);
          entry.target.classList.add("counted");
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach((stat) => observer.observe(stat));
  }

  renderPortfolioSections(siteKey);
  bindCvModal();
});

async function loadPortfolioData() {
  const basePath = getAssetPath();

  try {
    const [contentResponse, projectsResponse] = await Promise.all([
      fetch(`${basePath}data/portfolio-content.json`),
      fetch(`${basePath}data/projects.json`)
    ]);

    if (contentResponse.ok) {
      window.PORTFOLIO_CONTENT = await contentResponse.json();
    }

    if (projectsResponse.ok) {
      window.PORTFOLIO_PROJECTS = await projectsResponse.json();
    }
  } catch (error) {
    console.warn("Falling back to bundled portfolio data.", error);
  }
}

function hideLoader() {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  window.requestAnimationFrame(() => {
    loader.classList.add("hidden");
  });
}

function bindCvModal() {
  const modal = document.getElementById("cvModal");
  if (!modal) return;

  const openers = document.querySelectorAll('a[href="#cv-popup"]');
  const closers = modal.querySelectorAll("[data-cv-close], #cvModalClose");

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openers.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });

  closers.forEach((node) => {
    node.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function injectSearchUi() {
  const navContainer = document.querySelector(".nav-container");
  if (navContainer && !document.getElementById("siteSearchToggle")) {
    const searchButton = document.createElement("button");
    searchButton.type = "button";
    searchButton.className = "nav-search-button";
    searchButton.id = "siteSearchToggle";
    searchButton.setAttribute("aria-label", "Search capabilities");
    searchButton.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i><span>Search</span>';
    navContainer.insertBefore(searchButton, document.getElementById("menuToggle"));
  }

  if (document.getElementById("siteSearchModal")) return;

  const modal = document.createElement("div");
  modal.className = "site-search-modal";
  modal.id = "siteSearchModal";
  modal.setAttribute("aria-hidden", "true");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="site-search-backdrop" data-search-close></div>
    <div class="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="siteSearchTitle">
      <button type="button" class="site-search-close" id="siteSearchClose" aria-label="Close search">x</button>
      <div class="site-search-head">
        <span class="section-tag">Search What I Can Do</span>
        <h2 id="siteSearchTitle">Type any service, task, platform, or brief</h2>
        <p>Try things like WordPress fix, Shopify listing, Node.js API, Merchant Center, React dashboard, website redesign, SEO cleanup, landing page, or product feed support.</p>
      </div>
      <label class="site-search-input-wrap">
        <span>Search</span>
        <input type="search" id="siteSearchInput" placeholder="What do you need help with?">
      </label>
      <div class="site-search-results" id="siteSearchResults"></div>
    </div>
  `;

  document.body.appendChild(modal);
}

function bindSearchModal(siteKey) {
  const modal = document.getElementById("siteSearchModal");
  const toggle = document.getElementById("siteSearchToggle");
  if (!modal || !toggle) return;

  const input = document.getElementById("siteSearchInput");
  const results = document.getElementById("siteSearchResults");
  const closers = modal.querySelectorAll("[data-search-close], #siteSearchClose");

  const items = buildSearchItems(siteKey);

  const renderSearchResults = (query) => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      results.innerHTML = `
        <div class="search-state">
          <strong>Capabilities I regularly handle</strong>
          <p>Full stack builds, WordPress support, PHP fixes, Laravel work, React interfaces, Node.js APIs, technical SEO, Shopify listing support, Merchant Center fixes, product feeds, landing pages, web design, ecommerce support, and digital marketing implementation.</p>
        </div>
      `;
      return;
    }

    const terms = normalized.split(/\s+/).filter(Boolean);
    const matches = items
      .map((item) => {
        const haystack = `${item.title} ${item.description} ${item.keywords.join(" ")}`.toLowerCase();
        const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    if (!matches.length) {
      results.innerHTML = `
        <div class="search-state">
          <strong>Yes, I can likely help with that.</strong>
          <p>I handle mixed website, SEO, ecommerce, development, and digital support work. Send the brief through the contact form and I can review the task directly.</p>
        </div>
      `;
      return;
    }

    results.innerHTML = matches.map((item) => `
      <article class="search-result-card">
        <div class="search-result-meta">${item.group}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener">View related proof</a>` : ""}
      </article>
    `).join("");
  };

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    renderSearchResults("");
    setTimeout(() => input?.focus(), 40);
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", openModal);
  closers.forEach((node) => node.addEventListener("click", closeModal));
  input?.addEventListener("input", () => renderSearchResults(input.value));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function buildSearchItems(siteKey) {
  const data = window.PORTFOLIO_CONTENT?.[siteKey] || {};
  const skillItems = (data.skillCards || []).map((item) => ({
    group: "Service",
    title: item.title,
    description: item.text,
    keywords: [item.title, item.text]
  }));

  const projectItems = getProjectsForSite(siteKey).map((item) => ({
    group: "Proof",
    title: item.title,
    description: item.description,
    keywords: [item.title, item.description, item.note || "", ...(item.tags || [])],
    url: item.url
  }));

  const customItems = [
    {
      group: "Capability",
      title: "Shopify Listing & Product Support",
      description: "Product uploads, listing cleanup, feed fixes, merchandising updates, and storefront support for Shopify and ecommerce workflows.",
      keywords: ["shopify listing", "shopify product", "merchant center", "product feed", "listing", "ecommerce"]
    },
    {
      group: "Capability",
      title: "Technical SEO & Visibility Fixes",
      description: "Metadata updates, crawl cleanup, internal linking, indexing fixes, landing page support, and technical SEO implementation.",
      keywords: ["seo", "technical seo", "crawl", "indexing", "landing page", "metadata", "merchant center"]
    },
    {
      group: "Capability",
      title: "Full Stack Product Support",
      description: "Frontend interfaces, backend logic, PHP, Laravel, Node.js, React, API integrations, debugging, and mixed engineering support.",
      keywords: ["full stack", "php", "laravel", "node", "nodejs", "react", "api", "dashboard", "ios"]
    }
  ];

  return [...skillItems, ...projectItems, ...customItems];
}

function renderPortfolioSections(siteKey) {
  const data = window.PORTFOLIO_CONTENT?.[siteKey];
  if (!data) return;
  const sharedProjects = getProjectsForSite(siteKey);

  const heroMount = document.getElementById("pageHeroMount");
  if (heroMount) {
    heroMount.innerHTML = `
      <div class="hero-tag" data-aos="fade-down">${data.hero.tag}</div>
      <h1 class="hero-title" data-aos="fade-up" data-aos-delay="100">Hi, I'm <span class="gradient-text">${data.hero.title}</span></h1>
      ${data.hero.typed ? `<h2 class="hero-subtitle" data-aos="fade-up" data-aos-delay="180"><span class="typed-text" id="pageTyped"></span></h2>` : ""}
      <p class="hero-description" data-aos="fade-up" data-aos-delay="240">${data.hero.description}</p>
      <div class="hero-cta" data-aos="fade-up" data-aos-delay="300">
        <a href="${data.hero.primary.href}" class="btn btn-primary">${data.hero.primary.label}</a>
        <a href="${data.hero.secondary.href}" class="btn btn-outline">${data.hero.secondary.label}</a>
      </div>
      ${data.hero.stats ? `
        <div class="hero-stats hero-stats-compact" data-aos="fade-up" data-aos-delay="360">
          ${data.hero.stats.map((item) => `
            <div class="stat-item">
              <div class="stat-value">${item.value}</div>
              <span class="stat-label">${item.label}</span>
            </div>
          `).join("")}
        </div>
      ` : ""}
    `;

    if (data.hero.typed && typeof Typed !== "undefined") {
      new Typed("#pageTyped", {
        strings: data.hero.typed,
        typeSpeed: 55,
        backSpeed: 35,
        backDelay: 1800,
        loop: true,
        showCursor: true,
        cursorChar: "|"
      });
    }
  }

  const aboutMount = document.getElementById("aboutMount");
  if (aboutMount && data.about) {
    aboutMount.innerHTML = `
      <div class="section-header" data-aos="fade-up">
        <span class="section-tag">Who I Am</span>
        <h2 class="section-title">${data.about.title}</h2>
        <p class="section-subtitle">${data.about.subtitle}</p>
      </div>

      <div class="about-content">
        <div class="about-image" data-aos="fade-right">
          <div class="about-image-wrapper">
            <img src="${resolveAssetUrl(data.about.image || "me.png")}" alt="Tobi Arowosegbe - Full Stack PHP Developer" loading="lazy">
            <div class="about-image-overlay">
              <p class="overlay-text">Building digital solutions that help businesses grow</p>
            </div>
          </div>
        </div>

        <div class="about-text" data-aos="fade-left">
          <h3>${data.about.heading}</h3>
          ${data.about.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
          <div class="about-highlights">
            ${data.about.highlights.map((item) => `
              <div class="highlight-item">
                <div class="highlight-icon"><i class="fas fa-${item.icon}"></i></div>
                <div class="highlight-text">
                  <h4>${item.title}</h4>
                  <p>${item.text}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }

  const skillsMount = document.getElementById("skillsMount");
  if (skillsMount) {
    skillsMount.innerHTML = `
      <div class="section-header" data-aos="fade-up">
        <span class="section-tag">What I Use</span>
        <h2 class="section-title">${data.skillsTitle}</h2>
        <p class="section-subtitle">${data.skillsIntro}</p>
      </div>
      <div class="skills-grid skills-grid-dense">
        ${data.skillCards.map((item, index) => `
          <div class="skill-card" data-aos="fade-up" data-aos-delay="${index * 60}">
            <h3>${item.title}</h3>
            <p>${item.text}</p>
          </div>
        `).join("")}
      </div>
    `;
  }

  const projectsMount = document.getElementById("projectsMount");
  if (projectsMount) {
    projectsMount.innerHTML = `
      <div class="section-header" data-aos="fade-up">
        <span class="section-tag">My Work</span>
        <h2 class="section-title">${data.projectsTitle}</h2>
        <p class="section-subtitle">${data.projectsIntro}</p>
      </div>
      <div class="project-filters" data-aos="fade-up">
        ${data.filters.map((filter, index) => `
          <button class="project-filter-btn ${index === 0 ? "active" : ""}" type="button" data-filter="${filter}">
            ${formatFilterLabel(filter)}
          </button>
        `).join("")}
      </div>
      <div class="projects-grid" id="portfolioProjectGrid"></div>
      <div class="projects-actions">
        <button class="btn btn-outline projects-more-btn" id="projectsShowMore" type="button">View More</button>
      </div>
    `;

    bindProjectFilters(sharedProjects);
    renderVisibleProjects(sharedProjects);
  }

  const contactMount = document.getElementById("contactMount");
  if (contactMount) {
    contactMount.innerHTML = `
      <div class="section-header" data-aos="fade-up">
        <span class="section-tag">Let's Work</span>
        <h2 class="section-title">${data.contactTitle}</h2>
      </div>
      <div class="contact-card" data-aos="fade-up">
        <div class="contact-layout">
          <div class="contact-copy">
            <p>${data.contactText}</p>
            <p class="contact-helper">Use the secure form here to send the brief directly. You can also search what you need from the header and see the kind of support, platforms, and proof already covered.</p>
            <div class="contact-links">
                <a href="mailto:admin@holyprofweb.com" class="btn btn-primary">Send Email</a>
              <a href="https://wa.me/2347036074565" target="_blank" class="btn btn-outline">WhatsApp</a>
                <a href="https://github.com/holyprof1" target="_blank" class="btn btn-outline">GitHub</a>
            </div>
          </div>
          <form class="contact-form" novalidate>
            <input type="text" name="website" class="contact-honeypot" tabindex="-1" autocomplete="off">
            <div class="form-row">
              <label>
                <span>Name</span>
                <input type="text" name="name" placeholder="Your name" autocomplete="name" required>
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" placeholder="your@email.com" autocomplete="email" required>
              </label>
            </div>
            <label>
              <span>Project Type</span>
              <input type="text" name="project_type" placeholder="Website build, support, SEO, eCommerce, Shopify listing, landing page...">
            </label>
            <label>
              <span>Project Details</span>
              <textarea name="message" rows="5" placeholder="Briefly describe what you need." required></textarea>
            </label>
            <button type="submit" class="btn btn-primary form-button">Send Project Enquiry</button>
            <div class="contact-form-status" aria-live="polite"></div>
          </form>
        </div>
      </div>
    `;

    const form = contactMount.querySelector(".contact-form");
    if (form) {
      bindContactForm(form);
    }
  }

  renderFaqSection(data);
  injectStructuredData(siteKey, data, sharedProjects);
}

function renderProjectCard(project, index) {
  const tags = project.tags.join(" ");
  const projectImage = getProjectImage(project);
  const visual = projectImage
    ? `<div class="project-image"><img src="${projectImage}" alt="${project.title}" loading="lazy"></div>`
    : `
      <div class="project-image project-placeholder-card">
        <div class="project-placeholder">
          <span>${project.placeholder || project.type}</span>
          <strong>${project.title}</strong>
        </div>
      </div>
    `;

  return `
    <div class="project-card" data-aos="fade-up" data-aos-delay="${index * 40}" data-tags="${tags}">
      ${visual}
      <div class="project-content">
        <div class="project-meta">
          <span class="project-badge">${project.type}</span>
          ${project.sourceLabel ? `<span class="project-source">${project.sourceLabel}</span>` : ""}
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${project.note ? `<p class="project-note">${project.note}</p>` : ""}
        <a href="${project.url}" target="_blank" class="project-link">View Reference</a>
      </div>
    </div>
  `;
}

function getProjectsForSite(siteKey) {
  const sharedProjects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];

  return sharedProjects
    .filter((project) => {
      const hasSite = Array.isArray(project.sites) && project.sites.includes(siteKey);
      if (!hasSite) return false;

      if (siteKey === "main") {
        return project.source !== "reference" && !["node", "react"].includes(project.platform);
      }

      return true;
    })
    .map((project) => ({
      title: getProjectTitle(project, siteKey),
      type: getProjectType(project, siteKey),
      description: getProjectSummary(project, siteKey),
      url: project.url,
      image: project.image,
      tags: getProjectTags(project),
      note: getProjectNote(project, siteKey),
      sourceLabel: getProjectSourceLabel(project, siteKey)
    }));
}

function getProjectTitle(project, siteKey) {
  return project.siteCopy?.[siteKey]?.title?.trim() || project.title;
}

function getProjectSummary(project, siteKey) {
  return project.siteCopy?.[siteKey]?.summary?.trim() || project.summary;
}

function getProjectNote(project, siteKey) {
  return project.siteCopy?.[siteKey]?.note?.trim() || project.note;
}

function getProjectSourceLabel(project, siteKey) {
  return project.siteCopy?.[siteKey]?.sourceLabel?.trim() || project.sourceLabel;
}

function getProjectType(project, siteKey) {
  if (siteKey === "marketing") {
    if (project.tags?.includes("seo")) return "SEO Improvement";
    if (project.tags?.includes("marketing")) return "Growth Campaign Support";
    if (project.tags?.includes("ecommerce")) return "Listings & Feed Support";
    if (project.tags?.includes("content")) return "Content Visibility Work";
    return "Marketing Delivery";
  }

  if (siteKey === "work" || siteKey === "main") {
    const workMap = {
      wordpress: "WordPress Website",
      shopify: "Shopify Reference",
      squarespace: "Squarespace Reference",
      webflow: "Webflow Reference",
      laravel: "Laravel Project",
      php: "PHP Case"
    };

    return workMap[project.platform] || formatFilterLabel(project.platform || "Project");
  }

  if (siteKey === "dev") {
    const devMap = {
      wordpress: "Integration Case",
      laravel: "Laravel Platform",
      php: "Backend Case",
      node: "Node.js",
      react: "React"
    };

    return devMap[project.platform] || formatFilterLabel(project.platform || "Project");
  }

  const platformMap = {
    wordpress: "WordPress",
    laravel: "Laravel",
    php: "PHP",
    shopify: "Shopify",
    squarespace: "Squarespace",
    webflow: "Webflow"
  };

  return platformMap[project.platform] || formatFilterLabel(project.platform || "Project");
}

function getProjectTags(project) {
  const baseTags = Array.isArray(project.tags) ? project.tags : [];
  const platformTag = project.platform ? [project.platform] : [];
  const sourceTag = project.source ? [project.source] : [];
  return [...new Set([...baseTags, ...platformTag, ...sourceTag])];
}

function getProjectImage(project) {
  if (project.image) return resolveAssetUrl(project.image);
  return resolveAssetUrl("default.png");
}

function resolveAssetUrl(path) {
  if (!path) return "";
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("/") || path.startsWith("data:")) {
    return path;
  }

  return `${getAssetPath()}${path.replace(/^\.?\//, "")}`;
}

function bindContactForm(form) {
  const status = form.querySelector(".contact-form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const action = `${getAssetPath()}contact.php`;

    if (!formData.get("name") || !formData.get("email") || !formData.get("message")) {
      if (status) status.textContent = "Please fill in your name, email, and project details.";
      return;
    }

    if (status) status.textContent = "Sending your enquiry...";

    try {
      const response = await fetch(action, {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Message could not be sent.");
      }

      form.reset();
      if (status) status.textContent = result.message || "Your message has been sent.";
    } catch (error) {
      if (status) status.textContent = error.message || "Please email admin@holyprofweb.com directly.";
    }
  });
}

function bindProjectFilters(projects) {
  const buttons = document.querySelectorAll(".project-filter-btn");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      window.PORTFOLIO_PROJECT_STATE = {
        projects,
        filter,
        visibleCount: 6
      };
      renderVisibleProjects(projects);
    });
  });

  const showMoreButton = document.getElementById("projectsShowMore");
  if (showMoreButton) {
    showMoreButton.addEventListener("click", () => {
      const currentState = window.PORTFOLIO_PROJECT_STATE || {
        projects,
        filter: "all",
        visibleCount: 6
      };
      currentState.visibleCount += 6;
      window.PORTFOLIO_PROJECT_STATE = currentState;
      renderVisibleProjects(projects);
    });
  }
}

function renderVisibleProjects(projects) {
  const state = window.PORTFOLIO_PROJECT_STATE || {
    projects,
    filter: "all",
    visibleCount: 6
  };
  const grid = document.getElementById("portfolioProjectGrid");
  const showMoreButton = document.getElementById("projectsShowMore");
  if (!grid) return;

  const filteredProjects = projects.filter((project) => state.filter === "all" || project.tags.includes(state.filter));
  const visibleProjects = filteredProjects.slice(0, state.visibleCount);

  grid.innerHTML = visibleProjects.map((project, index) => renderProjectCard(project, index)).join("");

  if (showMoreButton) {
    showMoreButton.style.display = filteredProjects.length > visibleProjects.length ? "inline-flex" : "none";
  }

  window.PORTFOLIO_PROJECT_STATE = state;
}

function formatFilterLabel(value) {
  const map = {
    all: "All",
    wordpress: "WordPress",
    laravel: "Laravel",
    php: "PHP",
    support: "Support",
    ecommerce: "eCommerce",
    "my-work": "My Work",
    upwork: "Upwork",
    "my-work": "My Work",
      "portfolio-case": "Portfolio Case",
    shopify: "Shopify",
    squarespace: "Squarespace",
    webflow: "Webflow",
    seo: "SEO",
    api: "API",
    react: "React",
    javascript: "JavaScript",
      frontend: "Full Stack",
    content: "Content",
    marketing: "Marketing",
    support: "Support",
    node: "Node.js",
    fixes: "Fixes",
    database: "Database",
    debugging: "Debugging",
    automation: "Automation",
    ecommerce: "eCommerce",
    application: "Application"
  };

  return map[value] || value;
}

function getAssetPath() {
  return window.location.pathname.includes("/work/") ||
    window.location.pathname.includes("/dev/") ||
    window.location.pathname.includes("/marketing/") ||
    window.location.pathname.includes("/tobi/")
    ? "../"
    : "";
}

function renderFaqSection(data) {
  if (!Array.isArray(data.faq) || !data.faq.length) return;

  let faqSection = document.getElementById("faq");
  if (!faqSection) {
    faqSection = document.createElement("section");
    faqSection.className = "faq";
    faqSection.id = "faq";
    faqSection.innerHTML = '<div class="container" id="faqMount"></div>';

    const contactSection = document.getElementById("contact");
    if (contactSection?.parentNode) {
      contactSection.parentNode.insertBefore(faqSection, contactSection);
    }
  }

  const faqMount = document.getElementById("faqMount");
  if (!faqMount) return;

  faqMount.innerHTML = `
    <div class="section-header" data-aos="fade-up">
      <span class="section-tag">${data.faqTag || "Quick Answers"}</span>
      <h2 class="section-title">${data.faqTitle || "Frequently Asked Questions"}</h2>
      <p class="section-subtitle">${data.faqIntro || "Straight answers to the things clients usually ask before we start."}</p>
    </div>
    <div class="faq-list">
      ${data.faq.map((item, index) => `
        <article class="faq-item" data-aos="fade-up" data-aos-delay="${index * 50}">
          <h3>${item.question}</h3>
          <p>${item.answer}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function injectStructuredData(siteKey, data, projects) {
  const existing = document.getElementById("dynamicStructuredData");
  if (existing) existing.remove();

  const urls = {
    main: "https://tobi.holyprofweb.com/",
    tobi: "https://tobi.holyprofweb.com/",
    work: "https://work.holyprofweb.com/",
    dev: "https://dev.holyprofweb.com/",
    marketing: "https://marketing.holyprofweb.com/"
  };

  const pageUrl = urls[siteKey] || urls.main;
  const pageName = document.title;
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || data.hero.description;
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${pageUrl}#website`,
      "url": pageUrl,
      "name": pageName,
      "description": description,
      "publisher": {
        "@type": "Person",
        "name": "Tobi Arowosegbe"
      }
    },
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#page`,
      "url": pageUrl,
      "name": pageName,
      "description": description,
      "isPartOf": {
        "@id": `${pageUrl}#website`
      },
      "about": {
        "@type": "Person",
        "name": "Tobi Arowosegbe"
      }
    },
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#projects`,
      "name": `${pageName} Project List`,
      "itemListElement": projects.slice(0, 10).map((project, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": project.url,
        "name": project.title
      }))
    }
  ];

  if (Array.isArray(data.faq) && data.faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      "mainEntity": data.faq.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
  }

  const script = document.createElement("script");
  script.id = "dynamicStructuredData";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph
  });

  document.head.appendChild(script);
}

