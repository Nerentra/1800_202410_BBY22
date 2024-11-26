const templates = [];
const bodyLoadQueue = [];

window.addEventListener("DOMContentLoaded", () => {
    bodyLoadQueue.forEach(({ className, template }) => {
    const elem = document.querySelector("." + className);
    elem.innerHTML = template.html;

    if (template.onload) {
      template.onload();
    }
  });
});

/**
 * Inserts an html template into the page.
 *
 * @param {string} className The classname to insert into.
 * @param {string} templateName The filename of the script in /templates.
 */
function addTemplate(className, templateName) {
  const template = templates[templateName];
  const html = template.html;
  if (document.readyState === "complete") {
    const elem = document.querySelector("." + className);
    elem.innerHTML = html;

    if (template.onload) {
      template.onload();
    }
  } else {
    bodyLoadQueue.push({ className, template: template });
  }
}
