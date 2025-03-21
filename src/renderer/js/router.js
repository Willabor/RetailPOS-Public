/***********************************************************
 * router.js
 * ----------------------------------------------------------------------------
 * Purpose:
 *   Manages client-side routing for different "pages" or partials in your 
 *   Electron/Web app without a full reload, using window.location.hash.
 *
 * Mechanism:
 *   - We define a `routes` object that maps specific URL hashes (e.g. "#/dashboard")
 *     to the matching HTML, CSS, and JS files.
 *   - When the hash changes (or the page first loads), we check which route
 *     we should load, read that partial's HTML via fs, inject it into #app,
 *     then create <link> and <script> elements for the partial's CSS & JS.
 ***********************************************************/

/*
  (0) Require 'fs' and 'path' because we have nodeIntegration: true in Electron.
      We'll use these to read local HTML files from disk (instead of fetch()).
*/
const fs = require('fs');
const path = require('path');

/*
  (1) Define the routes object:

  Each key is a URL hash (like "#/dashboard", "#/inventory", "#/importExport"), 
  and each value is an object specifying:
    html: path to the partial HTML file,
    css:  path to its CSS,
    js:   path to its JS code.

  For example, going to "#/inventory" loads:
    - html: './src/renderer/HTML/inventory.html'
    - css:  './src/renderer/STYLES/inventory.css'
    - js:   './src/renderer/JS/inventory.js'
*/
const routes = {
  '#/dashboard': {
    html: './src/renderer/HTML/dashboard.html',
    css:  './src/renderer/STYLES/dashboard.css',
    js:   './src/renderer/JS/dashboard.js'
  },

  '#/inventory': {
    html: './src/renderer/HTML/inventory.html',
    css:  './src/renderer/STYLES/inventory.css',
    js:   './src/renderer/JS/inventory.js'
  },

  // New route for Preferences
  '#/preferences': {
    html: './src/renderer/HTML/preferences.html',
    css:  './src/renderer/STYLES/preferences.css',
    js:   './src/renderer/JS/preferences.js'
  },

  // Route for Import/Export
  '#/importExport': {
    html: './src/renderer/HTML/importExport.html',
    css:  './src/renderer/STYLES/importExport.css',
    js:   './src/renderer/JS/importExport.js'
  },

  // Example placeholder for future partial (e.g., "Reports"):
  // '#/reports': {
  //   html: './src/renderer/HTML/reports.html',
  //   css:  './src/renderer/STYLES/reports.css',
  //   js:   './src/renderer/JS/reports.js'
  // },
};

/*
  (2) loadPartial(htmlPath, cssPath, jsPath):
      A helper function that reads the specified HTML file from disk,
      injects it into #app, and then appends <link> and <script>
      elements for the partial's CSS & JS.

   Steps:
     2a) Use fs.readFile() to retrieve the HTML file (htmlPath).
     2b) Inject that HTML into the <div id="app"> in index.html.
     2c) Remove any previously injected route-based CSS links, 
         then add <link> to the new partial's CSS file.
     2d) Remove any previously injected route-based <script> tags, 
         then add <script> for the partial's JS.

   NOTE:
     This approach helps ensure we don't accumulate multiple CSS/JS files
     as the user navigates around. If certain CSS/JS is shared across all
     pages, you can load those in index.html itself.
*/
function loadPartial(htmlPath, cssPath, jsPath) {
  // Resolve the absolute path of our partial HTML file based on the current working directory.
  const absoluteHtmlPath = path.resolve(process.cwd(), htmlPath);

  // (2a) Read the partial HTML from disk using Node's fs.readFile.
  fs.readFile(absoluteHtmlPath, 'utf8', (err, htmlContent) => {
    if (err) {
      console.error(`Error reading ${absoluteHtmlPath}:`, err);
      const appDiv = document.getElementById('app');
      if (appDiv) {
        appDiv.textContent = `Error loading partial: ${err.message}`;
      }
      return;
    }

    // (2b) Inject the HTML into the #app container
    const appDiv = document.getElementById('app');
    if (!appDiv) {
      console.error('#app not found in index.html');
      return; // If #app div doesn't exist, stop here
    }
    appDiv.innerHTML = htmlContent;

    // (2c) Remove older route-based CSS links, then create a <link> for the new partial's CSS
    removeInjectedLinks();
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = cssPath; 
    document.head.appendChild(linkEl);

    // (2d) Remove older route-based scripts, then create a <script> for the partial's JS
    removeInjectedScripts();
    const scriptEl = document.createElement('script');
    scriptEl.src = jsPath;
    document.body.appendChild(scriptEl);
  });
}

/*
  (3) removeInjectedLinks() / removeInjectedScripts():
      Helpers to avoid stacking multiple CSS and JS files in the DOM
      when navigating between routes.

      - removeInjectedLinks():
        Removes <link> elements whose href starts with "./src/renderer/STYLES/".
      - removeInjectedScripts():
        Removes <script> elements whose src starts with "./src/renderer/JS/".

      Adjust these patterns if your folder paths differ or if you want certain
      scripts/links to remain loaded across routes.
*/
function removeInjectedLinks() {
  const allLinks = document.querySelectorAll('head link[href^="./src/renderer/STYLES/"]');
  allLinks.forEach(link => link.remove());
}

function removeInjectedScripts() {
  const allScripts = document.querySelectorAll('body script[src^="./src/renderer/JS/"]');
  allScripts.forEach(script => script.remove());
}

/*
  (4) handleRouteChange():
      - Reads the current hash in the URL (e.g. "#/dashboard").
      - Finds the matching route in the `routes` object.
      - Calls loadPartial() with that route's HTML, CSS, and JS paths.
      - If no matching route is found, defaults back to "#/dashboard" or logs a 404.

      This function is called whenever 'hashchange' fires, or if
      we manually invoke it on page load to set an initial route.
*/
function handleRouteChange() {
  const hash = window.location.hash; // e.g., "#/dashboard"
  const route = routes[hash];       // e.g., routes["#/dashboard"]

  if (route) {
    loadPartial(route.html, route.css, route.js);
  } else {
    // No route found for the current hash => fallback to #/dashboard
    console.warn(`No route found for: ${hash}. Redirecting to #/dashboard.`);
    window.location.hash = '#/dashboard';
  }
}

/*
  (5) Setting up event listeners for "hashchange" and "DOMContentLoaded":
      - "hashchange": Fires when window.location.hash changes (via links or code).
      - "DOMContentLoaded": Fires once the initial HTML is loaded and parsed,
                           so we can set our default route if none is specified.
*/
window.addEventListener('hashchange', handleRouteChange);

window.addEventListener('DOMContentLoaded', () => {
  // If there's no hash, set a default route to '#/dashboard'.
  // Otherwise, handle whatever hash is present in the URL on page load.
  if (!window.location.hash) {
    window.location.hash = '#/dashboard';
  } else {
    handleRouteChange();
  }
});
