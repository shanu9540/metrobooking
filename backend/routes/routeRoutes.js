const express = require('express');
const router = express.Router();
const { calculateFareAndRoute } = require('../controllers/routeController');

router.post('/calculate', calculateFareAndRoute);

module.exports = router;
