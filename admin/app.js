const SITE_CONFIG = [
  { key: "main", label: "Main", description: "Broad portfolio and primary homepage." },
  { key: "tobi", label: "Tobi", description: "PHP, WordPress, and Laravel focused page." },
  { key: "work", label: "Work", description: "Freelance and proposal-friendly profile." },
  { key: "dev", label: "Dev", description: "Engineering, APIs, and technical systems page." },
  { key: "marketing", label: "Marketing", description: "SEO, listings, ads, and growth support page." }
];

const dashboardMetrics = document.getElementById("dashboardMetrics");
const siteTabs = document.getElementById("siteTabs");
const siteEditorSummary = document.getElementById("siteEditorSummary");
const siteEditorMount = document.getElementById("siteEditorMount");
const projectList = document.getElementById("projectList");
const projectSearch = document.getElementById("projectSearch");
const addProjectButton = document.getElementById("addProjectButton");
const saveAllButton = document.getElementById("saveAllButton");
const formatAdvancedButton = document.getElementById("formatAdvancedButton");
const contentEditor = document.getElementById("contentEditor");
const projectsEditor = document.getElementById("projectsEditor");
const adminStatus = document.getElementById("adminStatus");
const adminQuickSearch = document.getElementById("adminQuickSearch");

const state = {
  content: {},
  projects: [],
  activeSite: "main",
  projectSearch: "",
  sessionPassword: ""
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadAdminData();
  bindAdminActions();
  renderAll();
});

async function loadAdminData() {
  const [contentResponse, projectsResponse] = await Promise.all([
    fetch("../data/portfolio-content.json", { cache: "no-store" }),
    fetch("../data/projects.json", { cache: "no-store" })
  ]);

  state.content = await contentResponse.json();
  state.projects = await projectsResponse.json();
  syncAdvancedEditors();
}

function bindAdminActions() {
  saveAllButton.addEventListener("click", saveAllChanges);

  addProjectButton.addEventListener("click", () => {
    state.projects.unshift(createEmptyProject());
    renderProjectList();
    renderDashboardMetrics();
    syncAdvancedEditors();
    setStatus("New project added. Fill in the details and save.");
  });

  formatAdvancedButton.addEventListener("click", () => {
    try {
      state.content = JSON.parse(contentEditor.value);
      state.projects = JSON.parse(projectsEditor.value);
      syncAdvancedEditors();
      renderAll();
      setStatus("Advanced JSON formatted and reloaded.");
    } catch (error) {
      setStatus(`JSON error: ${error.message}`, true);
    }
  });

  projectSearch.addEventListener("input", (event) => {
    state.projectSearch = event.target.value.trim().toLowerCase();
    renderProjectList();
  });

  if (adminQuickSearch) {
    adminQuickSearch.addEventListener("input", (event) => {
      state.projectSearch = event.target.value.trim().toLowerCase();
      projectSearch.value = event.target.value;
      renderProjectList();

      if (state.projectSearch) {
        document.getElementById("cardProjects")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

function renderAll() {
  renderDashboardMetrics();
  renderSiteTabs();
  renderSiteEditor();
  renderProjectList();
  syncAdvancedEditors();
}

function renderDashboardMetrics() {
  const totalProjects = state.projects.length;
  const siteCount = SITE_CONFIG.length;
  const marketingProjects = state.projects.filter((project) => Array.isArray(project.sites) && project.sites.includes("marketing")).length;
  const customImages = state.projects.filter((project) => Boolean(project.image)).length
    + SITE_CONFIG.filter((site) => Boolean(state.content?.[site.key]?.about?.image)).length;

  dashboardMetrics.innerHTML = [
    { label: "Total projects", value: totalProjects },
    { label: "Managed sites", value: siteCount },
    { label: "Marketing proof items", value: marketingProjects },
    { label: "Custom images set", value: customImages }
  ].map((metric) => `
    <article class="dashboard-card">
      <span>${metric.label}</span>
      <strong>${metric.value}</strong>
    </article>
  `).join("");
}

function renderSiteTabs() {
  siteTabs.innerHTML = SITE_CONFIG.map((site) => `
    <button
      type="button"
      class="site-tab ${site.key === state.activeSite ? "active" : ""}"
      data-site-tab="${site.key}"
    >
      ${site.label}
    </button>
  `).join("");

  siteTabs.querySelectorAll("[data-site-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeSite = button.dataset.siteTab;
      renderSiteTabs();
      renderSiteEditor();
    });
  });
}

function renderSiteEditor() {
  const site = state.content[state.activeSite];
  const siteMeta = SITE_CONFIG.find((entry) => entry.key === state.activeSite);

  siteEditorSummary.innerHTML = `
    <div>
      <strong>${siteMeta.label}</strong>
      <p>${siteMeta.description}</p>
    </div>
    <div class="site-summary-meta">
      <span>${(site.filters || []).length} project filters</span>
      <span>${(site.faq || []).length} FAQs</span>
      <span>${countProjectsForSite(state.activeSite)} linked projects</span>
    </div>
  `;

  siteEditorMount.innerHTML = `
    <div class="editor-grid">
      <section class="editor-panel">
        <div class="panel-head">
          <span class="section-eyebrow">Hero</span>
          <h4>Intro copy</h4>
        </div>
        ${renderField("Tag", "hero.tag", site.hero.tag)}
        ${renderField("Title", "hero.title", site.hero.title)}
        ${renderTextarea("Description", "hero.description", site.hero.description, 3)}
        ${renderTextarea("Typed lines", "hero.typed", arrayToLines(site.hero.typed), 4, "One line per rotating text")}
        ${renderField("Primary CTA label", "hero.primary.label", site.hero.primary.label)}
        ${renderField("Primary CTA href", "hero.primary.href", site.hero.primary.href)}
        ${renderField("Secondary CTA label", "hero.secondary.label", site.hero.secondary.label)}
        ${renderField("Secondary CTA href", "hero.secondary.href", site.hero.secondary.href)}
        ${renderTextarea("Hero stats", "hero.stats", statsToLines(site.hero.stats), 4, "Use: value | label")}
      </section>

      <section class="editor-panel">
        <div class="panel-head">
          <span class="section-eyebrow">About</span>
          <h4>Story and image</h4>
        </div>
        ${renderField("Section title", "about.title", site.about.title)}
        ${renderTextarea("Subtitle", "about.subtitle", site.about.subtitle, 3)}
        ${renderField("Heading", "about.heading", site.about.heading)}
        ${renderTextarea("Paragraphs", "about.paragraphs", arrayToLines(site.about.paragraphs), 6, "One paragraph per line")}
        ${renderAssetField("About image", "about.image", site.about.image || "")}
        ${renderTextarea("Highlights", "about.highlights", highlightsToLines(site.about.highlights), 5, "Use: icon | title | text")}
      </section>

      <section class="editor-panel">
        <div class="panel-head">
          <span class="section-eyebrow">Skills</span>
          <h4>Service blocks</h4>
        </div>
        ${renderField("Skills title", "skillsTitle", site.skillsTitle)}
        ${renderTextarea("Skills intro", "skillsIntro", site.skillsIntro, 3)}
        ${renderTextarea("Skill cards", "skillCards", skillCardsToLines(site.skillCards), 6, "Use: title | text")}
      </section>

      <section class="editor-panel">
        <div class="panel-head">
          <span class="section-eyebrow">Projects</span>
          <h4>Portfolio section copy</h4>
        </div>
        ${renderField("Projects title", "projectsTitle", site.projectsTitle)}
        ${renderTextarea("Projects intro", "projectsIntro", site.projectsIntro, 3)}
        ${renderField("Filters", "filters", (site.filters || []).join(", "), "Comma separated")}
      </section>

      <section class="editor-panel">
        <div class="panel-head">
          <span class="section-eyebrow">Contact</span>
          <h4>Closing pitch</h4>
        </div>
        ${renderField("Contact title", "contactTitle", site.contactTitle)}
        ${renderTextarea("Contact text", "contactText", site.contactText, 4)}
      </section>

      <section class="editor-panel">
        <div class="panel-head">
          <span class="section-eyebrow">FAQ</span>
          <h4>Questions clients actually ask</h4>
        </div>
        ${renderField("FAQ tag", "faqTag", site.faqTag || "")}
        ${renderField("FAQ title", "faqTitle", site.faqTitle || "Frequently Asked Questions")}
        ${renderTextarea("FAQ intro", "faqIntro", site.faqIntro || "", 3)}
        ${renderTextarea("FAQ items", "faq", faqToLines(site.faq), 8, "Use: question | answer")}
      </section>
    </div>
  `;

  bindSiteEditor();
}

function bindSiteEditor() {
  siteEditorMount.querySelectorAll("[data-site-path]").forEach((field) => {
    const path = field.dataset.sitePath;

    field.addEventListener("input", () => {
      updateSitePath(path, normalizeSiteFieldValue(path, field.value));
      syncAdvancedEditors();
    });
  });

  siteEditorMount.querySelectorAll(".asset-upload-input").forEach((input) => {
    input.addEventListener("change", async () => {
      if (!input.files?.length) return;
      await handleAssetUpload(input.files[0], input.dataset.sitePath, null);
      input.value = "";
    });
  });
}

function renderProjectList() {
  const projects = getFilteredProjects();

  if (!projects.length) {
    projectList.innerHTML = '<p class="empty-state">No projects match this search yet.</p>';
    return;
  }

  projectList.innerHTML = projects.map(({ project, index }) => `
    <article class="project-editor-card" data-project-index="${index}">
      <div class="project-editor-header">
        <div>
          <h4 class="project-editor-title">${escapeHtml(project.title || `Project ${index + 1}`)}</h4>
          <p class="project-editor-subtitle">${escapeHtml(project.platform || "No platform yet")} ${project.source ? `• ${escapeHtml(project.source)}` : ""}</p>
        </div>
        <button type="button" class="danger-button remove-project-button" data-project-remove="${index}">Remove</button>
      </div>

      <div class="project-editor-grid">
        ${renderProjectField("Title", "title", project.title, index)}
        ${renderProjectField("URL", "url", project.url, index)}
        ${renderProjectField("Platform", "platform", project.platform, index, "wordpress, php, laravel...")}
        ${renderProjectField("Source", "source", project.source, index, "my-work, upwork, reference")}
        ${renderProjectField("Source label", "sourceLabel", project.sourceLabel, index)}
        ${renderProjectField("Tags", "tags", (project.tags || []).join(", "), index, "Comma separated")}
      </div>

      ${renderProjectAssetField(index, project.image || "")}
      <details class="project-optional-copy">
        <summary>Optional custom wording</summary>
        <div class="project-optional-copy-body">
          ${renderProjectTextarea("Custom summary", "summary", project.summary, index, 3)}
          ${renderProjectTextarea("Custom note", "note", project.note, index, 2)}
        </div>
      </details>

      <div class="checkbox-group project-sites" data-project-sites="${index}">
        <span>Show on</span>
        ${SITE_CONFIG.map((site) => `
          <label><input type="checkbox" value="${site.key}" ${project.sites?.includes(site.key) ? "checked" : ""}> ${site.label}</label>
        `).join("")}
      </div>
    </article>
  `).join("");

  bindProjectEditors();
}

function bindProjectEditors() {
  projectList.querySelectorAll("[data-project-field]").forEach((field) => {
    field.addEventListener("input", () => {
      const index = Number(field.dataset.projectIndex);
      const name = field.dataset.projectField;
      state.projects[index][name] = normalizeProjectFieldValue(name, field.value);

      if (name === "tags") {
        state.projects[index][name] = commaListToArray(field.value);
      }

      renderDashboardMetrics();
      syncAdvancedEditors();
    });
  });

  projectList.querySelectorAll("[data-project-textarea]").forEach((field) => {
    field.addEventListener("input", () => {
      const index = Number(field.dataset.projectIndex);
      state.projects[index][field.dataset.projectTextarea] = field.value.trim();
      syncAdvancedEditors();
    });
  });

  projectList.querySelectorAll("[data-project-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.projectRemove);
      state.projects.splice(index, 1);
      renderProjectList();
      renderDashboardMetrics();
      syncAdvancedEditors();
    });
  });

  projectList.querySelectorAll("[data-project-sites]").forEach((group) => {
    group.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const index = Number(group.dataset.projectSites);
        state.projects[index].sites = Array.from(group.querySelectorAll('input[type="checkbox"]:checked')).map((item) => item.value);
        renderDashboardMetrics();
        syncAdvancedEditors();
      });
    });
  });

  projectList.querySelectorAll(".project-asset-upload").forEach((input) => {
    input.addEventListener("change", async () => {
      if (!input.files?.length) return;
      await handleAssetUpload(input.files[0], "image", Number(input.dataset.projectIndex));
      input.value = "";
    });
  });

}

function renderField(label, path, value, hint = "") {
  return `
    <label>
      <span>${label}</span>
      <input type="text" data-site-path="${path}" value="${escapeAttribute(value || "")}" placeholder="${escapeAttribute(hint)}">
    </label>
  `;
}

function renderTextarea(label, path, value, rows, hint = "") {
  return `
    <label>
      <span>${label}${hint ? ` <small>${hint}</small>` : ""}</span>
      <textarea rows="${rows}" data-site-path="${path}" placeholder="${escapeAttribute(hint)}">${escapeHtml(value || "")}</textarea>
    </label>
  `;
}

function renderAssetField(label, path, value) {
  return `
    <div class="asset-field">
      <label>
        <span>${label}</span>
        <input type="text" data-site-path="${path}" value="${escapeAttribute(value)}" placeholder="images/uploads/example.png">
      </label>
      <div class="asset-row">
        <label class="upload-button">
          <input type="file" accept="image/*" class="asset-upload-input" data-site-path="${path}">
          Upload image
        </label>
        <a class="asset-link" href="${getPreviewHref(value)}" target="_blank" rel="noopener">Open file</a>
      </div>
      <div class="asset-preview">${value ? `<img src="${getPreviewHref(value)}" alt="Preview">` : '<span>No image selected yet.</span>'}</div>
    </div>
  `;
}

function renderProjectField(label, name, value, index, hint = "") {
  return `
    <label>
      <span>${label}</span>
      <input
        type="text"
        data-project-field="${name}"
        data-project-index="${index}"
        value="${escapeAttribute(value || "")}"
        placeholder="${escapeAttribute(hint)}"
      >
    </label>
  `;
}

function renderProjectTextarea(label, name, value, index, rows) {
  return `
    <label>
      <span>${label}</span>
      <textarea rows="${rows}" data-project-textarea="${name}" data-project-index="${index}">${escapeHtml(value || "")}</textarea>
    </label>
  `;
}

function renderProjectAssetField(index, value) {
  return `
    <div class="asset-field project-asset">
      <label>
        <span>Project image</span>
        <input type="text" data-project-field="image" data-project-index="${index}" value="${escapeAttribute(value)}" placeholder="images/uploads/project.png">
      </label>
      <div class="asset-row">
        <label class="upload-button">
          <input type="file" accept="image/*" class="project-asset-upload" data-project-index="${index}">
          Upload image
        </label>
        <a class="asset-link" href="${getPreviewHref(value)}" target="_blank" rel="noopener">Open file</a>
      </div>
      <div class="asset-preview">${value ? `<img src="${getPreviewHref(value)}" alt="Project preview">` : '<span>Uses the public fallback image when left empty.</span>'}</div>
    </div>
  `;
}

function updateSitePath(path, value) {
  const site = state.content[state.activeSite];

  if (path === "hero.typed" || path === "about.paragraphs") {
    setNestedValue(site, path, linesToArray(value));
    return;
  }

  if (path === "hero.stats") {
    setNestedValue(site, path, linesToStats(value));
    return;
  }

  if (path === "about.highlights") {
    setNestedValue(site, path, linesToHighlights(value));
    return;
  }

  if (path === "skillCards") {
    site.skillCards = linesToSkillCards(value);
    return;
  }

  if (path === "filters") {
    site.filters = commaListToArray(value);
    return;
  }

  if (path === "faq") {
    site.faq = linesToFaq(value);
    return;
  }

  setNestedValue(site, path, value.trim());
}

function setNestedValue(target, path, value) {
  const segments = path.split(".");
  const last = segments.pop();
  const branch = segments.reduce((accumulator, segment) => {
    if (!accumulator[segment] || typeof accumulator[segment] !== "object") {
      accumulator[segment] = {};
    }
    return accumulator[segment];
  }, target);

  branch[last] = value;
}

function getFilteredProjects() {
  return state.projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => {
      if (!state.projectSearch) return true;
      const haystack = [
        project.title,
        project.platform,
        project.source,
        project.summary,
        project.note,
        ...flattenSiteCopy(project.siteCopy),
        ...(project.tags || [])
      ].join(" ").toLowerCase();
      return haystack.includes(state.projectSearch);
    });
}

async function handleAssetUpload(file, path, projectIndex) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const password = await promptForPassword("upload an image");
    if (!password) {
      setStatus("Upload cancelled.");
      return;
    }

    setStatus("Uploading image...");

    const response = await fetch("upload.php", {
      method: "POST",
      headers: {
        "X-Admin-Password": password
      },
      body: formData
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      if (response.status === 403) state.sessionPassword = "";
      throw new Error(result.message || "Upload failed.");
    }

    if (projectIndex === null) {
      updateSitePath(path, result.path);
      renderSiteEditor();
    } else {
      state.projects[projectIndex].image = result.path;
      renderProjectList();
    }

    renderDashboardMetrics();
    syncAdvancedEditors();
    setStatus("Image uploaded and linked.");
  } catch (error) {
    setStatus(error.message.includes("Unexpected token")
      ? "Upload failed. If you are on a static preview server, open the admin on your PHP host instead."
      : error.message, true);
  }
}

async function saveAllChanges() {
  try {
    state.content = JSON.parse(contentEditor.value);
    state.projects = JSON.parse(projectsEditor.value);

    const password = await promptForPassword("save changes");
    if (!password) {
      setStatus("Save cancelled.");
      return;
    }

    const response = await fetch("save.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Password": password
      },
      body: JSON.stringify({
        content: state.content,
        projects: sanitizeProjects(state.projects)
      })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      if (response.status === 403) state.sessionPassword = "";
      throw new Error(result.message || "Save failed.");
    }

    renderAll();
    setStatus("Saved successfully. Public JSON and JS fallbacks are now in sync.");
  } catch (error) {
    setStatus(error.message.includes("Unexpected token")
      ? "Save failed. This admin needs PHP to write files, so use the hosted site or a PHP server."
      : error.message, true);
  }
}

function sanitizeProjects(projects) {
  return projects.map((project) => ({
    title: project.title?.trim() || "",
    url: project.url?.trim() || "",
    platform: project.platform?.trim() || "",
    source: project.source?.trim() || "",
    sourceLabel: project.sourceLabel?.trim() || "",
    summary: project.summary?.trim() || "",
    note: project.note?.trim() || "",
    image: project.image?.trim() || "",
    tags: Array.isArray(project.tags) ? project.tags.filter(Boolean) : [],
    sites: Array.isArray(project.sites) ? project.sites.filter(Boolean) : [],
    siteCopy: sanitizeSiteCopy(project.siteCopy)
  }));
}

async function promptForPassword(action) {
  if (state.sessionPassword) {
    return state.sessionPassword;
  }

  const password = window.prompt(`Enter admin password to ${action}:`);
  if (!password) return "";

  state.sessionPassword = password;
  return password;
}

function syncAdvancedEditors() {
  contentEditor.value = JSON.stringify(state.content, null, 2);
  projectsEditor.value = JSON.stringify(state.projects, null, 2);
}

function createEmptyProject() {
  return {
    title: "",
    url: "",
    platform: "",
    source: "",
    sourceLabel: "",
    summary: "",
    note: "",
    image: "",
    tags: [],
    sites: ["main"],
    siteCopy: {}
  };
}

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project || createEmptyProject()));
}

function sanitizeSiteCopy(siteCopy) {
  if (!siteCopy || typeof siteCopy !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(siteCopy)
      .filter(([siteKey]) => SITE_CONFIG.some((site) => site.key === siteKey))
      .map(([siteKey, copy]) => [siteKey, {
        title: copy?.title?.trim() || "",
        sourceLabel: copy?.sourceLabel?.trim() || "",
        summary: copy?.summary?.trim() || "",
        note: copy?.note?.trim() || ""
      }])
      .map(([siteKey, copy]) => [siteKey, Object.fromEntries(
        Object.entries(copy).filter(([, value]) => Boolean(value))
      )])
      .filter(([, copy]) => Object.keys(copy).length)
  );
}

function flattenSiteCopy(siteCopy) {
  if (!siteCopy || typeof siteCopy !== "object") {
    return [];
  }

  return Object.values(siteCopy).flatMap((copy) => Object.values(copy || {}));
}

function countProjectsForSite(siteKey) {
  return state.projects.filter((project) => Array.isArray(project.sites) && project.sites.includes(siteKey)).length;
}

function normalizeSiteFieldValue(path, value) {
  return path === "filters" ? value : value;
}

function normalizeProjectFieldValue(name, value) {
  return name === "tags" ? value : value.trim();
}

function arrayToLines(items) {
  return Array.isArray(items) ? items.join("\n") : "";
}

function commaListToArray(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function statsToLines(stats) {
  return (stats || []).map((item) => `${item.value || ""} | ${item.label || ""}`).join("\n");
}

function linesToStats(value) {
  return value.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [statValue, ...labelParts] = line.split("|");
      return {
        value: (statValue || "").trim(),
        label: labelParts.join("|").trim()
      };
    });
}

function highlightsToLines(highlights) {
  return (highlights || []).map((item) => `${item.icon || ""} | ${item.title || ""} | ${item.text || ""}`).join("\n");
}

function linesToHighlights(value) {
  return value.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [icon, title, ...textParts] = line.split("|");
      return {
        icon: (icon || "").trim(),
        title: (title || "").trim(),
        text: textParts.join("|").trim()
      };
    });
}

function skillCardsToLines(cards) {
  return (cards || []).map((item) => `${item.title || ""} | ${item.text || ""}`).join("\n");
}

function linesToSkillCards(value) {
  return value.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...textParts] = line.split("|");
      return {
        title: (title || "").trim(),
        text: textParts.join("|").trim()
      };
    });
}

function faqToLines(items) {
  return (items || []).map((item) => `${item.question || ""} | ${item.answer || ""}`).join("\n");
}

function linesToFaq(value) {
  return value.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...answerParts] = line.split("|");
      return {
        question: (question || "").trim(),
        answer: answerParts.join("|").trim()
      };
    });
}

function linesToArray(value) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function getPreviewHref(path) {
  if (!path) return "#";
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("/") || path.startsWith("data:")) {
    return path;
  }

  return `../${path.replace(/^\.?\//, "")}`;
}

function setStatus(message, isError = false) {
  adminStatus.textContent = message;
  adminStatus.classList.toggle("is-error", isError);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
