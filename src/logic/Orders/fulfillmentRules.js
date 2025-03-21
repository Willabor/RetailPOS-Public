/**************************************************************
 * fulfillmentRules.js
 * --------------------------------------
 * Purpose:
 *   Encapsulate the logic for choosing stores for online orders,
 *   preferring fully-owned stores over franchise, handling partial
 *   shipments, etc. 
 *
 * We'll keep these as standalone functions so we can import them
 * wherever needed later.
 **************************************************************/

/*
  1) Example Data Structures
  - We'll assume you have an array of 'stores' with 
    {id, isFranchise, stockByItem: { itemId -> quantity }} 
  - We'll assume you have an 'order' with lineItems that each 
    reference {itemId, quantity}.
*/

// For demonstration, here's a minimal example:
const sampleStores = [
    { id: "GM", isFranchise: false, stockByItem: { 111: 5, 222: 2 } },
    { id: "NM", isFranchise: true,  stockByItem: { 111: 10, 222: 0 } },
  ];
  
  /*
    2) findCandidateStores(itemId, qty, stores)
    --------------------------------------------
    Returns an array of stores that have the item in stock 
    (stockByItem[itemId] >= qty).
  */
  function findCandidateStores(itemId, qty, stores) {
    return stores.filter(store => {
      const stock = store.stockByItem[itemId] || 0;
      return stock >= qty;
    });
  }
  
  /*
    3) pickStoreForItem(itemId, qty, stores)
    --------------------------------------------
    The "choose store" function that:
      - Finds candidate stores
      - Filters to fully-owned vs. franchise
      - Prefers fully-owned if any is available
      - Otherwise picks from franchise
  */
  function pickStoreForItem(itemId, qty, stores) {
    const candidates = findCandidateStores(itemId, qty, stores);
  
    // Separate them into fullyOwned vs. franchise
    const owned = candidates.filter(s => !s.isFranchise);
    const franch = candidates.filter(s => s.isFranchise);
  
    // If there's any fully-owned candidate, pick first or "best"
    if (owned.length > 0) {
      // In real code, you might decide "best" by shipping cost, etc.
      return owned[0];
    } else if (franch.length > 0) {
      return franch[0];
    } else {
      // No store can supply
      return null;
    }
  }
  
  /*
    4) chooseFulfillmentForOrder(order, stores)
    --------------------------------------------
    Example function that loops over each line item, picks a store 
    for each using the pickStoreForItem, then returns an array of 
    assignments like { itemId, quantity, storeId }.
  */
  function chooseFulfillmentForOrder(order, stores) {
    const assignments = [];
  
    for (const line of order.lineItems) {
      const { itemId, quantity } = line;
      const chosenStore = pickStoreForItem(itemId, quantity, stores);
  
      if (chosenStore) {
        assignments.push({
          itemId,
          quantity,
          storeId: chosenStore.id,
        });
      } else {
        assignments.push({
          itemId,
          quantity,
          storeId: null,
          error: "No store found with enough stock",
        });
      }
    }
  
    return assignments;
  }
  
  /*
    You might also add logic for partial shipments, e.g. if a single
    line item requires 5 but only 3 in one store, 2 in another, etc.
    That's more advanced. For now, we keep it simple.
  */
  
  /*
    5) Export these functions
  */
  module.exports = {
    findCandidateStores,
    pickStoreForItem,
    chooseFulfillmentForOrder,
  };
  