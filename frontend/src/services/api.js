import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('metroToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('metroToken', res.data.token);
      localStorage.setItem('metroUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (name, email, phone, password) => {
    const res = await api.post('/auth/register', { name, email, phone, password });
    if (res.data.success) {
      localStorage.setItem('metroToken', res.data.token);
      localStorage.setItem('metroUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      localStorage.setItem('metroToken', res.data.token);
      localStorage.setItem('metroUser', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('metroToken');
    localStorage.removeItem('metroUser');
  }
};

// Stations Endpoints
export const stationService = {
  getStations: async () => {
    const res = await api.get('/stations');
    return res.data;
  },
  searchStations: async (query) => {
    const res = await api.get(`/stations/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
  getNearbyStations: async (lat, lng, radius = 5000) => {
    const res = await api.get(`/stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return res.data;
  },
  getStationById: async (id) => {
    const res = await api.get(`/stations/${id}`);
    return res.data;
  }
};

// Route & Fare calculation
export const fareService = {
  calculate: async (sourceStationId, destinationStationId) => {
    const res = await api.post('/fare/calculate', { sourceStationId, destinationStationId });
    return res.data;
  }
};

// Booking Endpoints
export const bookingService = {
  create: async (bookingData) => {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },
  getBookings: async (status) => {
    const url = status ? `/bookings?status=${status}` : '/bookings';
    const res = await api.get(url);
    return res.data;
  },
  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.post(`/bookings/${id}/cancel`);
    return res.data;
  }
};

// Payments verification
export const paymentService = {
  verify: async (paymentData) => {
    const res = await api.post('/payments/verify', paymentData);
    return res.data;
  }
};

// Tickets validation & retrieval
export const ticketService = {
  getTicketById: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },
  validateTicket: async (ticketId, qrToken) => {
    const res = await api.post('/tickets/validate', { ticketId, qrToken });
    return res.data;
  }
};

// Admin Endpoints
export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  addStation: async (stationData) => {
    const res = await api.post('/admin/stations', stationData);
    return res.data;
  },
  editStation: async (id, stationData) => {
    const res = await api.put(`/admin/stations/${id}`, stationData);
    return res.data;
  },
  updateFares: async (brackets) => {
    const res = await api.post('/admin/fares', { brackets });
    return res.data;
  }
};

// Google Maps Proxy APIs
export const mapsService = {
  autocomplete: async (input) => {
    const res = await api.get(`/maps/autocomplete?input=${encodeURIComponent(input)}`);
    return res.data;
  },
  placeDetails: async (placeId) => {
    const res = await api.get(`/maps/place-details?placeId=${placeId}`);
    return res.data;
  },
  geocode: async (lat, lng) => {
    const res = await api.get(`/maps/geocode?lat=${lat}&lng=${lng}`);
    return res.data;
  },
  getMapsApiKey: async () => {
    const res = await api.get('/config/google-maps-key');
    return res.data;
  }
};

export default api;
