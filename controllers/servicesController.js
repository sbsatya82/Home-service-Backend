const db = require('../db'); // Import the connection pool

// Get all services
exports.getServices = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM services');
    res.json(results);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a new service
exports.addService = async (req, res) => {
  const { name, description, price, availability = false } = req.body;
  console.log(req.body);
  
  // Validate input
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    const [results] = await db.query(
      'INSERT INTO services (name, description, price, availability) VALUES (?, ?, ?, ?)',
      [name, description, price, availability]
    );
    res.status(201).json({ message: 'Service added', id: results.insertId });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, availability } = req.body;

  // Validate input
  if (!id || (!name && !description && !price && availability === undefined)) {
    return res
      .status(400)
      .json({ message: 'Invalid input. ID and at least one field are required' });
  }

  try {
    const [results] = await db.query(
      'UPDATE services SET name = COALESCE(?, name), description = COALESCE(?, description), price = COALESCE(?, price), availability = COALESCE(?, availability) WHERE id = ?',
      [name, description, price, availability, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service updated' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Service ID is required' });
  }

  try {
    const [results] = await db.query('DELETE FROM services WHERE id = ?', [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Service ID is required' });
  }

  try {
    const [results] = await db.query('SELECT * FROM services WHERE id = ?', [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search for services
exports.searchServices = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const [results] = await db.query(
      'SELECT * FROM services WHERE name LIKE ? OR description LIKE ?',
      [`%${query}%`, `%${query}%`]
    );
    res.json(results);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getServicesCounts = async (req, res) => {

  try {
    const [results] = await db.query('SELECT COUNT(*) AS count FROM services');
    res.status(200).json({ servicesCount: results[0].count });
  } catch (error) {
    console.error('Error fetching services count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
