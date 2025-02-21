const express = require('express');
const { createOrder , paymentCallback} = require('../controllers/phonepePgController') ;

const router = express.Router();

router.post('/create-order', createOrder);

router.post('/callback', paymentCallback);


module.exports = router;