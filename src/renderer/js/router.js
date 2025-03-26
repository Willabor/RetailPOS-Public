/***********************************************************
 * router.js
 * ----------------------------------------------------------------------------
 * Manages client-side routing for different "pages" or partials 
 * in your Electron/Web app without a full reload, using window.location.hash.
 ***********************************************************/

const fs = require('fs');
const path = require('path');

/*
  (1) Define the routes object:
      - Each key is a URL hash (like "#/dashboard").
      - Each value is an object with { html, css, js } paths.
*/
const routes = {
  '#/dashboard': {
    html: './src/renderer/html/dashboard.html',
    css:  './src/renderer/styles/dashboard.css',
    js:   './src/renderer/js/dashboard.js'
  },
  '#/inventory': {
    html: './src/renderer/html/inventory.html',
    css:  './src/renderer/styles/inventory.css',
    js:   './src/renderer/js/inventory.js'
  },
  '#/preferences': {
    html: './src/renderer/html/preferences.html',
    css:  './src/renderer/styles/preferences.css',
    js:   './src/renderer/js/preferences.js'
  },
  '#/inventory/importWizard': {
    html: './src/renderer/html/importWizard.html',
    css:  './src/renderer/styles/importWizard.css',
    js:   './src/renderer/js/importWizard.js'
  },
  '#/inventory/itemList': {
    html: './src/renderer/html/itemList.html',
    css:  './src/renderer/styles/itemList.css',
    js:   './src/renderer/js/itemList.js'
  },
  '#/reports': {
    html: './src/renderer/html/reports.html',
    css:  './src/renderer/styles/reports.css',
    js:   './src/renderer/js/reports.js'
  }
};

/*
  (2) loadPartial(htmlPath, cssPath, jsPath):
      - Reads the specified HTML file and injects it into #app.
      - Adds the corresponding CSS and JS for the route.
      - Removes previously injected CSS and JS files.
*/
function loadPartial(htmlPath, cssPath, jsPath) {
  const absoluteHtmlPath = path.resolve(process.cwd(), htmlPath);

  fs.readFile(absoluteHtmlPath, 'utf8', (err, htmlContent) => {
    if (err) {
      console.error(`Error reading ${absoluteHtmlPath}:`, err);
      const appDiv = document.getElementById('app');
      if (appDiv) {
        appDiv.textContent = `Error loading partial: ${err.message}`;
      }
      return;
    }

    const appDiv = document.getElementById('app');
    if (!appDiv) {
      console.error('#app not found in index.html');
      return;
    }
    appDiv.innerHTML = htmlContent;

    // Remove old CSS and inject new
    removeInjectedLinks();
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = cssPath;
    document.head.appendChild(linkEl);

    // Remove old JS and inject new
    removeInjectedScripts();
    const scriptEl = document.createElement('script');
    scriptEl.src = jsPath;
    document.body.appendChild(scriptEl);
  });
}

/*
  (3) removeInjectedLinks() / removeInjectedScripts():
      - Clears out previously injected route-based CSS & JS
        before injecting the new route's files.
*/
function removeInjectedLinks() {
  const allLinks = document.querySelectorAll('head link[href^="./src/renderer/styles/"]');
  allLinks.forEach(link => link.remove());
}

function removeInjectedScripts() {
  const allScripts = document.querySelectorAll('body script[src^="./src/renderer/js/"]');
  allScripts.forEach(script => {
    // If it includes "dbGlobalLists.js", skip removing it
    if (script.src.includes('dbGlobalLists.js')) return;
    script.remove();
  });
}

/*
  (4) handleRouteChange():
      - Checks the current hash.
      - If a matching route exists, loads it.
      - If not, defaults to #/dashboard.
*/
function handleRouteChange() {
  const hash = window.location.hash;
  const route = routes[hash];

  if (route) {
    loadPartial(route.html, route.css, route.js);
  } else {
    console.warn(`No route found for: ${hash}, redirecting to #/dashboard.`);
    window.location.hash = '#/dashboard';
  }
}

/*
  (5) On hashchange or initial load, call handleRouteChange()
*/
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.location.hash = '#/dashboard';
  } else {
    handleRouteChange();
  }
});

function loadRoute(route) {
  const routeConfig = routes[route];
  if (!routeConfig) {
    console.error(`Route ${route} not found.`);
    return;
  }

  fetch(routeConfig.html)
    .then((response) => response.text())
    .then((html) => {
      createWindow(route, html); // Inject the content into a new window
    })
    .catch((error) => console.error("Error loading route:", error));
}

window.addEventListener("hashchange", () => {
  const route = window.location.hash;
  loadRoute(route);
});
