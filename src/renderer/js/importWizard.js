/************************************************************
 * importWizard.js
 * ----------------------------------------------------------
 * Controls the multi-step "Data Import Wizard" defined in 
 * importWizard.html. Handles step navigation, user input,
 * CSV/XLS parsing, and final DB import logic.
 ************************************************************/
(function() {

  /**
   * (A) Instead of storing the 91 columns here, we reference 
   *     the global array from dbGlobalLists.js. 
   *     E.g.: window.DB_COLUMNS_ITEM
   * 
   *     If your dbGlobalLists.js also exports labels, 
   *     you can reference: window.DB_COLUMN_LABELS_ITEM
   */
  const DB_COLUMNS = window.DB_COLUMNS_ITEM || [];
  // If you want to also reference labels, you can do:
  // const DB_LABELS = window.DB_COLUMN_LABELS_ITEM || {};

  // We'll track the wizard state here (scoped to this IIFE):
  let currentStep = 1;
  const totalSteps = 7;

  // Simple model object to hold user selections:
  const wizardData = {
    importMode: 'addNew',        // Step 1 (Add new / Update existing)
    importType: 'inventory',     // Step 2 (Inventory, Vendors, etc.)
    importMethod: 'defaultTemplate', // Step 3 (Default, Custom File, Vendor Catalog)
    filePath: null,
    sheetName: 'Items List',
    startRow: 2,
    fileMapping: 'defaultInventory',
    duplicateOption: 'prompt',   // Step 5 (How to handle duplicates)
    fallbackDepartment: 'System',
    preview: {
      fileName: '',
      itemCount: 0,
      newItems: 0,
      updatedItems: 0
    },
    backupBeforeImport: true,
    importResults: {
      itemsAddedCount: 0,
      itemsUpdatedCount: 0
    }
  };

  // On DOMContentLoaded, init the wizard and show the first step
  window.addEventListener('DOMContentLoaded', () => {
    initWizard();
    showStep(currentStep);
  });

  function initWizard() {
    // Query all wizard steps
    const steps = document.querySelectorAll('.wizard-step');
    
    // Set up button handlers (Next, Previous, Import, etc.)
    document.querySelectorAll('.btn-next').forEach(btn => {
      btn.addEventListener('click', onNext);
    });

    document.querySelectorAll('.btn-prev').forEach(btn => {
      btn.addEventListener('click', onPrevious);
    });

    const btnCancel = document.querySelectorAll('.btn-cancel');
    btnCancel.forEach(btn => {
      btn.addEventListener('click', onCancel);
    });

    const btnHelp = document.querySelectorAll('.btn-help');
    btnHelp.forEach(btn => {
      btn.addEventListener('click', onHelp);
    });

    const btnImport = document.querySelector('.btn-import');
    if (btnImport) {
      btnImport.addEventListener('click', onImport);
    }

    const btnFinish = document.querySelector('.btn-finish');
    if (btnFinish) {
      btnFinish.addEventListener('click', onFinish);
    }

    const btnManageMappings = document.querySelector('.btn-manage-mappings');
    if (btnManageMappings) {
      btnManageMappings.addEventListener('click', onManageMappings);
    }

    const btnViewIssues = document.querySelector('.btn-view-issues');
    if (btnViewIssues) {
      btnViewIssues.addEventListener('click', onViewIssues);
    }

    const btnViewLog = document.querySelector('.btn-view-log');
    if (btnViewLog) {
      btnViewLog.addEventListener('click', onViewLog);
    }

    // Setup any input listeners for real-time data updates
    setupInputListeners();
  }

  function setupInputListeners() {
    // Step 1: importMode (radio)
    document.querySelectorAll('input[name="importMode"]').forEach(radio => {
      radio.addEventListener('change', e => {
        wizardData.importMode = e.target.value;
      });
    });

    // Step 2: importType (radio)
    document.querySelectorAll('input[name="importType"]').forEach(radio => {
      radio.addEventListener('change', e => {
        wizardData.importType = e.target.value;
      });
    });

    // Step 3: importMethod (radio)
    document.querySelectorAll('input[name="importMethod"]').forEach(radio => {
      radio.addEventListener('change', e => {
        wizardData.importMethod = e.target.value;
      });
    });

    // Step 4: File & mapping
    const importFileInput = document.getElementById('importFile');
    if (importFileInput) {
      importFileInput.addEventListener('change', () => {
        if (importFileInput.files && importFileInput.files.length > 0) {
          wizardData.filePath = importFileInput.files[0];
        }
      });
    }

    const sheetNameInput = document.getElementById('sheetName');
    if (sheetNameInput) {
      sheetNameInput.addEventListener('change', () => {
        wizardData.sheetName = sheetNameInput.value;
      });
    }

    const startRowInput = document.getElementById('startRow');
    if (startRowInput) {
      startRowInput.addEventListener('change', () => {
        wizardData.startRow = parseInt(startRowInput.value, 10) || 1;
      });
    }

    const fileMappingSelect = document.getElementById('fileMapping');
    if (fileMappingSelect) {
      fileMappingSelect.addEventListener('change', () => {
        wizardData.fileMapping = fileMappingSelect.value;
      });
    }

    // Step 5: duplicates & fallback dept
    document.querySelectorAll('input[name="duplicateOption"]').forEach(radio => {
      radio.addEventListener('change', e => {
        wizardData.duplicateOption = e.target.value;
      });
    });

    const fallbackDeptSelect = document.getElementById('fallbackDepartment');
    if (fallbackDeptSelect) {
      fallbackDeptSelect.addEventListener('change', () => {
        wizardData.fallbackDepartment = fallbackDeptSelect.value;
      });
    }

    // Step 6: backupBeforeImport
    const backupCheckbox = document.getElementById('backupBeforeImport');
    if (backupCheckbox) {
      backupCheckbox.addEventListener('change', () => {
        wizardData.backupBeforeImport = backupCheckbox.checked;
      });
    }
  }

  /* 
    (A) Step Navigation 
  */
  function onNext() {
    // Validate current step? (optional)
    // e.g., if (currentStep === 4 && !wizardData.filePath) { alert('Please select a file'); return; }

    // Advance step
    currentStep++;
    if (currentStep > totalSteps) {
      currentStep = totalSteps;
    }

    // If we just finished step 4, maybe parse the file or do partial checks?
    if (currentStep === 5) {
      // parseImportFile();  // optional
    }

    // If we just finished step 5, we might want to do a "preview" step
    if (currentStep === 6) {
      generatePreview();
    }

    showStep(currentStep);
  }

  function onPrevious() {
    currentStep--;
    if (currentStep < 1) {
      currentStep = 1;
    }
    showStep(currentStep);
  }

  function showStep(stepNumber) {
    // Hide all steps
    const allSteps = document.querySelectorAll('.wizard-step');
    allSteps.forEach(stepEl => {
      stepEl.style.display = 'none';
    });

    // Show the desired step
    const targetStep = document.querySelector(`.wizard-step[data-step="${stepNumber}"]`);
    if (targetStep) {
      targetStep.style.display = '';
    }
  }

  function onCancel() {
    // Possibly confirm with the user?
    const confirmCancel = confirm('Are you sure you want to cancel the import wizard?');
    if (confirmCancel) {
      window.location.hash = '#/inventory';
    }
  }

  function onHelp() {
    alert('Help placeholder: Provide import wizard instructions, etc.');
  }

  /*
    (B) Key Steps: 
        - onImport() => Perform actual DB insertion
        - generatePreview() => Summarize items for step 6
  */

  // Step 6: Generate preview data
  function generatePreview() {
    // In a real flow, you'd parse the selected file, compare with DB, etc.
    // For now, let's do placeholders:

    wizardData.preview.fileName   = wizardData.filePath ? wizardData.filePath.name : 'No File Selected';
    wizardData.preview.itemCount  = 96;
    wizardData.preview.newItems   = 0;
    wizardData.preview.updatedItems = 0;

    // Update the DOM
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const itemCountSpan   = document.getElementById('itemCount');
    const newItemsSpan    = document.getElementById('newItems');
    const updatedItemsSpan = document.getElementById('updatedItems');

    if (fileNameDisplay)  fileNameDisplay.textContent  = wizardData.preview.fileName;
    if (itemCountSpan)    itemCountSpan.textContent    = wizardData.preview.itemCount;
    if (newItemsSpan)     newItemsSpan.textContent     = wizardData.preview.newItems;
    if (updatedItemsSpan) updatedItemsSpan.textContent = wizardData.preview.updatedItems;
  }

  // Step 6 -> 7: Actually Import
  async function onImport() {
    // If needed, backup data
    if (wizardData.backupBeforeImport) {
      // await backupData(); // optional
    }

    // Perform the actual DB insertion
    try {
      // parse CSV/XLS (wizardData.filePath)
      // handle duplicates per wizardData.duplicateOption
      // upsert items in DB referencing DB_COLUMNS if needed

      // For demonstration, we just set the result counts:
      wizardData.importResults.itemsAddedCount   = 0;
      wizardData.importResults.itemsUpdatedCount = 0;

      // Move to final step
      currentStep = 7;
      showStep(currentStep);

      // Display results
      document.getElementById('itemsAddedCount').textContent   = wizardData.importResults.itemsAddedCount;
      document.getElementById('itemsUpdatedCount').textContent = wizardData.importResults.itemsUpdatedCount;

    } catch (err) {
      console.error('Import error:', err);
      alert(`Error during import: ${err.message}`);
      // If needed, remain on step 6 to let the user retry
    }
  }

  // Step 7: Finish
  function onFinish() {
    window.location.hash = '#/inventory';
  }

  /*
    (C) Additional button handlers 
  */

  function onManageMappings() {
    alert('Placeholder: open a mapping editor or route to #/mappingManager');
  }

  function onViewIssues() {
    alert('Placeholder: here we would show the problem list from the preview step.');
  }

  function onViewLog() {
    alert('Placeholder: open a log view or console for import events.');
  }

  /*
    (D) (Optional) parseImportFile() if you want to parse earlier 
       Instead of waiting until the final import, you can parse the file 
       as soon as step 4 is done, gather headers, etc. 
  */

  // async function parseImportFile() {
  //   if (!wizardData.filePath) {
  //     alert('No file selected!');
  //     return;
  //   }
  //   // Use Papa.parse or XLSX library
  //   // Save parsed data in wizardData for preview
  // }

  document.addEventListener("DOMContentLoaded", () => {
    const nextButton = document.getElementById("nextButton");
    const form = document.getElementById("importWizardForm");
  
    nextButton.addEventListener("click", () => {
      // Get the selected option
      const selectedOption = form.querySelector('input[name="importOption"]:checked');
  
      if (!selectedOption) {
        alert("Please select an option before proceeding.");
        return;
      }
  
      // Handle the selected option
      if (selectedOption.value === "newData") {
        console.log("User selected: Add new data");
        // Navigate to the next step for adding new data
        loadNextStep("newData");
      } else if (selectedOption.value === "updateData") {
        console.log("User selected: Update existing data");
        // Navigate to the next step for updating existing data
        loadNextStep("updateData");
      }
    });
  
    function loadNextStep(option) {
      // Example logic for loading the next step
      const appDiv = document.getElementById("app");
      if (option === "newData") {
        appDiv.innerHTML = "<h2>Step 2: Add New Data</h2><p>Provide details for new data...</p>";
      } else if (option === "updateData") {
        appDiv.innerHTML = "<h2>Step 2: Update Existing Data</h2><p>Provide details for updating data...</p>";
      }
    }
  });

})();
