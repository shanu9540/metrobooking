const express = require('express');
const router = express.Router();
const { getStations, searchStations, getNearbyStations, getStationById } = require('../controllers/stationController');

router.get('/', getStations);
router.get('/search', searchStations);
router.get('/nearby', getNearbyStations);
router.get('/:id', getStationById);

module.exports = router;
