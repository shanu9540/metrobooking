const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Station = require('../models/Station');
const Ticket = require('../models/Ticket');
const Route = require('../models/Route');

let token;
let testUser;
let srcStationId;
let destStationId;
let bookingOid;
let ticketOid;
let ticketId;

beforeAll(async () => {
  // Ensure DB connected (wait briefly)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Wipe test users to avoid duplicate key errors
  await User.deleteMany({ email: 'testcommuter@metro.com' });
  
  // Retrieve station Object IDs seeded by script
  const hcc = await Station.findOne({ stationId: 'HCC' });
  const aiims = await Station.findOne({ stationId: 'AIIMS' });
  
  if (hcc && aiims) {
    srcStationId = hcc._id.toString();
    destStationId = aiims._id.toString();
  } else {
    // If not seeded, insert dummy stations for tests
    const dummySrc = await Station.create({
      stationId: 'TEST_SRC',
      stationName: 'Test Source Station',
      lineName: ['Yellow'],
      location: { type: 'Point', coordinates: [77.0, 28.0] }
    });
    const dummyDest = await Station.create({
      stationId: 'TEST_DEST',
      stationName: 'Test Destination Station',
      lineName: ['Yellow'],
      location: { type: 'Point', coordinates: [77.1, 28.1] }
    });
    
    // Connect them
    await Route.create({
      fromStation: dummySrc._id,
      toStation: dummyDest._id,
      lineName: 'Yellow',
      distance: 5.5,
      duration: 10
    });
    
    srcStationId = dummySrc._id.toString();
    destStationId = dummyDest._id.toString();
  }
});

afterAll(async () => {
  // Clean up test bookings and users created during test
  if (testUser) {
    await Booking.deleteMany({ user: testUser._id });
    await Ticket.deleteMany({ user: testUser._id });
    await User.deleteOne({ _id: testUser._id });
  }
  
  // Close connections to prevent open handle issues
  await mongoose.connection.close();
  await server.close();
});

describe('Metro Ticket Booking full-stack API integration tests', () => {
  
  // 1. Authentication Tests
  it('should register a new commuter account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Commuter',
        email: 'testcommuter@metro.com',
        phone: '8888888888',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual('testcommuter@metro.com');
    
    token = res.body.token;
    testUser = res.body.user;
  });

  it('should authenticate and log in registered commuter', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testcommuter@metro.com',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  // 2. Fare & Routing Tests
  it('should fetch the active stations directory', async () => {
    const res = await request(app).get('/api/stations');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stations.length).toBeGreaterThan(0);
  });

  it('should calculate routing path and fares between source & destination', async () => {
    const res = await request(app)
      .post('/api/fare/calculate')
      .send({
        sourceStationId: srcStationId,
        destinationStationId: destStationId
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('fare');
    expect(res.body.route).toHaveProperty('distance');
    expect(res.body.route).toHaveProperty('duration');
  });

  // 3. Booking Creation Test
  it('should create a pending booking and a payment order', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sourceStationId: srcStationId,
        destinationStationId: destStationId,
        passengerName: 'Test Commuter',
        passengerEmail: 'testcommuter@metro.com',
        passengerPhone: '8888888888',
        journeyDate: new Date().toISOString().slice(0, 10),
        journeyTime: '09:30',
        passengerCount: 2
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toEqual('PENDING');
    expect(res.body.booking.paymentStatus).toEqual('PENDING');
    expect(res.body.booking).toHaveProperty('orderId');
    
    bookingOid = res.body.booking._id;
  });

  // 4. Payment Verification Test
  it('should verify payment signature and generate valid QR ticket', async () => {
    const pendingBooking = await Booking.findById(bookingOid);
    
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId: bookingOid,
        razorpay_order_id: pendingBooking.orderId,
        razorpay_payment_id: 'pay_test_payment_123',
        razorpay_signature: 'sig_test_sig_123'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toEqual('CONFIRMED');
    expect(res.body.booking.paymentStatus).toEqual('SUCCESS');
    expect(res.body).toHaveProperty('ticket');
    expect(res.body.ticket.isValid).toBe(true);
    expect(res.body.ticket).toHaveProperty('qrCodeData');
    
    ticketOid = res.body.ticket._id;
    ticketId = res.body.ticket.ticketId;
  });

  // 5. Ticket Scanner Validation Test
  it('should validate the digital ticket and register check-in entry', async () => {
    // Admin login needed for validation - login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@metro.com',
        password: 'admin123'
      });
      
    const adminToken = adminLogin.body.token;

    const res = await request(app)
      .post('/api/tickets/validate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ticketId: ticketId
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.valid).toBe(true);
    expect(res.body.ticket.isUsed).toBe(true);
  });

  // 6. Double Scan / Double Check-In Protection Test
  it('should refuse validation for already scanned tickets', async () => {
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@metro.com',
        password: 'admin123'
      });
      
    const adminToken = adminLogin.body.token;

    const res = await request(app)
      .post('/api/tickets/validate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ticketId: ticketId
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(true);
    expect(res.body.valid).toBe(false);
    expect(res.body.message).toContain('already been used');
  });

  // 7. Cancellation Test
  it('should allow ticket cancellation for upcoming journeys', async () => {
    // Let's create another booking to cancel
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sourceStationId: srcStationId,
        destinationStationId: destStationId,
        passengerName: 'Test Commuter',
        passengerEmail: 'testcommuter@metro.com',
        passengerPhone: '8888888888',
        journeyDate: new Date().setDate(new Date().getDate() + 1), // tomorrow
        journeyTime: '12:00',
        passengerCount: 1
      });
      
    const newBookingOid = bookRes.body.booking._id;
    const orderId = bookRes.body.booking.orderId;
    
    // Complete payment
    await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId: newBookingOid,
        razorpay_order_id: orderId,
        razorpay_payment_id: 'pay_test_payment_456'
      });

    // Cancel booking
    const cancelRes = await request(app)
      .post(`/api/bookings/${newBookingOid}/cancel`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(cancelRes.statusCode).toEqual(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.booking.bookingStatus).toEqual('CANCELLED');
    expect(cancelRes.body.booking.paymentStatus).toEqual('REFUNDED');
  });
});
