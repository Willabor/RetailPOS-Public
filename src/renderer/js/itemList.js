// src/renderer/js/itemList.js
(async function () {
  const columns = window.DB_COLUMNS_ITEM || []; // Column keys
  const labels = window.DB_COLUMN_LABELS_ITEM || {}; // Column labels
  let items = []; // Store fetched items for filtering and rendering

  document.addEventListener('DOMContentLoaded', () => {
    console.log('itemList.js loaded – Populating the item table.');

    // Generate table headers
    generateTableHeaders();

    // Fetch and populate items
    fetchItems();
    setupSearch();
    setupHeaderContextMenu();
  });

  document.addEventListener('partialLoaded', () => {
    console.log('partialLoaded event received – Initializing item list.');

    // Generate table headers
    generateTableHeaders();

    // Fetch and populate items
    fetchItems();
  });

  /**
   * Generates table headers dynamically using DB_COLUMN_LABELS_ITEM.
   */
  function generateTableHeaders() {
    const tableHeaderRow = document.getElementById('tableHeaderRow');
    if (!tableHeaderRow) {
      console.error('Error: Table header row element not found.');
      console.log('Current DOM:', document.body.innerHTML); // Debugging log
      return;
    }

    tableHeaderRow.innerHTML = ''; // Clear existing headers

    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = labels[column] || column; // Use label if available, fallback to column name
      tableHeaderRow.appendChild(th);
    });
  }

  /**
   * Fetches items from the API and populates the table rows.
   */
  async function fetchItems() {
    try {
      console.log('Fetching items from the API...');
      const response = await fetch('http://localhost:4141/api/items');

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      items = await response.json(); // Store items for filtering
      console.log('Fetched items:', items);

      renderTable(items); // Render the table with fetched items
    } catch (error) {
      console.error('Error fetching items:', error);
      document.getElementById('tableInfo').textContent = 'Error loading items.';
    }
  }

  /**
   * Renders the table rows dynamically based on the provided list.
   */
  function renderTable(list) {
    const tbody = document.getElementById('itemTableBody');
    if (!tbody) {
      console.error('Error: Table body element not found.');
      console.log('Current DOM:', document.body.innerHTML); // Debugging log
      return;
    }

    tbody.innerHTML = ''; // Clear existing rows

    list.forEach(item => {
      const row = document.createElement('tr');

      columns.forEach(column => {
        const cell = document.createElement('td');
        cell.textContent = item[column] || 'N/A'; // Use item value or fallback to 'N/A'
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    document.getElementById('tableInfo').textContent = `${list.length} record(s) found`;
  }

  /**
   * Sets up the search functionality to filter table rows.
   */
  function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      const filtered = items.filter(item =>
        columns.some(column => (item[column] || '').toString().toLowerCase().includes(term))
      );
      renderTable(filtered);
    });
  }

  function setupHeaderContextMenu() {
    const tableHeader = document.querySelector('.item-table thead');
    if (!tableHeader) return;

    tableHeader.addEventListener('contextmenu', e => {
      e.preventDefault();
      const menu = document.getElementById('headerMenu');
      menu.style.display = 'block';
      menu.style.left = `${e.pageX}px`;
      menu.style.top = `${e.pageY}px`;
    });

    document.addEventListener('click', () => {
      document.getElementById('headerMenu').style.display = 'none';
    });

    document.getElementById('menuCustomize').addEventListener('click', () => {
      openCustomizeModal();
    });

    document.getElementById('menuAutoWidth').addEventListener('click', () => {
      autoAdjustColumnWidth();
    });
  }

  function openCustomizeModal() {
    const modal = document.getElementById('customizeModal');
    modal.style.display = 'block';

    const container = document.getElementById('columnsList');
    container.innerHTML = '';

    // Make each label draggable for reordering
    columns.forEach((col, idx) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '0.5rem';

      // A "handle" or the label itself for drag
      row.draggable = true; // DRAG & DROP
      row.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', String(idx));
      });
      row.addEventListener('dragover', e => {
        e.preventDefault();
      });
      row.addEventListener('drop', e => {
        e.preventDefault();
        const fromIndex = Number(e.dataTransfer.getData('text/plain'));
        const toIndex = idx;
        // Reorder columns
        const [moved] = columns.splice(fromIndex, 1);
        columns.splice(toIndex, 0, moved);
        // Rebuild checkboxes after reorder
        openCustomizeModal(); // quick approach to refresh the UI
      });

      // Checkbox to show/hide column
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = col.visible;
      cb.addEventListener('change', () => {
        columns[idx].visible = cb.checked;
      });

      const label = document.createElement('label');
      label.textContent = col.label;

      row.appendChild(cb);
      row.appendChild(label);
      container.appendChild(row);
    });

    document.getElementById('saveColumnsBtn').onclick = () => {
      modal.style.display = 'none';
      // PERSIST: user changed columns or order
      saveColumnsToStorage();
      renderTable(items);
    };
  }

  function autoAdjustColumnWidth() {
    const table = document.querySelector('.item-table table');
    table.style.tableLayout = 'auto';
    table.style.width = 'auto';
  }

  /* PERSISTENCE: Save or load columns array in localStorage */
  function saveColumnsToStorage() {
    localStorage.setItem('posColumns', JSON.stringify(columns));
  }
  function loadColumnsFromStorage() {
    const saved = localStorage.getItem('posColumns');
    if (saved) {
      columns = JSON.parse(saved);
    }
  }

  // (Removed the redundant window.onload = fetchItems; because we already call fetchItems() above)

  document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".item-table");

    // Add a double-click event listener to the table
    table.addEventListener("dblclick", (event) => {
      const targetCell = event.target;

      // Ensure the target is a table cell (td)
      if (targetCell.tagName === "TD") {
        console.log("Double-click detected on cell:", targetCell); // Debugging log
        // Get the current value of the cell
        const currentValue = targetCell.textContent.trim();

        // Create an input element for editing
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentValue;
        input.className = "cell-editor";

        // Replace the cell's content with the input field
        targetCell.textContent = "";
        targetCell.appendChild(input);

        // Focus the input field and select the text
        input.focus();
        input.select();

        // Handle saving the value on blur (when the input loses focus)
        input.addEventListener("blur", () => {
          saveCellValue(targetCell, input.value);
        });

        // Handle saving the value on Enter key press
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            saveCellValue(targetCell, input.value);
          }
        });
      }
    });

    // Function to save the updated cell value
    function saveCellValue(cell, newValue) {
      // Update the cell's text content with the new value
      cell.textContent = newValue;

      // Optionally, you can send the updated value to the server or save it locally
      console.log(`Cell updated to: ${newValue}`);
    }
  });
})();
