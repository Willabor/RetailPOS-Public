/**
 * File: server.js
 * Purpose:
 *   - Creates an Express server on localhost:4141
 *   - Connects to Postgres (port 5433) using pg
 *   - Defines routes to read/write data in 'item_list'
 */

const express = require('express');
const { Pool } = require('pg');
const app = express();

// 1) Middleware to parse JSON bodies
app.use(express.json());

// 2) Configure the Postgres connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',     // or your actual host
  database: 'RetailPOS', // your DB name
  password: 'Hall0314',
  port: 5433             // note it's 5433, not default 5432
});

// Root route to handle GET /
app.get('/', (req, res) => {
  res.send('Welcome to the RetailPOS API');
});

/* 
   (3) UPDATED: GET /api/items
   Returns all columns from item_list, sorted by "parent_sku".
*/
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        "item_id",
        "parent_item_id",
        "is_parent",
        "parent_sku",
        "alternate_lookup",
        "item_name",
        "item_description",
        "item_type",
        "attribute",
        "standard_color",
        "size",
        "gender",
        "online_store",
        "for_sale",
        "item_notes",
        "custom_price_1",
        "regular_price",
        "msrp",
        "quantity_on_hand",
        "average_unit_cost",
        "qty_1",
        "qty_2",
        "qty_3",
        "qty_4",
        "qty_5",
        "qty_6",
        "qty_7",
        "reorder_point_1",
        "reorder_point_2",
        "reorder_point_3",
        "reorder_point_4",
        "reorder_point_5",
        "reorder_point_6",
        "reorder_point_7",
        "last_received_date",
        "sold_in_ecommerce",
        "department_code",
        "department_name",
        "vendor_code",
        "vendor_name",
        "upc",
        "base_unit_of_measure",
        "width",
        "height",
        "length",
        "weight",
        "custom_field_1",
        "custom_field_2",
        "custom_field_3",
        "custom_field_4",
        "custom_field_5",
        "manufacturer",
        "serial_tracking",
        "asset_account",
        "cogs_account",
        "income_account",
        "eligible_for_commission",
        "eligible_for_rewards",
        "previous_system_id",
        "qb_listid",
        "po_number",
        "print_tags",
        "sync_to_mobile",
        "tax_code",
        "previous_creation_date",
        "created_date",
        "updated_at",
        "external_sync_id",
        "sync_shopify",
        "sync_amazon",
        "sync_walmart",
        "sync_ebay",
        "sync_etsy",
        "sync_marketplace1",
        "sync_marketplace2",
        "compare_at_price",
        "previous_last_received_date",
        "brief_description",
        "custom_price_2",
        "custom_price_3",
        "custom_price_4",
        "unit_cost",
        "image_url_1",
        "image_url_2",
        "image_url_3",
        "image_url_4",
        "image_url_5",
        "image_url_6",
        "video_url",
        "item_class",
        "available_qty",
        "UPC_1",
        "UPC_2",
        "UPC_3",
        "UPC_4"
      FROM item_list
      ORDER BY "parent_sku";
    `);
    console.log('Query Result:', result.rows); // Log the result
    res.json(result.rows);
  } catch (error) {
    console.error('[GET /api/items]', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/*
   (4) UPDATED: POST /api/items
   Inserts all columns into item_list.
   Provide them in req.body (JSON).
*/
app.post('/api/items', async (req, res) => {
  try {
    // Destructure columns from req.body
    const {
      item_id,
      parent_item_id,
      is_parent,
      parent_sku,
      alternate_lookup,
      item_name,
      item_description,
      item_type,
      attribute,
      standard_color,
      size,
      gender,
      online_store,
      for_sale,
      item_notes,
      custom_price_1,
      regular_price,
      msrp,
      quantity_on_hand,
      average_unit_cost,
      qty_1,
      qty_2,
      qty_3,
      qty_4,
      qty_5,
      qty_6,
      qty_7,
      reorder_point_1,
      reorder_point_2,
      reorder_point_3,
      reorder_point_4,
      reorder_point_5,
      reorder_point_6,
      reorder_point_7,
      last_received_date,
      sold_in_ecommerce,
      department_code,
      department_name,
      vendor_code,
      vendor_name,
      upc,
      base_unit_of_measure,
      width,
      height,
      length,
      weight,
      custom_field_1,
      custom_field_2,
      custom_field_3,
      custom_field_4,
      custom_field_5,
      manufacturer,
      serial_tracking,
      asset_account,
      cogs_account,
      income_account,
      eligible_for_commission,
      eligible_for_rewards,
      previous_system_id,
      qb_listid,
      po_number,
      print_tags,
      sync_to_mobile,
      tax_code,
      previous_creation_date,
      created_date,
      updated_at,
      external_sync_id,
      sync_shopify,
      sync_amazon,
      sync_walmart,
      sync_ebay,
      sync_etsy,
      sync_marketplace1,
      sync_marketplace2,
      compare_at_price,
      previous_last_received_date,
      brief_description,
      custom_price_2,
      custom_price_3,
      custom_price_4,
      unit_cost,
      image_url_1,
      image_url_2,
      image_url_3,
      image_url_4,
      image_url_5,
      image_url_6,
      video_url,
      item_class,
      available_qty,
      // New UPC columns:
      UPC_1,
      UPC_2,
      UPC_3,
      UPC_4
    } = req.body;

    // Build the INSERT query with placeholders
    const insertQuery = `
      INSERT INTO item_list (
        "item_id",
        "parent_item_id",
        "is_parent",
        "parent_sku",
        "alternate_lookup",
        "item_name",
        "item_description",
        "item_type",
        "attribute",
        "standard_color",
        "size",
        "gender",
        "online_store",
        "for_sale",
        "item_notes",
        "custom_price_1",
        "regular_price",
        "msrp",
        "quantity_on_hand",
        "average_unit_cost",
        "qty_1",
        "qty_2",
        "qty_3",
        "qty_4",
        "qty_5",
        "qty_6",
        "qty_7",
        "reorder_point_1",
        "reorder_point_2",
        "reorder_point_3",
        "reorder_point_4",
        "reorder_point_5",
        "reorder_point_6",
        "reorder_point_7",
        "last_received_date",
        "sold_in_ecommerce",
        "department_code",
        "department_name",
        "vendor_code",
        "vendor_name",
        "upc",
        "base_unit_of_measure",
        "width",
        "height",
        "length",
        "weight",
        "custom_field_1",
        "custom_field_2",
        "custom_field_3",
        "custom_field_4",
        "custom_field_5",
        "manufacturer",
        "serial_tracking",
        "asset_account",
        "cogs_account",
        "income_account",
        "eligible_for_commission",
        "eligible_for_rewards",
        "previous_system_id",
        "qb_listid",
        "po_number",
        "print_tags",
        "sync_to_mobile",
        "tax_code",
        "previous_creation_date",
        "created_date",
        "updated_at",
        "external_sync_id",
        "sync_shopify",
        "sync_amazon",
        "sync_walmart",
        "sync_ebay",
        "sync_etsy",
        "sync_marketplace1",
        "sync_marketplace2",
        "compare_at_price",
        "previous_last_received_date",
        "brief_description",
        "custom_price_2",
        "custom_price_3",
        "custom_price_4",
        "unit_cost",
        "image_url_1",
        "image_url_2",
        "image_url_3",
        "image_url_4",
        "image_url_5",
        "image_url_6",
        "video_url",
        "item_class",
        "available_qty",
        "UPC_1",
        "UPC_2",
        "UPC_3",
        "UPC_4"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
        $51, $52, $53, $54, $55, $56, $57, $58, $59, $60,
        $61, $62, $63, $64, $65, $66, $67, $68, $69, $70,
        $71, $72, $73, $74, $75, $76, $77, $78, $79, $80,
        $81, $82, $83, $84, $85, $86, $87, $88, $89, $90,
        $91, $92, $93, $94
      )
      RETURNING "item_id"
    `;

    // Put all variables in the same order as placeholders
    const values = [
      item_id,
      parent_item_id,
      is_parent,
      parent_sku,
      alternate_lookup,
      item_name,
      item_description,
      item_type,
      attribute,
      standard_color,
      size,
      gender,
      online_store,
      for_sale,
      item_notes,
      custom_price_1,
      regular_price,
      msrp,
      quantity_on_hand,
      average_unit_cost,
      qty_1,
      qty_2,
      qty_3,
      qty_4,
      qty_5,
      qty_6,
      qty_7,
      reorder_point_1,
      reorder_point_2,
      reorder_point_3,
      reorder_point_4,
      reorder_point_5,
      reorder_point_6,
      reorder_point_7,
      last_received_date,
      sold_in_ecommerce,
      department_code,
      department_name,
      vendor_code,
      vendor_name,
      upc,
      base_unit_of_measure,
      width,
      height,
      length,
      weight,
      custom_field_1,
      custom_field_2,
      custom_field_3,
      custom_field_4,
      custom_field_5,
      manufacturer,
      serial_tracking,
      asset_account,
      cogs_account,
      income_account,
      eligible_for_commission,
      eligible_for_rewards,
      previous_system_id,
      qb_listid,
      po_number,
      print_tags,
      sync_to_mobile,
      tax_code,
      previous_creation_date,
      created_date,
      updated_at,
      external_sync_id,
      sync_shopify,
      sync_amazon,
      sync_walmart,
      sync_ebay,
      sync_etsy,
      sync_marketplace1,
      sync_marketplace2,
      compare_at_price,
      previous_last_received_date,
      brief_description,
      custom_price_2,
      custom_price_3,
      custom_price_4,
      unit_cost,
      image_url_1,
      image_url_2,
      image_url_3,
      image_url_4,
      image_url_5,
      image_url_6,
      video_url,
      item_class,
      available_qty,
      // The 4 new UPC columns at the end
      UPC_1,
      UPC_2,
      UPC_3,
      UPC_4
    ];

    const result = await pool.query(insertQuery, values);

    // Return the newly created item_id
    res.json({ item_id: result.rows[0].item_id });
  } catch (error) {
    console.error('[POST /api/items]', error);
    res.status(500).json({ error: 'Insert error' });
  }
});

// Health-check endpoint to verify database connection
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1'); // Simple query to check connection
    res.json({ status: 'Database connected' });
  } catch (error) {
    console.error('[GET /api/health]', error);
    res.status(500).json({ status: 'Database connection failed', error: error.message });
  }
});

// (5) Start the server on port 4141
const PORT = 4141;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
