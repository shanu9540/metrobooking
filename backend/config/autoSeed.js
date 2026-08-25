const User = require('../models/User');
const Station = require('../models/Station');
const Route = require('../models/Route');
const FareConfig = require('../models/FareConfig');
const { DEFAULT_FARE_CONFIG } = require('../services/fareService');
const { STATIC_STATIONS, connections } = require('./metroData');

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
    for (const s of STATIC_STATIONS) {
      const station = await Station.create({
        stationId: s.stationId,
        stationName: s.stationName,
        lineName: s.lineName,
        location: s.location,
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
    for (const c of connections) {
      const fromOid = stationIdMap[c.from];
      const toOid = stationIdMap[c.to];
      if (fromOid && toOid) {
        await Route.create({
          fromStation: fromOid,
          toStation: toOid,
          lineName: c.line,
          distance: c.dist,
          duration: c.dur,
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
