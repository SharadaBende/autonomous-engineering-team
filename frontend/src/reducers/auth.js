// frontend/src/reducers/auth.js

// Import necessary libraries and constants
import { AUTH_LOGIN_REQUEST, AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILURE, AUTH_LOGOUT } from '../actions/types';

// Define the initial state for the auth reducer
const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
};

// Define the auth reducer function
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // Handle login request
    case AUTH_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    // Handle login success
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      };

    // Handle login failure
    case AUTH_LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // Handle logout
    case AUTH_LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    // Default case for unknown actions
    default:
      return state;
  }
};

// Export the auth reducer
export default authReducer;