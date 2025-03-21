/************************************************************
 * orderValidation.js
 * ----------------------------------------------------------
 * Purpose:
 *   Provide functions to validate an "order" object before
 *   running fulfillment logic or saving to the database.
 *
 *   For now, we keep it minimal. You can expand with more
 *   advanced checks (e.g., ensuring item IDs exist in DB).
 ************************************************************/

/**
 * Checks if a given line item is valid:
 *  - itemId is defined
 *  - quantity is a positive integer
 */
function validateLineItem(line) {
    // Basic structure checks
    if (typeof line.itemId === 'undefined' || line.itemId === null) {
      return { valid: false, error: 'Missing itemId in line item.' };
    }
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      return { valid: false, error: 'Quantity must be a positive integer.' };
    }
  
    // Optionally: check if line has extra fields, etc.
  
    return { valid: true, error: null };
  }
  
  /**
   * validateOrderData(order)
   * Ensures:
   *  - 'order' has an 'id' or some identifier
   *  - lineItems is a non-empty array
   *  - each line item passes validateLineItem
   */
  function validateOrderData(order) {
    // 1) Must have an order ID or some unique key
    if (!order.id) {
      return {
        valid: false,
        error: 'Order must have an id or unique identifier.'
      };
    }
  
    // 2) Must have lineItems array
    if (!Array.isArray(order.lineItems) || order.lineItems.length === 0) {
      return {
        valid: false,
        error: 'Order must have a non-empty lineItems array.'
      };
    }
  
    // 3) Validate each line
    for (let i = 0; i < order.lineItems.length; i++) {
      const line = order.lineItems[i];
      const lineCheck = validateLineItem(line);
      if (!lineCheck.valid) {
        return {
          valid: false,
          error: `Line item ${i} invalid: ${lineCheck.error}`
        };
      }
    }
  
    // If we get here, everything looks valid
    return { valid: true, error: null };
  }
  
  /**
   * Exports
   */
  module.exports = {
    validateOrderData
  };
  