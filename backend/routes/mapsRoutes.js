const express = require('express');
const router = express.Router();
const { getAutocomplete, getPlaceDetails, getGeocode } = require('../controllers/mapsController');

router.get('/autocomplete', getAutocomplete);
router.get('/place-details', getPlaceDetails);
router.get('/geocode', getGeocode);

module.exports = router;
