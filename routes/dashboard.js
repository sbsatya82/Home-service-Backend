const express = require('express');
const { getServicesCounts } = require('../controllers/servicesController');
const { getCustomersCounts } = require('../controllers/customerController');
const { getBookingsCounts } = require('../controllers/bookingController');

const router = express.Router();


router.get('/getServicesCounts', getServicesCounts)
router.get('/getCustomersCounts', getCustomersCounts)
router.get('/getBookingsCounts', getBookingsCounts)




module.exports = router;