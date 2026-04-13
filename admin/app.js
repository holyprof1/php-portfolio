const projectList = document.getElementById("projectList");
const contentEditor = document.getElementById("contentEditor");
const addProjectButton = document.getElementById("addProjectButton");
const saveAllButton = document.getElementById("saveAllButton");
const formatContentButton = document.getElementById("formatContentButton");
const adminStatus = document.getElementById("adminStatus");
const projectTemplate = document.getElementById("projectEditorTemplate");

let portfolioContent = {};
let projectEntries = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadAdminData();
  bindAdminActions();
});

async function loadAdminData() {
  const [contentResponse, projectsResponse] = await Promise.all([
    fetch("../data/portfolio-content.json", { cache: "no-store" }),
    fetch("../data/projects.json", { cache: "no-store" })
  ]);

  portfolioContent = await contentResponse.json();
  projectEntries = await projectsResponse.json();

  contentEditor.value = JSON.stringify(portfolioContent, null, 2);
  renderProjectEditors();
}

function bindAdminActions() {
  addProjectButton.addEventListener("click", () => {
    projectEntries.push({
      title: "",
      url: "",
      platform: "",
      source: "",
      sourceLabel: "",
      summary: "",
      note: "",
      image: "",
      tags: [],
      sites: ["main"]
    });
    renderProjectEditors();
  });

  formatContentButton.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(contentEditor.value);
      contentEditor.value = JSON.stringify(parsed, null, 2);
      setStatus("Content JSON formatted.");
    } catch (error) {
      setStatus(`Content JSON error: ${error.message}`, true);
    }
  });

  saveAllButton.addEventListener("click", saveAllChanges);
}

function renderProjectEditors() {
  projectList.innerHTML = "";

  projectEntries.forEach((project, index) => {
    const fragment = projectTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".project-editor-card");
    const title = fragment.querySelector(".project-editor-title");
    const removeButton = fragment.querySelector(".remove-project-button");
    title.textContent = project.title || `Project ${index + 1}`;

    card.querySelectorAll("[data-field]").forEach((field) => {
      const fieldName = field.dataset.field;
      if (fieldName === "sites") return;

      if (fieldName === "tags") {
        field.value = Array.isArray(project.tags) ? project.tags.join(", ") : "";
      } else {
        field.value = project[fieldName] || "";
      }

      field.addEventListener("input", () => {
        if (fieldName === "tags") {
          projectEntries[index].tags = field.value.split(",").map((item) => item.trim()).filter(Boolean);
        } else {
          projectEntries[index][fieldName] = field.value.trim();
        }

        if (fieldName === "title") {
          title.textContent = field.value.trim() || `Project ${index + 1}`;
        }
      });
    });

    card.querySelectorAll('[data-field="sites"] input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = Array.isArray(project.sites) && project.sites.includes(checkbox.value);
      checkbox.addEventListener("change", () => {
        const selectedSites = Array.from(card.querySelectorAll('[data-field="sites"] input[type="checkbox"]:checked')).map((item) => item.value);
        projectEntries[index].sites = selectedSites;
      });
    });

    removeButton.addEventListener("click", () => {
      projectEntries.splice(index, 1);
      renderProjectEditors();
    });

    projectList.appendChild(fragment);
  });
}

async function saveAllChanges() {
  try {
    const parsedContent = JSON.parse(contentEditor.value);
    const payload = {
      content: parsedContent,
      projects: sanitizeProjects(projectEntries)
    };

    const response = await fetch("save.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Save failed.");
    }

    portfolioContent = parsedContent;
    projectEntries = payload.projects;
    contentEditor.value = JSON.stringify(parsedContent, null, 2);
    renderProjectEditors();
    setStatus("Saved successfully. JSON and JS files are now in sync.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function sanitizeProjects(projects) {
  return projects.map((project) => ({
    title: project.title || "",
    url: project.url || "",
    platform: project.platform || "",
    source: project.source || "",
    sourceLabel: project.sourceLabel || "",
    summary: project.summary || "",
    note: project.note || "",
    image: project.image || "",
    tags: Array.isArray(project.tags) ? project.tags.filter(Boolean) : [],
    sites: Array.isArray(project.sites) ? project.sites.filter(Boolean) : []
  }));
}

function setStatus(message, isError = false) {
  adminStatus.textContent = message;
  adminStatus.style.color = isError ? "#ffb9b9" : "#9fe8b5";
}
