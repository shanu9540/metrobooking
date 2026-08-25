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

const mockStations = [
  { _id: 'HCC', stationId: 'HCC', stationName: 'Millennium City Centre Gurugram', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.0725, 28.4593] }, address: 'Sector 29, Gurugram, Haryana' },
  { _id: 'AIIMS', stationId: 'AIIMS', stationName: 'AIIMS', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2072, 28.5686] }, address: 'Ansari Nagar, New Delhi' },
  { _id: 'CS', stationId: 'CS', stationName: 'Central Secretariat', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2114, 28.6148] }, address: 'Rafi Marg, New Delhi' },
  { _id: 'RC', stationId: 'RC', stationName: 'Rajiv Chowk', lineName: ['Yellow', 'Blue'], location: { type: 'Point', coordinates: [77.2197, 28.6328] }, address: 'Connaught Place, New Delhi' },
  { _id: 'ND', stationId: 'ND', stationName: 'New Delhi', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2223, 28.6431] }, address: 'Bhavabhuti Marg, New Delhi' },
  { _id: 'CC', stationId: 'CC', stationName: 'Chandni Chowk', lineName: ['Yellow'], location: { type: 'Point', coordinates: [77.2302, 28.6578] }, address: 'Chandni Chowk, Old Delhi' },
  { _id: 'KG', stationId: 'KG', stationName: 'Kashmere Gate', lineName: ['Yellow', 'Red'], location: { type: 'Point', coordinates: [77.2284, 28.6675] }, address: 'Lothian Road, Kashmere Gate, Delhi' },
  { _id: 'DW21', stationId: 'DW21', stationName: 'Dwarka Sector 21', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.0583, 28.5523] }, address: 'Sector 21, Dwarka, New Delhi' },
  { _id: 'RG', stationId: 'RG', stationName: 'Rajouri Garden', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.1215, 28.6489] }, address: 'Rajouri Garden, New Delhi' },
  { _id: 'MH', stationId: 'MH', stationName: 'Mandi House', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.2339, 28.6256] }, address: 'Mandi House, New Delhi' },
  { _id: 'YB', stationId: 'YB', stationName: 'Yamuna Bank', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.2625, 28.6212] }, address: 'Vikas Marg, Yamuna Bank, Delhi' },
  { _id: 'NEC', stationId: 'NEC', stationName: 'Noida Electronic City', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3730, 28.6288] }, address: 'Sector 62, Noida, Uttar Pradesh' },
  { _id: 'DL', stationId: 'DL', stationName: 'Dilshad Garden', lineName: ['Red'], location: { type: 'Point', coordinates: [77.3218, 28.6758] }, address: 'Dilshad Garden, Delhi' },
  { _id: 'SEC18', stationId: 'SEC18', stationName: 'Noida Sector 18', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3259, 28.5708] }, address: 'Sector 18, Noida, Uttar Pradesh' },
  { _id: 'NCC', stationId: 'NCC', stationName: 'Noida City Centre', lineName: ['Blue'], location: { type: 'Point', coordinates: [77.3409, 28.5747] }, address: 'Sector 39, Noida, Uttar Pradesh' }
];

module.exports = {
  mockUsers,
  mockBookings,
  mockTickets,
  mockStations
};
