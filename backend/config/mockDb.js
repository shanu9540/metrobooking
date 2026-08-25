// In-Memory Shared Database Fallback Store
const mockUsers = [
  {
    _id: 'mock-admin-id',
    name: 'Metro Admin',
    email: 'admin@metro.com',
    phone: '9999999999',
    role: 'ADMIN'
  },
  {
    _id: 'mock-user-id',
    name: 'Demo User',
    email: 'user@test.com',
    phone: '9999999999',
    role: 'USER'
  }
];

const mockBookings = [];
const mockTickets = [];

const { STATIC_STATIONS: mockStations } = require('./metroData');

module.exports = {
  mockUsers,
  mockBookings,
  mockTickets,
  mockStations
};
