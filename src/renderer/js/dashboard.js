document.addEventListener('DOMContentLoaded', () => {
    // Grab references to buttons
    const makeSaleBtn = document.getElementById('btn-make-sale');
    const receiveItemsBtn = document.getElementById('btn-receive-items');
    const itemListBtn = document.getElementById('btn-item-list');
    const customerListBtn = document.getElementById('btn-customer-list');
    const dynamicContent = document.getElementById('dynamic-content');
  
    // Example 1: Make Sale
    if (makeSaleBtn) {
      makeSaleBtn.addEventListener('click', () => {
        dynamicContent.innerHTML = `
          <h2>Make a Sale</h2>
          <p>Sale form / UI goes here.</p>
        `;
      });
    }
  
    // Example 2: Receive Items
    if (receiveItemsBtn) {
      receiveItemsBtn.addEventListener('click', () => {
        dynamicContent.innerHTML = `
          <h2>Receive Items</h2>
          <p>Logic to receive new items would go here.</p>
        `;
      });
    }
  
    // Example 3: Item List
    if (itemListBtn) {
      itemListBtn.addEventListener('click', () => {
        dynamicContent.innerHTML = `
          <h2>Item List</h2>
          <ul>
            <li>Example Item 1</li>
            <li>Example Item 2</li>
            <li>Example Item 3</li>
          </ul>
        `;
      });
    }
  
    // Example 4: Customer List
    if (customerListBtn) {
      customerListBtn.addEventListener('click', () => {
        dynamicContent.innerHTML = `
          <h2>Customer List</h2>
          <p>Placeholder for a customer listing table or UI.</p>
        `;
      });
    }
  
    // Add similar event listeners for other sidebar or nav buttons as needed
  });
  