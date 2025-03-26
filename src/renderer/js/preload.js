/**
 * Preload and inject HTML, CSS, and JS into the DOM.
 * @param {string} htmlPath - Path to the HTML file.
 * @param {string} cssPath - Path to the CSS file.
 * @param {string} jsPath - Path to the JS file.
 * @param {function} callback - Optional callback to execute after loading.
 */
function preloadContent(htmlPath, cssPath, jsPath, callback) {
  const appDiv = document.getElementById('app');
  if (!appDiv) {
    console.error('#app not found in index.html');
    return;
  }

  // Clear the #app container before injecting new content
  appDiv.innerHTML = '';

  // Fetch and inject the HTML
  fetch(htmlPath)
    .then(response => response.text())
    .then(htmlContent => {
      appDiv.innerHTML = htmlContent;

      // Inject CSS
      if (cssPath) {
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = cssPath;
        document.head.appendChild(linkEl);
      }

      // Inject JS
      if (jsPath) {
        const scriptEl = document.createElement('script');
        scriptEl.src = jsPath;
        scriptEl.defer = true;
        scriptEl.onload = () => {
          console.log(`${jsPath} loaded successfully.`);
          // Dispatch a custom event or execute a callback
          if (callback) {
            callback();
          } else {
            const event = new Event('partialLoaded');
            document.dispatchEvent(event);
          }
        };
        document.body.appendChild(scriptEl);
      } else if (callback) {
        // If no JS is provided, execute the callback immediately
        callback();
      }
    })
    .catch(err => {
      console.error(`Error loading content from ${htmlPath}:`, err);
      appDiv.textContent = 'Error loading content.';
    });
}