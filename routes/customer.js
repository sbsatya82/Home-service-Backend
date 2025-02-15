const express = require('express');
const { getCustomers, 
  getCustomerById, 
  searchCustomers, 
  addCustomers, 
  updateCustomers, 
  deleteCustomers, 
  getCustomersCounts} = require('../controllers/customerController');

const router = express.Router();


router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', addCustomers);
router.put('/:id', updateCustomers);
router.delete('/:id', deleteCustomers);
router.get('/getCustomersCounts', getCustomersCounts);

module.exports = router;