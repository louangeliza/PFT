import axios from 'axios';

// MockAPI base URL - Replace with your MockAPI URL after creating the resources
const BASE_URL = 'https://YOUR_MOCKAPI_ID.mockapi.io/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  // Parking lots endpoints
  PARKING_LOTS: {
    LIST: '/parking-lots',
    DETAILS: (id) => `/parking-lots/${id}`,
  },
  // Bookings endpoints
  BOOKINGS: {
    CREATE: '/bookings',
    LIST: '/bookings',
    DETAILS: (id) => `/bookings/${id}`,
    UPDATE: (id) => `/bookings/${id}`,
  },
  // User endpoints
  USERS: {
    PROFILE: '/users/profile',
    HISTORY: '/users/history',
  },
};

export default api; 