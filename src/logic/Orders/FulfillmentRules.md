# Fulfillment Rules Documentation

## File Location

- **Path:** `src/logic/Orders/fulfillmentRules.js`

This file encapsulates the logic for selecting which store fulfills an item or order line, taking into account factors like **franchise vs. fully-owned** stores and inventory stock levels.

---

## Purpose

The **fulfillment rules** determine:

1. **Which store** can supply a given item (or quantity).
2. **How** to prioritize **fully-owned** stores over **franchise** stores, ensuring you only use the franchise location if no other store has stock.
3. Optionally handle partial shipments or multi-store fulfillment, returning an array of assignments for each order line.

By keeping this logic **separate** from the UI or main process, we can:
- **Easily test** it without a running interface.  
- **Reuse** or **modify** the rules as business policies change.  
- Potentially **migrate** it to a server-side environment or microservice later.

---

## Summary of the Rules

### Core Functions

1. **`findCandidateStores(itemId, qty, stores)`**  
   - Filters an array of `stores` to find which ones have at least `qty` in stock for `itemId`.  
   - Returns a list of candidate store objects.

2. **`pickStoreForItem(itemId, qty, stores)`**  
   - Calls `findCandidateStores()` to get potential stores.  
   - Splits them into **fully-owned** (isFranchise = `false`) vs. **franchise** (isFranchise = `true`).  
   - **Prefers** fully-owned stores if available; if none, picks from the franchise list.  
   - Returns either a single store object or `null` if no store can fulfill.

3. **`chooseFulfillmentForOrder(order, stores)`**  
   - Iterates over each `lineItem` in the `order`.  
   - For each line, calls `pickStoreForItem(...)`.  
   - Returns an array of assignment objects (`{ itemId, quantity, storeId }`) representing which store should fulfill each line item.

> **Note**: You can extend this logic to handle multi-store partial allocations (e.g., if a line item of quantity 5 needs 3 from one store and 2 from another).

---

## How to Import / Require in Your Main Code

Wherever you need to use these rules (e.g., in your Electron main process or a server module), you can **import** them:

### **Node-Style Require**

```js
// Example: inside main.js or an order-processing module
const {
  pickStoreForItem,
  chooseFulfillmentForOrder
} = require('../../logic/Orders/fulfillmentRules');

// Then call them as needed:
const selectedStore = pickStoreForItem(111, 2, storeList);
console.log('Fulfill item 111 at store:', selectedStore);

const assignments = chooseFulfillmentForOrder(myOrder, storeList);
console.log('Fulfillment plan:', assignments);

________________________SUPLIMENTRY NOTES________________________

Importing the Module:

Depending on how your project is configured, you’ll use one of the following import styles:

1) CommonJS (Default for Many Node/Electron Apps)
Code:
-------------------------------------------------------------
// In Node.js or Electron without "type":"module":
const { pickStoreForItem, chooseFulfillmentForOrder } = require('../../logic/Orders/fulfillmentRules');

// Then use them:
const chosenStore = pickStoreForItem(111, 2, storeList);
console.log('Store chosen for item 111:', chosenStore);
--------------------------------------------------------------

Use This if your package.json does not have "type": "module" and you’re working with require / module.exports (the default in most Electron apps).
This is also the common approach if you’re using older Node versions or a typical Electron build setup that hasn’t been converted to ESM.

2) ES Modules (If Your Project Uses "type":"module")
Code:
--------------------------------------------------------------
// In Node 14+ or Electron with ESM enabled:
import { pickStoreForItem, chooseFulfillmentForOrder } from '../../logic/Orders/fulfillmentRules.js';

const chosenStore = pickStoreForItem(111, 2, storeList);
console.log('Store chosen for item 111:', chosenStore);
---------------------------------------------------------------

Use This if your package.json has "type":"module", meaning the project is configured for native ES modules.
Also applicable if you’re bundling with Babel/Webpack and using import/export syntax across your codebase.

Which One to Pick?
If you’re using standard Node/Electron without extra ESM config, CommonJS is your safest bet.
If you’ve explicitly moved to ES modules (e.g., "type":"module" in package.json or a modern bundler setup), then the second snippet applies.
Either way, the logic in fulfillmentRules.js remains the same – you’re simply choosing how to load it based on your build environment.

__________________________End_______________________________

Google Sheet Link:
https://docs.google.com/spreadsheets/d/1xrdyVLdciofbfFEksT3QaHXppsDnbbQ5Tzz0s-bjQmg/edit?usp=sharing


Last Updated: {{03/21/2025}}