const db = require('../db');

exports.getCustomers = async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM customers');
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }
  
  try {
    const [results] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching customer by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search customers by query
exports.searchCustomers = async (req, res) => {

  const { q } = req.query;  // Fetch query from request parameters

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const query = `
      SELECT * FROM customers 
      WHERE name LIKE ? OR contact_no LIKE ?
    `;
    const searchQuery = `%${q}%`;  // Use the 'q' query parameter for search

    const [results] = await db.query(query, [searchQuery, searchQuery]);
    res.json(results);  // Return search results as JSON
  } catch (err) {
    console.error('Error searching customers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a new customer
exports.addCustomers = async (req, res) => {
  const { name, contactNo } = req.body;

  // Validate input
  if (!name || !contactNo) {
    return res.status(400).json({ message: 'Name and contact number are required' });
  }

  try {
    // Check for existing contact_no
    const [existingCustomer] = await db.query(
      'SELECT * FROM customers WHERE contact_no = ?',
      [contactNo]
    );

    if (existingCustomer.length > 0) {
      return res.status(409).json({ message: 'Contact number already exists' });
    }

    // Insert new customer
    const query = 'INSERT INTO customers (name, contact_no) VALUES (?, ?)';
    const [results] = await db.query(query, [name, contactNo]);

    res.status(201).json({ message: 'Customer added successfully', customerId: results.insertId });
  } catch (err) {
    console.error('Error adding customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Update an existing customer
exports.updateCustomers = async (req, res) => {
  const { id } = req.params;
  const { name, contactNo } = req.body;

  if (!id || (!name && !contactNo)) {
    return res.status(400).json({ message: 'Customer ID and at least one field to update are required' });
  }

  try {
    const query = 'UPDATE customers SET name = ?, contact_no = ? WHERE id = ?';
    const [results] = await db.query(query, [name || null, contactNo || null, id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a customer
exports.deleteCustomers = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    const query = 'DELETE FROM customers WHERE id = ?';
    const [results] = await db.query(query, [id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getCustomersCounts = async (req, res) => {
  try {
    const [results] = await db.query('SELECT COUNT(*) AS count FROM customers');
    res.status(200).json({ customersCount: results[0].count });
  } catch (error) {
    console.error('Error fetching customers count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
