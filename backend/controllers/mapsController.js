// Google Maps APIs Proxy Controller
const MOCK_PLACES = [
  { description: 'Rajiv Chowk Metro Station, Connaught Place, New Delhi', place_id: 'mock_place_rc', name: 'Rajiv Chowk Metro Station', lat: 28.6328, lng: 77.2197 },
  { description: 'Kashmere Gate Metro Station, Lothian Road, Old Delhi', place_id: 'mock_place_kg', name: 'Kashmere Gate Metro Station', lat: 28.6675, lng: 77.2284 },
  { description: 'Millennium City Centre Metro Station, Sector 29, Gurugram', place_id: 'mock_place_hcc', name: 'Millennium City Centre Gurugram Metro Station', lat: 28.4593, lng: 77.0725 },
  { description: 'Dwarka Sector 21 Metro Station, Dwarka, New Delhi', place_id: 'mock_place_dw21', name: 'Dwarka Sector 21 Metro Station', lat: 28.5523, lng: 77.0583 },
  { description: 'Noida Electronic City Metro Station, Sector 62, Noida', place_id: 'mock_place_nec', name: 'Noida Electronic City Metro Station', lat: 28.6288, lng: 77.3730 },
  { description: 'AIIMS Metro Station, Ansari Nagar, New Delhi', place_id: 'mock_place_aiims', name: 'AIIMS Metro Station', lat: 28.5686, lng: 77.2072 },
  { description: 'Dilshad Garden Metro Station, Dilshad Garden, Delhi', place_id: 'mock_place_dl', name: 'Dilshad Garden Metro Station', lat: 28.6758, lng: 77.3218 }
];

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const isMock = !apiKey || apiKey === 'mock_or_leave_blank' || apiKey.trim() === '';

/**
 * Autocomplete place search
 * GET /api/maps/autocomplete?input=
 */
const getAutocomplete = async (req, res, next) => {
  const { input } = req.query;
  try {
    if (!input) {
      return res.json({ success: true, predictions: [] });
    }

    if (isMock) {
      // Mock Autocomplete
      const filtered = MOCK_PLACES.filter(p =>
        p.description.toLowerCase().includes(input.toLowerCase())
      ).map(p => ({
        description: p.description,
        place_id: p.place_id
      }));
      return res.json({ success: true, predictions: filtered });
    }

    // Call Google Places Autocomplete API
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=geocode&key=${apiKey}&components=country:in`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google API Error: ${data.error_message || data.status}`);
    }

    res.json({
      success: true,
      predictions: data.predictions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get place coordinates & details by Place ID
 * GET /api/maps/place-details?placeId=
 */
const getPlaceDetails = async (req, res, next) => {
  const { placeId } = req.query;
  try {
    if (!placeId) {
      res.status(400);
      throw new Error('placeId query parameter is required');
    }

    if (isMock || placeId.startsWith('mock_place')) {
      // Mock Place Details
      const place = MOCK_PLACES.find(p => p.place_id === placeId);
      if (!place) {
        res.status(404);
        throw new Error('Mock place details not found');
      }
      return res.json({
        success: true,
        result: {
          formatted_address: place.description,
          geometry: {
            location: {
              lat: place.lat,
              lng: place.lng
            }
          },
          name: place.name
        }
      });
    }

    // Call Google Place Details API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API Error: ${data.error_message || data.status}`);
    }

    res.json({
      success: true,
      result: data.result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reverse Geocode coordinates to address
 * GET /api/maps/geocode?lat=&lng=
 */
const getGeocode = async (req, res, next) => {
  const { lat, lng } = req.query;
  try {
    if (!lat || !lng) {
      res.status(400);
      throw new Error('lat and lng are required');
    }

    if (isMock) {
      // Mock Reverse Geocode: Find closest mock place or return default
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      let closest = MOCK_PLACES[0];
      let minDist = Infinity;
      
      MOCK_PLACES.forEach(p => {
        const dist = Math.pow(p.lat - latitude, 2) + Math.pow(p.lng - longitude, 2);
        if (dist < minDist) {
          minDist = dist;
          closest = p;
        }
      });

      return res.json({
        success: true,
        formatted_address: closest.description,
        location: { lat: closest.lat, lng: closest.lng }
      });
    }

    // Call Google Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API Error: ${data.error_message || data.status}`);
    }

    res.json({
      success: true,
      formatted_address: data.results[0].formatted_address,
      location: data.results[0].geometry.location
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAutocomplete,
  getPlaceDetails,
  getGeocode
};
