document.addEventListener("DOMContentLoaded", () => {
  const windowContainer = document.getElementById("window-container");
  const minimizedWindows = document.getElementById("minimized-windows");

  // Function to create a new window
  function createWindow(title, route) {
    const windowElement = document.createElement("div");
    windowElement.className = "window";

    // Window header
    const header = document.createElement("div");
    header.className = "window-header";
    header.innerHTML = `
      <span>${title}</span>
      <div>
        <button class="minimize">_</button>
        <button class="maximize">[ ]</button>
        <button class="close">X</button>
      </div>
    `;

    // Window content
    const contentElement = document.createElement("div");
    contentElement.className = "window-content";

    // Use the router to load the content
    loadRoute(route, contentElement);

    // Append header and content to the window
    windowElement.appendChild(header);
    windowElement.appendChild(contentElement);

    // Add the window to the container
    windowContainer.appendChild(windowElement);

    // Add event listeners for minimize, maximize, and close buttons
    header.querySelector(".minimize").addEventListener("click", () => {
      windowElement.style.display = "none";
    });

    header.querySelector(".maximize").addEventListener("click", () => {
      if (windowElement.classList.contains("maximized")) {
        windowElement.style.width = "600px";
        windowElement.style.height = "400px";
        windowElement.style.top = "";
        windowElement.style.left = "";
        windowElement.classList.remove("maximized");
      } else {
        windowElement.style.width = "100%";
        windowElement.style.height = "100%";
        windowElement.style.top = "0";
        windowElement.style.left = "0";
        windowElement.classList.add("maximized");
      }
    });

    header.querySelector(".close").addEventListener("click", () => {
      windowContainer.removeChild(windowElement);
    });
  }

  // Function to minimize a window
  function minimizeWindow(windowElement, title) {
    windowContainer.removeChild(windowElement);

    const minimizedWindow = document.createElement("div");
    minimizedWindow.className = "minimized-window";
    minimizedWindow.textContent = title;

    minimizedWindow.addEventListener("click", () => {
      windowContainer.appendChild(windowElement);
      minimizedWindows.removeChild(minimizedWindow);
    });

    minimizedWindows.appendChild(minimizedWindow);
  }

  // Function to make a window draggable
  function makeWindowDraggable(windowElement, header) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("mousedown", (event) => {
      isDragging = true;
      offsetX = event.clientX - windowElement.offsetLeft;
      offsetY = event.clientY - windowElement.offsetTop;
      header.style.cursor = "grabbing";

      // Add mousemove listener to track dragging
      document.addEventListener("mousemove", onMouseMove);
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = "grab";

        // Remove mousemove listener when dragging stops
        document.removeEventListener("mousemove", onMouseMove);
      }
    });

    function onMouseMove(event) {
      if (isDragging) {
        const newX = event.clientX - offsetX;
        const newY = event.clientY - offsetY;

        // Update window position
        windowElement.style.left = `${newX}px`;
        windowElement.style.top = `${newY}px`;
      }
    }
  }

  // Function to toggle maximize/restore a window
  function toggleMaximizeWindow(windowElement) {
    if (windowElement.classList.contains("maximized")) {
      // Restore to normal size
      windowElement.style.width = "600px";
      windowElement.style.height = "400px";
      windowElement.style.top = "";
      windowElement.style.left = "";
      windowElement.classList.remove("maximized");
    } else {
      // Maximize the window
      windowElement.style.width = "100%";
      windowElement.style.height = "100%";
      windowElement.style.top = "0";
      windowElement.style.left = "0";
      windowElement.classList.add("maximized");
    }
  }

  // Example: Open a window when a navigation item is clicked
  document.querySelectorAll(".nav-item").forEach((navItem) => {
    navItem.addEventListener("click", (event) => {
      const route = event.target.textContent;
      createWindow(route, `<p>Content for ${route}</p>`);
    });
  });

  // Add event listeners for buttons
  const inventoryButton = document.getElementById("btn-inventory");
  const customerOrdersButton = document.getElementById("btn-customer-orders");

  if (inventoryButton) {
    inventoryButton.addEventListener("click", () => {
      createWindow("Inventory", "/inventory");
    });
  }

  if (customerOrdersButton) {
    customerOrdersButton.addEventListener("click", () => {
      createWindow("Customer Orders", "/customerOrders");
    });
  }
});