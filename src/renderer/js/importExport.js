/*
  src/renderer/importExport.js

  Updated to insert/UPSERT data into your "Item_list" table
  with 91 columns. We require ../../database/db.js to run
  SQL queries directly from the renderer. Ensure nodeIntegration
  is enabled, or switch to an IPC-based approach for production.
*/

/**************************************************************
 * 1) Imports & Global Setup
 * ------------------------------------------------------------
 */

// Require your DB connection. Adjust the path if necessary.
// For example, if 'db.js' is at 'src/database/db.js', 
// from 'src/renderer/' we likely need '../../database/db.js'.
const db = require('../../database/db.js');

// We need Node 'fs' to read/write files, and PapaParse for CSV.
const fs = require('fs');
const Papa = require('papaparse');

// If your Electron version allows using remote dialogs in the renderer:
const { dialog } = require('electron').remote;

// A quick placeholder for any external "Import" button:
document.getElementById('btn-import')?.addEventListener('click', () => {
  console.log('btn-import clicked. Implement file dialog or logic here if needed.');
});

/**************************************************************
 * 2) Define All 91 Columns from "Item_list"
 * ------------------------------------------------------------
 * Adjust if you change your DB schema or if some columns 
 * are unnecessary for import.
 **************************************************************/
const DB_COLUMNS = [
  'item_id',
  'parent_item_id',
  'is_parent',
  'sku',
  'alternate_lookup',
  'item_name',
  'item_description',
  'item_type',
  'attribute',
  'standard_color',
  'size',
  'gender',
  'online_store',
  'for_sale',
  'item_notes',
  'custom_price_1',
  'regular_price',
  'msrp',
  'quantity_on_hand',
  'average_unit_cost',
  'qty_1',
  'qty_2',
  'qty_3',
  'qty_4',
  'qty_5',
  'qty_6',
  'qty_7',
  'reorder_point_1',
  'reorder_point_2',
  'reorder_point_3',
  'reorder_point_4',
  'reorder_point_5',
  'reorder_point_6',
  'reorder_point_7',
  'last_received_date',
  'sold_in_ecommerce',
  'department_code',
  'department_name',
  'vendor_code',
  'vendor_name',
  'upc',
  'base_unit_of_measure',
  'width',
  'height',
  'length',
  'weight',
  'custom_field_1',
  'custom_field_2',
  'custom_field_3',
  'custom_field_4',
  'custom_field_5',
  'manufacturer',
  'serial_tracking',
  'asset_account',
  'cogs_account',
  'income_account',
  'eligible_for_commission',
  'eligible_for_rewards',
  'previous_system_id',
  'qb_listid',
  'po_number',
  'print_tags',
  'sync_to_mobile',
  'tax_code',
  'previous_creation_date',
  'created_date',
  'updated_at',
  'external_sync_id',
  'sync_shopify',
  'sync_amazon',
  'sync_walmart',
  'sync_ebay',
  'sync_etsy',
  'sync_marketplace1',
  'sync_marketplace2',
  'compare_at_price',
  'previous_last_received_date',
  'brief_description',
  'custom_price_2',
  'custom_price_3',
  'custom_price_4',
  'unit_cost',
  'image_url_1',
  'image_url_2',
  'image_url_3',
  'image_url_4',
  'image_url_5',
  'image_url_6',
  'video_url',
  'item_class',
  'available_qty'
];

/**************************************************************
 * 3) CSV Data Variables
 * ------------------------------------------------------------
 * We'll store references to the parsed CSV data (array of row
 * objects) and CSV headers (array of strings) in these variables.
 **************************************************************/
let csvData = [];
let csvHeaders = [];

/**************************************************************
 * 4) Set Up DOM Interaction
 * ------------------------------------------------------------
 * When the window loads, we grab the necessary DOM elements 
 * and add event listeners. This ensures the UI logic is in place.
 **************************************************************/
window.onload = () => {
  const fileInput = document.getElementById('csvFileInput');       
  const parseCsvBtn = document.getElementById('parseCsvBtn');      
  const importDataBtn = document.getElementById('importDataBtn');  
  const mappingTableBody = document.querySelector('#mappingTable tbody');
  const backupCheckbox = document.getElementById('backupBeforeImport');

  const exportDataTypeSelect = document.getElementById('exportDataType');
  const exportDataBtn = document.getElementById('exportDataBtn');

  /**************************************************************
   * PARSE CSV BUTTON
   **************************************************************/
  parseCsvBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a CSV file first.');
      return;
    }

    try {
      const fileContent = await readFileAsync(file);
      const results = Papa.parse(fileContent, { header: true });

      csvData = results.data;        
      csvHeaders = results.meta.fields;

      // Build the mapping table, one row per DB column (91 total).
      buildMappingTable(mappingTableBody, DB_COLUMNS, csvHeaders);
      importDataBtn.disabled = false;
    } catch (error) {
      console.error(error);
      alert('Error parsing CSV file.');
    }
  });

  /**************************************************************
   * IMPORT DATA BUTTON
   **************************************************************/
  importDataBtn.addEventListener('click', async () => {
    try {
      if (backupCheckbox.checked) {
        await backupData();
      }

      // Gather the user-selected CSV->DB column mapping
      const mapping = getMappingFromUI(mappingTableBody);

      await importData(csvData, mapping);
      alert('Data imported successfully!');
    } catch (error) {
      console.error(error);
      alert(`Error importing data: ${error}`);
    }
  });

  /**************************************************************
   * EXPORT DATA BUTTON
   **************************************************************/
  exportDataBtn.addEventListener('click', async () => {
    const dataType = exportDataTypeSelect.value; 
    try {
      const dataToExport = await fetchDataFromDB(dataType);
      const csv = Papa.unparse(dataToExport);

      const savePath = await getSavePath();
      fs.writeFileSync(savePath, csv, 'utf8');
      alert('Data exported successfully!');
    } catch (error) {
      console.error(error);
      alert(`Error exporting data: ${error}`);
    }
  });
};

/**************************************************************
 * 5) Helper Functions for Parsing & UI
 **************************************************************/

/*
  readFileAsync:
  Reads a File object as text, returning a Promise that
  resolves with the file content.
*/
function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsText(file);
  });
}

/*
  buildMappingTable:
  Creates rows in the mapping table, one for each DB column,
  each row containing a <select> for CSV headers.
*/
function buildMappingTable(tbody, dbColumns, csvHeaders) {
  tbody.innerHTML = '';

  dbColumns.forEach(dbCol => {
    const row = document.createElement('tr');

    // First cell: the DB column name
    const dbFieldCell = document.createElement('td');
    dbFieldCell.textContent = dbCol;
    row.appendChild(dbFieldCell);

    // Second cell: a dropdown of CSV headers
    const selectCell = document.createElement('td');
    const select = document.createElement('select');

    csvHeaders.forEach(header => {
      const option = document.createElement('option');
      option.value = header;
      option.textContent = header;
      select.appendChild(option);
    });

    selectCell.appendChild(select);
    row.appendChild(selectCell);
    tbody.appendChild(row);
  });
}

/*
  getMappingFromUI:
  Reads each row in the mapping table, capturing which CSV header
  was chosen for each DB column. Returns an object like:
    { item_id: "Item ID", sku: "SKU", ... }
*/
function getMappingFromUI(tbody) {
  const mapping = {};
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    const dbField = row.cells[0].textContent;
    const selectedCsvHeader = row.cells[1].querySelector('select').value;
    mapping[dbField] = selectedCsvHeader;
  });
  return mapping;
}

/**************************************************************
 * 6) DB & Backup Logic (Placeholder / Example)
 **************************************************************/

/*
  backupData:
  If "Backup before Import" is checked, implement logic to
  export data from "Item_list" or do a full DB dump, etc.
*/
async function backupData() {
  console.log('Backup logic triggered. Implement as needed.');
}

/*
  importData:
  Given CSV rows (csvData) and a mapping object, transform
  each row to match the DB columns, then insert/update the DB.
*/
async function importData(csvData, mapping) {
  console.log('Importing data with mapping', mapping);

  // Build an INSERT ... ON CONFLICT ... DO UPDATE statement
  const insertCols = DB_COLUMNS.join(', ');
  const placeholders = DB_COLUMNS.map((_, idx) => `$${idx + 1}`).join(', ');
  const updateAssignments = DB_COLUMNS.map(col => `${col} = EXCLUDED.${col}`).join(', ');

  const upsertQuery = `
    INSERT INTO "Item_list" (${insertCols})
    VALUES (${placeholders})
    ON CONFLICT (item_id)
    DO UPDATE SET ${updateAssignments};
  `;

  // Loop through each CSV row, build 'values', and run the query
  for (const rowObj of csvData) {
    const values = DB_COLUMNS.map(dbCol => {
      const csvHeader = mapping[dbCol];
      const rawValue = rowObj[csvHeader];
      return transformValue(rawValue, dbCol); // convert booleans, numbers, dates, etc.
    });

    try {
      await db.query(upsertQuery, values);
    } catch (err) {
      console.error(`Error inserting/updating row (item_id=${values[0]}):`, err);
    }
  }

  console.log('Import process complete.');
}

/*
  fetchDataFromDB:
  For exporting data. Replace with real DB queries as needed.
*/
async function fetchDataFromDB(dataType) {
  console.log(`Fetching data for type: ${dataType}`);

  if (dataType === 'items') {
    try {
      // Return all items from "Item_list"
      const result = await db.query(`SELECT * FROM "Item_list"`);
      return result.rows;
    } catch (err) {
      console.error('Error fetching items:', err);
      return [];
    }
  }
  // else if (dataType === 'orders') { ... }

  return [];
}

/*
  getSavePath:
  Opens a "Save As" dialog so the user can choose where to
  save the CSV file. Returns a Promise that resolves with 
  the chosen file path or rejects if canceled.
*/
function getSavePath() {
  return new Promise((resolve, reject) => {
    dialog.showSaveDialog({
      title: 'Save CSV',
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    })
    .then(result => {
      if (result.canceled) {
        reject('User canceled the save dialog');
      } else {
        resolve(result.filePath);
      }
    })
    .catch(err => reject(err));
  });
}

/**************************************************************
 * 7) transformValue:
 * ------------------------------------------------------------
 * If your QuickBooks CSV uses different formats (e.g., booleans 
 * as 'Y'/'N', or numeric strings that need to be parsed), 
 * we handle that here. This is optional, but recommended.
 **************************************************************/
function transformValue(rawValue, dbCol) {
  // Booleans (e.g., 'is_parent', 'online_store', 'for_sale', 'serial_tracking'):
  const boolCols = [
    'is_parent', 'online_store', 'for_sale', 'serial_tracking', 'sold_in_ecommerce'
  ];
  if (boolCols.includes(dbCol)) {
    if (rawValue === 'Y' || rawValue === 'y') return true;
    if (rawValue === 'N' || rawValue === 'n') return false;
    return rawValue === 'true';
  }

  // Numeric columns
  const numericCols = [
    'custom_price_1','regular_price','msrp','quantity_on_hand','average_unit_cost',
    'qty_1','qty_2','qty_3','qty_4','qty_5','qty_6','qty_7',
    'reorder_point_1','reorder_point_2','reorder_point_3','reorder_point_4','reorder_point_5','reorder_point_6','reorder_point_7',
    'width','height','length','weight','compare_at_price','custom_price_2','custom_price_3','custom_price_4','unit_cost','available_qty'
  ];
  if (numericCols.includes(dbCol)) {
    return rawValue ? Number(rawValue) : 0;
  }

  // Date columns
  const dateCols = [
    'last_received_date','previous_creation_date','created_date','updated_at','previous_last_received_date'
  ];
  if (dateCols.includes(dbCol)) {
    return rawValue ? new Date(rawValue) : null;
  }

  // Otherwise, return as-is (string or undefined)
  return rawValue;
}
