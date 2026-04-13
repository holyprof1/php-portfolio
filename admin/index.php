<?php
header('X-Robots-Tag: noindex, nofollow', true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <title>Portfolio Admin</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="admin-shell">
    <aside class="admin-sidebar">
      <h1>Portfolio Admin</h1>
      <p>Edit shared projects and content from one place.</p>
      <div class="admin-sidebar-links">
        <a href="../" target="_blank" rel="noopener">Open Main Site</a>
        <a href="../work/" target="_blank" rel="noopener">Open Work</a>
        <a href="../dev/" target="_blank" rel="noopener">Open Dev</a>
        <a href="../marketing/" target="_blank" rel="noopener">Open Marketing</a>
      </div>
      <div class="admin-help">
        <h2>How this works</h2>
        <p>Projects are shared. One project can appear on multiple pages by selecting the site checkboxes.</p>
        <p>If you leave image empty, the site will use <code>default.png</code>.</p>
      </div>
    </aside>

    <section class="admin-main">
      <div class="admin-topbar">
        <div>
          <h2>Shared Data Manager</h2>
          <p>Projects are form-based. Page content is editable as JSON for now.</p>
        </div>
        <button type="button" class="primary-button" id="saveAllButton">Save All Changes</button>
      </div>

      <div class="admin-status" id="adminStatus"></div>

      <section class="admin-card">
        <div class="section-head">
          <h3>Projects</h3>
          <button type="button" class="secondary-button" id="addProjectButton">Add Project</button>
        </div>
        <div id="projectList" class="project-editor-list"></div>
      </section>

      <section class="admin-card">
        <div class="section-head">
          <h3>Page Content JSON</h3>
          <button type="button" class="secondary-button" id="formatContentButton">Format JSON</button>
        </div>
        <textarea id="contentEditor" class="content-editor" spellcheck="false"></textarea>
      </section>
    </section>
  </main>

  <template id="projectEditorTemplate">
    <article class="project-editor-card">
      <div class="project-editor-header">
        <h4 class="project-editor-title">Project</h4>
        <button type="button" class="danger-button remove-project-button">Remove</button>
      </div>
      <div class="project-editor-grid">
        <label>
          <span>Title</span>
          <input data-field="title" type="text">
        </label>
        <label>
          <span>URL</span>
          <input data-field="url" type="url">
        </label>
        <label>
          <span>Platform</span>
          <input data-field="platform" type="text" placeholder="wordpress, shopify, webflow...">
        </label>
        <label>
          <span>Source</span>
          <input data-field="source" type="text" placeholder="my-work, reference, upwork">
        </label>
        <label>
          <span>Source Label</span>
          <input data-field="sourceLabel" type="text">
        </label>
        <label>
          <span>Image</span>
          <input data-field="image" type="text" placeholder="Leave empty for default.png">
        </label>
      </div>
      <label>
        <span>Summary</span>
        <textarea data-field="summary" rows="3"></textarea>
      </label>
      <label>
        <span>Note</span>
        <textarea data-field="note" rows="2"></textarea>
      </label>
      <label>
        <span>Tags</span>
        <input data-field="tags" type="text" placeholder="comma,separated,tags">
      </label>
      <div class="checkbox-group" data-field="sites">
        <span>Show On</span>
        <label><input type="checkbox" value="main"> Main</label>
        <label><input type="checkbox" value="tobi"> Tobi</label>
        <label><input type="checkbox" value="work"> Work</label>
        <label><input type="checkbox" value="dev"> Dev</label>
        <label><input type="checkbox" value="marketing"> Marketing</label>
      </div>
    </article>
  </template>

  <script src="app.js"></script>
</body>
</html>
