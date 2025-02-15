const db = require('../db');

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM bookings');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!id) {
    return res.status(400).json({ message: 'Booking ID is required' });
  }

  try {
    const results = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new booking
exports.addBooking = async (req, res) => {
 
  const { customerId, date, time, service, address } = req.body;

  // Validate input
  if (!customerId || !date || !time || !service || !address) {
    return res
      .status(400)
      .json({ message: 'All fields (customerId, date, time, service, address) are required' });
  }

  const status = 'active'; // Default status
  const createdAt = new Date(); // Current timestamp

  try {
    const results = await db.query(
      `
      INSERT INTO bookings (customer_id, service_date, time, service, address, created_at, updated_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [customerId, date, time, service, address,createdAt, createdAt, status]
    );
    res.status(201).json({ message: 'Booking created successfully', bookingId: results.insertId });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { serviceDate, time, service, status } = req.body;

  // Validate input
  if (!id || (!serviceDate && !time && !service && !status)) {
    return res
      .status(400)
      .json({ message: 'Booking ID and at least one field to update are required' });
  }

  try {
    const results = await db.query(
      `
      UPDATE bookings 
      SET 
        service_date = COALESCE(?, service_date), 
        time = COALESCE(?, time), 
        service = COALESCE(?, service), 
        status = COALESCE(?, status), 
        updated_at = NOW()
      WHERE id = ?
      `,
      [serviceDate || null, time || null, service || null, status || null, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!id) {
    return res.status(400).json({ message: 'Booking ID is required' });
  }

  try {
    const results = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getBookingsCounts = async (req, res) => {
  try {
    const [results] = await db.query('SELECT COUNT(*) AS count FROM bookings');
    res.status(200).json({ bookingsCount: results[0].count });
  } catch (error) {
    console.error('Error fetching bookings count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
