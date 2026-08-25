require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Station = require('../models/Station');
const Route = require('../models/Route');
const FareConfig = require('../models/FareConfig');
const { DEFAULT_FARE_CONFIG } = require('../services/fareService');

const stationsData = [
  // Yellow Line
  { stationId: 'HCC', stationName: 'Millennium City Centre Gurugram', lineName: ['Yellow'], coordinates: [77.0725, 28.4593], address: 'Sector 29, Gurugram, Haryana' },
  { stationId: 'AIIMS', stationName: 'AIIMS', lineName: ['Yellow'], coordinates: [77.2072, 28.5686], address: 'Ansari Nagar, New Delhi' },
  { stationId: 'CS', stationName: 'Central Secretariat', lineName: ['Yellow'], coordinates: [77.2114, 28.6148], address: 'Rafi Marg, New Delhi' },
  { stationId: 'RC', stationName: 'Rajiv Chowk', lineName: ['Yellow', 'Blue'], coordinates: [77.2197, 28.6328], address: 'Connaught Place, New Delhi' },
  { stationId: 'ND', stationName: 'New Delhi', lineName: ['Yellow'], coordinates: [77.2223, 28.6431], address: 'Bhavabhuti Marg, New Delhi' },
  { stationId: 'CC', stationName: 'Chandni Chowk', lineName: ['Yellow'], coordinates: [77.2302, 28.6578], address: 'Chandni Chowk, Old Delhi' },
  { stationId: 'KG', stationName: 'Kashmere Gate', lineName: ['Yellow', 'Red'], coordinates: [77.2284, 28.6675], address: 'Lothian Road, Kashmere Gate, Delhi' },

  // Blue Line
  { stationId: 'DW21', stationName: 'Dwarka Sector 21', lineName: ['Blue'], coordinates: [77.0583, 28.5523], address: 'Sector 21, Dwarka, New Delhi' },
  { stationId: 'RG', stationName: 'Rajouri Garden', lineName: ['Blue'], coordinates: [77.1215, 28.6489], address: 'Rajouri Garden, New Delhi' },
  { stationId: 'MH', stationName: 'Mandi House', lineName: ['Blue'], coordinates: [77.2339, 28.6256], address: 'Mandi House, New Delhi' },
  { stationId: 'YB', stationName: 'Yamuna Bank', lineName: ['Blue'], coordinates: [77.2625, 28.6212], address: 'Vikas Marg, Yamuna Bank, Delhi' },
  { stationId: 'NEC', stationName: 'Noida Electronic City', lineName: ['Blue'], coordinates: [77.3730, 28.6288], address: 'Sector 62, Noida, Uttar Pradesh' },

  // Red Line
  { stationId: 'DL', stationName: 'Dilshad Garden', lineName: ['Red'], coordinates: [77.3218, 28.6758], address: 'Dilshad Garden, Delhi' }
];

// Connection definition (bidirectional helper in seed script)
const connectionsData = [
  // Yellow Line adjacent links
  { fromId: 'HCC', toId: 'AIIMS', lineName: 'Yellow', distance: 13.5, duration: 20 },
  { fromId: 'AIIMS', toId: 'CS', lineName: 'Yellow', distance: 5.5, duration: 9 },
  { fromId: 'CS', toId: 'RC', lineName: 'Yellow', distance: 2.1, duration: 4 },
  { fromId: 'RC', toId: 'ND', lineName: 'Yellow', distance: 1.1, duration: 2 },
  { fromId: 'ND', toId: 'CC', lineName: 'Yellow', distance: 1.6, duration: 3 },
  { fromId: 'CC', toId: 'KG', lineName: 'Yellow', distance: 1.2, duration: 2 },

  // Blue Line adjacent links
  { fromId: 'DW21', toId: 'RG', lineName: 'Blue', distance: 12.5, duration: 18 },
  { fromId: 'RG', toId: 'RC', lineName: 'Blue', distance: 8.2, duration: 12 },
  { fromId: 'RC', toId: 'MH', lineName: 'Blue', distance: 1.5, duration: 3 },
  { fromId: 'MH', toId: 'YB', lineName: 'Blue', distance: 2.8, duration: 5 },
  { fromId: 'YB', toId: 'NEC', lineName: 'Blue', distance: 11.2, duration: 16 },

  // Red Line adjacent links
  { fromId: 'KG', toId: 'DL', lineName: 'Red', distance: 9.5, duration: 14 }
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/metro_ticket_booking';
  console.log('Connecting to database:', mongoUri);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // 1. Seed Fare Configurations
    console.log('Seeding Fare Configurations...');
    await FareConfig.deleteMany({});
    await FareConfig.insertMany(DEFAULT_FARE_CONFIG);
    console.log('Fare configurations seeded.');

    // 2. Seed Stations
    console.log('Seeding Stations...');
    await Station.deleteMany({});
    const createdStations = [];
    for (const s of stationsData) {
      const station = await Station.create({
        stationId: s.stationId,
        stationName: s.stationName,
        lineName: s.lineName,
        location: {
          type: 'Point',
          coordinates: s.coordinates // [lng, lat]
        },
        address: s.address,
        isActive: true
      });
      createdStations.push(station);
    }
    console.log(`Successfully seeded ${createdStations.length} stations.`);

    // Map stationId to Mongoose Object ID for Route connections
    const stationIdMap = {};
    createdStations.forEach(s => {
      stationIdMap[s.stationId] = s._id;
    });

    // 3. Seed Connections (Routes)
    console.log('Seeding Route Connections...');
    await Route.deleteMany({});
    let routeCount = 0;
    for (const c of connectionsData) {
      const fromOid = stationIdMap[c.fromId];
      const toOid = stationIdMap[c.toId];

      if (!fromOid || !toOid) {
        console.warn(`Could not connect ${c.fromId} and ${c.toId} - one or both stations missing.`);
        continue;
      }

      // Add edge
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
    console.log(`Successfully seeded ${routeCount} connections.`);

    // 4. Seed Admin User
    console.log('Checking Admin User...');
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
      console.log('Admin user created: admin@metro.com / admin123');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seed();
