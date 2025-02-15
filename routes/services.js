const express = require('express');
const {
  getServices,
  addService,
  updateService,
  deleteService,
  getServiceById,
  searchServices,
  getServicesCounts
} = require('../controllers/servicesController');

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/search', searchServices);
router.post('/', addService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);
router.get('/getServicesCounts', getServicesCounts);

module.exports = router;