const User = require('../models/User');
const Station = require('../models/Station');
const Route = require('../models/Route');
const FareConfig = require('../models/FareConfig');
const { DEFAULT_FARE_CONFIG } = require('../services/fareService');

const stationsData = [
  { stationId: 'HCC', stationName: 'Millennium City Centre Gurugram', lineName: ['Yellow'], coordinates: [77.0725, 28.4593], address: 'Sector 29, Gurugram, Haryana' },
  { stationId: 'AIIMS', stationName: 'AIIMS', lineName: ['Yellow'], coordinates: [77.2072, 28.5686], address: 'Ansari Nagar, New Delhi' },
  { stationId: 'CS', stationName: 'Central Secretariat', lineName: ['Yellow'], coordinates: [77.2114, 28.6148], address: 'Rafi Marg, New Delhi' },
  { stationId: 'RC', stationName: 'Rajiv Chowk', lineName: ['Yellow', 'Blue'], coordinates: [77.2197, 28.6328], address: 'Connaught Place, New Delhi' },
  { stationId: 'ND', stationName: 'New Delhi', lineName: ['Yellow'], coordinates: [77.2223, 28.6431], address: 'Bhavabhuti Marg, New Delhi' },
  { stationId: 'CC', stationName: 'Chandni Chowk', lineName: ['Yellow'], coordinates: [77.2302, 28.6578], address: 'Chandni Chowk, Old Delhi' },
  { stationId: 'KG', stationName: 'Kashmere Gate', lineName: ['Yellow', 'Red'], coordinates: [77.2284, 28.6675], address: 'Lothian Road, Kashmere Gate, Delhi' },
  { stationId: 'DW21', stationName: 'Dwarka Sector 21', lineName: ['Blue'], coordinates: [77.0583, 28.5523], address: 'Sector 21, Dwarka, New Delhi' },
  { stationId: 'RG', stationName: 'Rajouri Garden', lineName: ['Blue'], coordinates: [77.1215, 28.6489], address: 'Rajouri Garden, New Delhi' },
  { stationId: 'MH', stationName: 'Mandi House', lineName: ['Blue'], coordinates: [77.2339, 28.6256], address: 'Mandi House, New Delhi' },
  { stationId: 'YB', stationName: 'Yamuna Bank', lineName: ['Blue'], coordinates: [77.2625, 28.6212], address: 'Vikas Marg, Yamuna Bank, Delhi' },
  { stationId: 'NEC', stationName: 'Noida Electronic City', lineName: ['Blue'], coordinates: [77.3730, 28.6288], address: 'Sector 62, Noida, Uttar Pradesh' },
  { stationId: 'DL', stationName: 'Dilshad Garden', lineName: ['Red'], coordinates: [77.3218, 28.6758], address: 'Dilshad Garden, Delhi' },
  { stationId: 'SEC18', stationName: 'Noida Sector 18', lineName: ['Blue'], coordinates: [77.3259, 28.5708], address: 'Sector 18, Noida, Uttar Pradesh' },
  { stationId: 'NCC', stationName: 'Noida City Centre', lineName: ['Blue'], coordinates: [77.3409, 28.5747], address: 'Sector 39, Noida, Uttar Pradesh' },
  { stationId: 'SEC34', stationName: 'Noida Sector 34', lineName: ['Blue'], coordinates: [77.3499, 28.5796], address: 'Sector 34, Noida, Uttar Pradesh' },
  { stationId: 'SEC52', stationName: 'Noida Sector 52', lineName: ['Blue'], coordinates: [77.3621, 28.5831], address: 'Sector 52, Noida, Uttar Pradesh' }
];

const connectionsData = [
  { fromId: 'HCC', toId: 'AIIMS', lineName: 'Yellow', distance: 13.5, duration: 20 },
  { fromId: 'AIIMS', toId: 'CS', lineName: 'Yellow', distance: 5.5, duration: 9 },
  { fromId: 'CS', toId: 'RC', lineName: 'Yellow', distance: 2.1, duration: 4 },
  { fromId: 'RC', toId: 'ND', lineName: 'Yellow', distance: 1.1, duration: 2 },
  { fromId: 'ND', toId: 'CC', lineName: 'Yellow', distance: 1.6, duration: 3 },
  { fromId: 'CC', toId: 'KG', lineName: 'Yellow', distance: 1.2, duration: 2 },
  { fromId: 'DW21', toId: 'RG', lineName: 'Blue', distance: 12.5, duration: 18 },
  { fromId: 'RG', toId: 'RC', lineName: 'Blue', distance: 8.2, duration: 12 },
  { fromId: 'RC', toId: 'MH', lineName: 'Blue', distance: 1.5, duration: 3 },
  { fromId: 'MH', toId: 'YB', lineName: 'Blue', distance: 2.8, duration: 5 },
  { fromId: 'YB', toId: 'SEC18', lineName: 'Blue', distance: 9.2, duration: 13 },
  { fromId: 'SEC18', toId: 'NCC', lineName: 'Blue', distance: 2.0, duration: 3 },
  { fromId: 'NCC', toId: 'SEC34', lineName: 'Blue', distance: 1.5, duration: 2 },
  { fromId: 'SEC34', toId: 'SEC52', lineName: 'Blue', distance: 1.2, duration: 2 },
  { fromId: 'SEC52', toId: 'NEC', lineName: 'Blue', distance: 3.5, duration: 5 },
  { fromId: 'KG', toId: 'DL', lineName: 'Red', distance: 9.5, duration: 14 }
];

async function checkAndAutoSeed() {
  try {
    const stationCount = await Station.countDocuments({});
    if (stationCount > 0) {
      console.log('Database already has stations. Skipping auto-seed.');
      return;
    }

    console.log('--- Database is empty! Starting Automatic Seeding ---');
    
    // Seed fares
    await FareConfig.deleteMany({});
    await FareConfig.insertMany(DEFAULT_FARE_CONFIG);
    console.log('Auto-seeded Fare Configurations.');

    // Seed stations
    const createdStations = [];
    for (const s of stationsData) {
      const station = await Station.create({
        stationId: s.stationId,
        stationName: s.stationName,
        lineName: s.lineName,
        location: { type: 'Point', coordinates: s.coordinates },
        address: s.address,
        isActive: true
      });
      createdStations.push(station);
    }
    console.log(`Auto-seeded ${createdStations.length} stations.`);

    // Map ID
    const stationIdMap = {};
    createdStations.forEach(s => {
      stationIdMap[s.stationId] = s._id;
    });

    // Seed connections
    let routeCount = 0;
    for (const c of connectionsData) {
      const fromOid = stationIdMap[c.fromId];
      const toOid = stationIdMap[c.toId];
      if (fromOid && toOid) {
        await Route.create({
          fromStation: fromOid,
          toStation: toOid,
          lineName: c.lineName,
          distance: c.distance,
          duration: c.duration,
          isActive: true
        });
        routeCount++;
      }
    }
    console.log(`Auto-seeded ${routeCount} connections.`);

    // Seed Admin user
    const adminEmail = 'admin@metro.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Metro Admin',
        email: adminEmail,
        password: 'admin123',
        phone: '9999999999',
        role: 'ADMIN'
      });
      console.log('Auto-seeded Admin User: admin@metro.com');
    }

    console.log('--- Automatic Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Database auto-seeding error:', error);
  }
}

module.exports = { checkAndAutoSeed };
