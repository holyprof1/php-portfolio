# Portfolio Admin

This repo now has one shared project source.

## Edit everything from one place

- Edit [projects.js](C:/Users/HP/Downloads/tobi.holyprofweb.com/projects.js)
- Change `image` to set a project image
- Leave `image` empty and the site will use `default.png`
- Change `sites` to choose where the project appears:
  - `main`
  - `tobi`
  - `work`
  - `dev`
  - `marketing`
  - `wordpress-developer`
  - `php-developer`
  - `laravel-developer`
  - `technical-seo`
  - `ecommerce-support`
- Change `tags` to control the filters

## Edit page copy

- Edit [portfolio-data.js](C:/Users/HP/Downloads/tobi.holyprofweb.com/portfolio-data.js)
- Each site has:
  - `hero`
  - `about`
  - `skillCards`
  - `faq`
  - contact copy

## Best long-term admin option

If you want a real admin dashboard, the best next step is:

1. Move `projects.js` and `portfolio-data.js` into JSON files.
2. Add a lightweight admin app to edit those JSON records.
3. Generate the static pages before deploy so SEO stays strong.

That approach is better than client-side localStorage because Google should crawl the final HTML content, not depend on browser-only admin data.
