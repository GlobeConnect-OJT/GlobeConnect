import axios from 'axios';

const API_URL = 'http://localhost:5000/api/favorites';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add location to favorites
export const addToFavorites = async (locationData) => {
  const response = await axios.post(API_URL, locationData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Remove location from favorites
export const removeFromFavorites = async (favoriteId) => {
  const response = await axios.delete(`${API_URL}/${favoriteId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Get all user favorites
export const getFavorites = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Check if location is in favorites
export const checkFavorite = async (latitude, longitude) => {
  const response = await axios.get(`${API_URL}/check/${latitude}/${longitude}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}; 