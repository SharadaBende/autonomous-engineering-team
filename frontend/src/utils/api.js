import axios from 'axios';

// Set the base URL for the API
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Create a new instance of axios with the base URL
const api = axios.create({
  baseURL: apiBaseUrl,
});

// Set the headers for the API requests
api.defaults.headers.common['Content-Type'] = 'application/json';

// Function to handle API errors
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(`API Error: ${error.response.status} ${error.response.statusText}`);
    console.error(error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error: No response received');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
  }
  throw error;
};

// Function to make a GET request to the API
const get = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Function to make a POST request to the API
const post = async (endpoint, data) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Function to make a PUT request to the API
const put = async (endpoint, data) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Function to make a DELETE request to the API
const remove = async (endpoint) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Export the API functions
export { get, post, put, remove };