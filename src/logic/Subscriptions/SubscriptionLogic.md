# Subscription Logic Overview

We maintain three tables to handle which modules each client has access to:

1. **Modules**  
   - A master list of available modules (e.g. "ShopifyIntegration", "AmazonIntegration", "AdvancedReports").

2. **Clients**  
   - Identifies each paying (or internal) entity.  
   - The `isInternal` flag can mark our own chain of stores for unlimited, free module usage if needed.

3. **ClientSubscriptions**  
   - Links a given `clientId` to a specific `moduleId`.  
   - Tracks start/end dates, usage limits, etc.

## Table Schemas (Google Sheets Format)

### A) `Modules`

| Field       | Type       | Notes                                        |
|-------------|-----------|----------------------------------------------|
| id          | string     | e.g. "shopify", "amazon", "reports-adv"     |
| name        | string     | "Shopify Integration", "Amazon Integration" |
| description | text       | Short or extended description               |
| isActive    | boolean    | If this module is currently available       |
| createdAt   | timestamp  |                                             
| updatedAt   | timestamp  |                                             

### B) `Clients`

| Field       | Type       | Notes                                       |
|-------------|-----------|---------------------------------------------|
| id          | string     | e.g. "CLIENT001"                            |
| name        | string     | e.g. "MyTestCompany Inc."                   |
| contactEmail| string     | Optional, for billing or contact            |
| planLevel   | string     | "free", "premium", "enterprise", etc.       |
| isInternal  | boolean    | If true, we allow free usage of all modules |
| createdAt   | timestamp  |                                            
| updatedAt   | timestamp  |                                            

### C) `ClientSubscriptions`

| Field       | Type       | Notes                                                      |
|-------------|-----------|------------------------------------------------------------|
| id          | string     | optional row ID or PK                                      |
| clientId    | string     | references Clients.id                                      |
| moduleId    | string     | references Modules.id                                      |
| startDate   | date/time  | subscription start                                         |
| endDate     | date/time  | subscription end or null if indefinite                    |
| isActive    | boolean    | could be derived from current date vs. endDate            |
| usageLimit  | int        | optional usage cap (per month or total)                   |
| usageCount  | int        | track used so far                                         |
| notes       | text       | any custom comment                                        |
| createdAt   | timestamp  |                                                           |
| updatedAt   | timestamp  |                                                           |

## How It Works
- **During app init**: The POS checks `ClientSubscriptions` to see which modules `clientId` is subscribed to and not expired.  
- **If a module** is inactive or ended, that integration feature is disabled in the UI.  
- **Internal usage** can bypass all checks if `isInternal = true`.  

## Future Enhancements
- **Billing**: Keep track of usage-based fees or monthly rates.  
- **Module Bundles**: If planLevel = "premium", automatically enable certain modules.  
- **Trial Period**: `startDate` vs. `trialEndDate` columns.

Google Sheet Link:
https://docs.google.com/spreadsheets/d/1xrdyVLdciofbfFEksT3QaHXppsDnbbQ5Tzz0s-bjQmg/edit?usp=sharing

Last Updated: {{03/21/2025}}

Notes / Next Steps
Migrate to DB

Instead of pushing to in-memory arrays, you do INSERT INTO client_subscriptions (...) VALUES (...) in your real DB.
Functions like isModuleActiveForClient would run a SELECT ... FROM client_subscriptions WHERE clientId=? AND moduleId=? query, applying the same logic for endDate.
Add More Fields

If you need different subscription tiers or complex intervals, you can store them in additional columns (e.g., billingCycle, trialEndDate, etc.).
Testing

Keep it “on the side” until you’re ready to integrate – you can still do local Node tests:

node subscriptionLogic.js

(Add a quick console.log test at the bottom.)