// frontend/src/actions/tasks.js

import axios from 'axios';

// Define the base URL for the API
const API_URL = 'http://localhost:3001/api';

// Define the action types
export const GET_TASKS_REQUEST = 'GET_TASKS_REQUEST';
export const GET_TASKS_SUCCESS = 'GET_TASKS_SUCCESS';
export const GET_TASKS_FAILURE = 'GET_TASKS_FAILURE';

export const CREATE_TASK_REQUEST = 'CREATE_TASK_REQUEST';
export const CREATE_TASK_SUCCESS = 'CREATE_TASK_SUCCESS';
export const CREATE_TASK_FAILURE = 'CREATE_TASK_FAILURE';

export const UPDATE_TASK_REQUEST = 'UPDATE_TASK_REQUEST';
export const UPDATE_TASK_SUCCESS = 'UPDATE_TASK_SUCCESS';
export const UPDATE_TASK_FAILURE = 'UPDATE_TASK_FAILURE';

export const DELETE_TASK_REQUEST = 'DELETE_TASK_REQUEST';
export const DELETE_TASK_SUCCESS = 'DELETE_TASK_SUCCESS';
export const DELETE_TASK_FAILURE = 'DELETE_TASK_FAILURE';

// Get all tasks
export const getTasks = () => {
  return async dispatch => {
    dispatch({ type: GET_TASKS_REQUEST });
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      dispatch({ type: GET_TASKS_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: GET_TASKS_FAILURE, payload: error.message });
    }
  };
};

// Create a new task
export const createTask = task => {
  return async dispatch => {
    dispatch({ type: CREATE_TASK_REQUEST });
    try {
      const response = await axios.post(`${API_URL}/tasks`, task);
      dispatch({ type: CREATE_TASK_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: CREATE_TASK_FAILURE, payload: error.message });
    }
  };
};

// Update a task
export const updateTask = task => {
  return async dispatch => {
    dispatch({ type: UPDATE_TASK_REQUEST });
    try {
      const response = await axios.put(`${API_URL}/tasks/${task.id}`, task);
      dispatch({ type: UPDATE_TASK_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: UPDATE_TASK_FAILURE, payload: error.message });
    }
  };
};

// Delete a task
export const deleteTask = taskId => {
  return async dispatch => {
    dispatch({ type: DELETE_TASK_REQUEST });
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      dispatch({ type: DELETE_TASK_SUCCESS, payload: taskId });
    } catch (error) {
      dispatch({ type: DELETE_TASK_FAILURE, payload: error.message });
    }
  };
};