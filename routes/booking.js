const express = require('express');
const { getBookings, getBookingById, addBooking, updateBooking, deleteBooking, getBookingsCounts } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', addBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.get('/getBookingsCounts', getBookingsCounts);

module.exports = router;