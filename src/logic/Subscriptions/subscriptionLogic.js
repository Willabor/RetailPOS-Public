/************************************************************
 * subscriptionLogic.js
 * ----------------------------------------------------------
 * Purpose:
 *   Encapsulate logic for:
 *     - storing module definitions (Shopify, Amazon, etc.)
 *     - storing clients (your customers)
 *     - storing "client subscriptions" linking a client to 
 *       specific modules with start/end dates.
 * 
 *   In the future, you can replace these arrays with DB calls.
 ************************************************************/

/*
  Sample data structures for demonstration. 
  Eventually, you'd query your "Modules" table, "Clients" table, 
  and "ClientSubscriptions" table in a real DB.
*/

// 1) Example "Modules" data
let modules = [
    { 
      id: "shopify",
      name: "Shopify Integration",
      description: "Sync with Shopify store.",
      isActive: true,
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2023-01-15T10:30:00Z"
    },
    { 
      id: "amazon",
      name: "Amazon Integration",
      description: "Sync with Amazon listings.",
      isActive: true,
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2023-01-15T10:30:00Z"
    }
  ];
  
  // 2) Example "Clients"
  let clients = [
    {
      id: "CLIENT001",
      name: "MyTestCompany Inc.",
      contactEmail: "info@mytestcompany.com",
      planLevel: "premium",
      isInternal: false,
      createdAt: "2023-01-15T09:00:00Z",
      updatedAt: "2023-01-15T10:15:00Z"
    },
    {
      id: "CLIENT002",
      name: "Internal Usage (Our Own Chain)",
      contactEmail: "devteam@ourcompany.com",
      planLevel: "enterprise",
      isInternal: true,
      createdAt: "2023-01-15T09:00:00Z",
      updatedAt: "2023-01-15T09:00:00Z"
    }
  ];
  
  // 3) Example "ClientSubscriptions"
  let clientSubscriptions = [
    {
      id: "SUB-123",
      clientId: "CLIENT001",
      moduleId: "shopify",
      startDate: "2023-01-15",
      endDate: null, // indefinite or monthly renewal
      isActive: true,
      usageLimit: null,
      usageCount: 0,
      notes: "",
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2023-01-15T10:00:00Z"
    }
  ];
  
  /*
    4) Function: addSubscription(clientId, moduleId, startDate, endDate, notes)
    ------------------------------------------------------------
    Purpose:
      - Adds a new subscription record to the clientSubscriptions array.
      - In a real DB scenario, you'd insert into the table.
  */
  function addSubscription(clientId, moduleId, startDate, endDate, notes = "") {
    // 1) Check if client or module exist
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found.`);
    }
  
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) {
      throw new Error(`Module ${moduleId} not found.`);
    }
  
    // 2) Create the subscription object
    const newSub = {
      id: `SUB-${Math.floor(Math.random() * 100000)}`, // simplistic ID generation
      clientId,
      moduleId,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || null,
      isActive: true,
      usageLimit: null,
      usageCount: 0,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  
    // 3) Push to the array (in production you'd do an INSERT query)
    clientSubscriptions.push(newSub);
  
    return newSub;
  }
  
  /*
    5) Function: isModuleActiveForClient(clientId, moduleId)
    ------------------------------------------------------------
    Purpose:
      - Checks if the client isInternal = true (if so, everything is unlocked).
      - Else, finds if client has an active subscription for the module 
        and it's not expired (if endDate is in the future or null).
  */
  function isModuleActiveForClient(clientId, moduleId) {
    // 1) Check if the client is internal
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      // In a real system, you might return false or throw an error
      return false;
    }
    // If it's your internal usage
    if (client.isInternal) {
      return true;
    }
  
    // 2) Otherwise, look for a matching subscription
    const sub = clientSubscriptions.find(s => 
      s.clientId === clientId &&
      s.moduleId === moduleId &&
      s.isActive
    );
  
    // If no subscription found, or isActive is false, return false
    if (!sub) {
      return false;
    }
  
    // 3) Check endDate
    if (sub.endDate) {
      // if endDate < today => expired
      const now = new Date();
      const end = new Date(sub.endDate);
      if (end.getTime() < now.getTime()) {
        // It's expired
        return false;
      }
    }
  
    // If we reach here, it's valid
    return true;
  }
  
  /*
    6) Function: getActiveModulesForClient(clientId)
    ------------------------------------------------------------
    Purpose:
      - Returns a list of module IDs the client can currently use.
  */
  function getActiveModulesForClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      return []; // or throw an error
    }
  
    // If internal, return ALL active modules
    if (client.isInternal) {
      // Filter out modules that are isActive = false
      return modules
        .filter(m => m.isActive)
        .map(m => m.id);
    }
  
    // For a normal client, gather all modules they have active subscriptions for
    const now = new Date();
    const activeModuleIds = clientSubscriptions
      .filter(s => s.clientId === clientId && s.isActive)
      .filter(s => {
        if (s.endDate) {
          const end = new Date(s.endDate);
          return end.getTime() >= now.getTime(); // not expired
        }
        return true; // if no endDate
      })
      .map(s => s.moduleId);
  
    // Potentially also check if the module itself is active
    const result = activeModuleIds.filter(moduleId => {
      const mod = modules.find(m => m.id === moduleId);
      return mod && mod.isActive;
    });
  
    return result;
  }
  
  /************************************************************
   * Exports
   ************************************************************/
  module.exports = {
    // Demo data (so you can manipulate them if you want)
    modules,
    clients,
    clientSubscriptions,
  
    // Core functions
    addSubscription,
    isModuleActiveForClient,
    getActiveModulesForClient
  };
  