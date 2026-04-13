document.addEventListener("DOMContentLoaded", async () => {
  const siteKey = document.body.dataset.portfolioSite || "main";
  await loadPortfolioData();

  window.addEventListener("load", () => {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;

    setTimeout(() => {
      loader.classList.add("hidden");
    }, 1000);
  });

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
  renderSiteNetwork(siteKey);
});

async function loadPortfolioData() {
  const basePath = getAssetPath();

  try {
    const [contentResponse, projectsResponse] = await Promise.all([
      fetch(`${basePath}data/portfolio-content.json`, { cache: "no-store" }),
      fetch(`${basePath}data/projects.json`, { cache: "no-store" })
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
            <img src="${getAssetPath()}me.png" alt="Tobi Arowosegbe - Full Stack PHP Developer">
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
            <div class="contact-links">
              <a href="mailto:tobiarowosegbe@gmail.com" class="btn btn-primary">Send Email</a>
              <a href="https://wa.me/2347036074565" target="_blank" class="btn btn-outline">WhatsApp</a>
              <a href="https://github.com/tobiarowosegbe" target="_blank" class="btn btn-outline">GitHub</a>
            </div>
          </div>
          <form class="contact-form">
            <input type="hidden" name="_subject" value="Portfolio enquiry from holyprofweb.com">
            <div class="form-row">
              <label>
                <span>Name</span>
                <input type="text" name="name" placeholder="Your name">
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" placeholder="your@email.com">
              </label>
            </div>
            <label>
              <span>Project Type</span>
              <input type="text" name="project_type" placeholder="Website build, support, SEO, eCommerce...">
            </label>
            <label>
              <span>Project Details</span>
              <textarea name="message" rows="5" placeholder="Briefly describe what you need."></textarea>
            </label>
            <button type="submit" class="btn btn-primary form-button">Send Project Enquiry</button>
          </form>
        </div>
      </div>
    `;

    const form = contactMount.querySelector(".contact-form");
    if (form) {
      form.setAttribute("action", "mailto:admin@holyprofweb.com");
      form.setAttribute("method", "post");
      form.setAttribute("enctype", "text/plain");
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
      if (siteKey === "main") {
        return project.source !== "reference";
      }

      return Array.isArray(project.sites) && project.sites.includes(siteKey);
    })
    .map((project) => ({
      title: project.title,
      type: getProjectType(project, siteKey),
      description: project.summary,
      url: project.url,
      image: project.image,
      tags: getProjectTags(project),
      note: project.note,
      sourceLabel: project.sourceLabel
    }));
}

function getProjectType(project, siteKey) {
  if (siteKey === "marketing") {
    if (project.tags?.includes("seo")) return "SEO Website";
    if (project.tags?.includes("marketing")) return "Marketing Website";
    if (project.tags?.includes("ecommerce")) return "eCommerce Brand";
    if (project.tags?.includes("content")) return "Content Website";
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
  if (project.image) return project.image;
  return `${getAssetPath()}default.png`;
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
    frontend: "Frontend",
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
      <span class="section-tag">SEO FAQ</span>
      <h2 class="section-title">Frequently Asked Questions</h2>
      <p class="section-subtitle">Extra context for clients and search engines around the work this page targets.</p>
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

function renderSiteNetwork(siteKey) {
  const footerLinkGroups = document.querySelectorAll("[data-site-network]");
  if (!footerLinkGroups.length) return;

  const sites = [
    { key: "tobi", label: "PHP & WordPress", url: "https://tobi.holyprofweb.com/" },
    { key: "work", label: "Freelance work", url: "https://work.holyprofweb.com/" },
    { key: "dev", label: "Development", url: "https://dev.holyprofweb.com/" },
    { key: "marketing", label: "Marketing", url: "https://marketing.holyprofweb.com/" }
  ];

  footerLinkGroups.forEach((group) => {
    const siteLinks = sites
      .map((site) => {
        const currentLabel = site.key === siteKey ? "Current site" : site.label;
        return `<a href="${site.url}" ${site.key === siteKey ? 'aria-current="page"' : ""}>${currentLabel}</a>`;
      })
      .join("");

    group.innerHTML = `${siteLinks}<a href="${getAssetPath()}admin/" rel="nofollow">Admin</a>`;
  });
}
