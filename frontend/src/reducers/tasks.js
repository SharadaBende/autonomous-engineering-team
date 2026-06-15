// frontend/src/reducers/tasks.js

// Import necessary dependencies
import {
  TASKS_REQUEST,
  TASKS_SUCCESS,
  TASKS_FAILURE,
  TASK_REQUEST,
  TASK_SUCCESS,
  TASK_FAILURE,
  CREATE_TASK_REQUEST,
  CREATE_TASK_SUCCESS,
  CREATE_TASK_FAILURE,
  UPDATE_TASK_REQUEST,
  UPDATE_TASK_SUCCESS,
  UPDATE_TASK_FAILURE,
  DELETE_TASK_REQUEST,
  DELETE_TASK_SUCCESS,
  DELETE_TASK_FAILURE,
} from '../actions/types';

// Define the initial state for tasks
const initialState = {
  tasks: [],
  task: {},
  loading: false,
  error: null,
};

// Tasks reducer function
const tasksReducer = (state = initialState, action) => {
  switch (action.type) {
    // Get all tasks
    case TASKS_REQUEST:
      return { ...state, loading: true };
    case TASKS_SUCCESS:
      return { ...state, tasks: action.payload, loading: false };
    case TASKS_FAILURE:
      return { ...state, error: action.payload, loading: false };

    // Get a single task
    case TASK_REQUEST:
      return { ...state, loading: true };
    case TASK_SUCCESS:
      return { ...state, task: action.payload, loading: false };
    case TASK_FAILURE:
      return { ...state, error: action.payload, loading: false };

    // Create a new task
    case CREATE_TASK_REQUEST:
      return { ...state, loading: true };
    case CREATE_TASK_SUCCESS:
      return { ...state, tasks: [...state.tasks, action.payload], loading: false };
    case CREATE_TASK_FAILURE:
      return { ...state, error: action.payload, loading: false };

    // Update a task
    case UPDATE_TASK_REQUEST:
      return { ...state, loading: true };
    case UPDATE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
        loading: false,
      };
    case UPDATE_TASK_FAILURE:
      return { ...state, error: action.payload, loading: false };

    // Delete a task
    case DELETE_TASK_REQUEST:
      return { ...state, loading: true };
    case DELETE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        loading: false,
      };
    case DELETE_TASK_FAILURE:
      return { ...state, error: action.payload, loading: false };

    // Default case
    default:
      return state;
  }
};

export default tasksReducer;