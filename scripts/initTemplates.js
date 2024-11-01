const templates = [];
const bodyLoadQueue = [];

window.addEventListener("DOMContentLoaded", () => {
  bodyLoadQueue.forEach((template) => {
    const elem = document.querySelector("." + template.className);
    elem.innerHTML = template.html;
  });
});

/**
 * Inserts an html template into the page.
 *
 * @param {string} className The classname to insert into.
 * @param {string} templateName The filename of the script in /templates.
 */
function addTemplate(className, templateName) {
  const html = templates[templateName];
  if (document.readyState === "complete") {
    const elem = document.querySelector("." + className);
    elem.innerHTML = html;
  } else {
    bodyLoadQueue.push({ className, html });
  }
}

