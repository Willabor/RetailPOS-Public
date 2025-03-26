document.addEventListener('DOMContentLoaded', () => {
  // Grab reference to the dynamic content container
  const dynamicContent = document.getElementById('dynamic-content');
  if (!dynamicContent) {
    console.error('Error: #dynamic-content element not found.');
    return;
  }

  // Grab reference to the navigation grid
  const navGrid = document.querySelector('.nav-grid');
  if (!navGrid) {
    console.error('Error: .nav-grid element not found.');
    return;
  }

  /**
   * handleButtonClick(event)
   * ------------------------------------------------------------
   * Handles button clicks in the navigation grid and updates
   * the #dynamic-content section with relevant content.
   * 
   * Notes:
   * - Uses the button's ID to determine which content to display.
   */
  function handleButtonClick(event) {
    const button = event.target.closest('.nav-section');
    if (!button) return; // Ignore clicks outside buttons

    switch (button.id) {
      case 'btn-make-sale-main':
        dynamicContent.innerHTML = `
          <h2>Make a Sale</h2>
          <p>Sale form / UI goes here.</p>
        `;
        break;

      case 'btn-receive-items':
        dynamicContent.innerHTML = `
          <h2>Receive Items</h2>
          <p>Logic to receive new items would go here.</p>
        `;
        break;

      case 'btn-item-list':
        dynamicContent.innerHTML = `
          <h2>Item List</h2>
          <ul>
            <li>Example Item 1</li>
            <li>Example Item 2</li>
            <li>Example Item 3</li>
          </ul>
        `;
        break;

      case 'btn-customer-list-main':
        dynamicContent.innerHTML = `
          <h2>Customer List</h2>
          <p>Placeholder for a customer listing table or UI.</p>
        `;
        break;

      default:
        console.warn(`No handler defined for button ID: ${button.id}`);
    }
  }

  // Add a delegated event listener to the navigation grid
  navGrid.addEventListener('click', handleButtonClick);
});
