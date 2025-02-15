const express = require('express');
const { searchCustomers } = require('../controllers/customerController');
const { searchServices } = require('../controllers/servicesController');

const router = express.Router();


router.get('/customers', searchCustomers);
router.get('/services', searchServices);



module.exports = router;