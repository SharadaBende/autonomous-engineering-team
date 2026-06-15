import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Tasks component
const Tasks = () => {
  // State to store tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks from backend API
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (task) => {
    try {
      const response = await axios.post('/api/tasks', task);
      setTasks([...tasks, response.data]);
    } catch (error) {
      setError(error.message);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      setError(error.message);
    }
  };

  // Update task
  const updateTask = async (task) => {
    try {
      const response = await axios.put(`/api/tasks/${task.id}`, task);
      setTasks(tasks.map((t) => (t.id === task.id ? response.data : t)));
    } catch (error) {
      setError(error.message);
    }
  };

  // Use effect to fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Render tasks
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => updateTask({ ...task, completed: !task.completed })}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const task = { title: event.target.title.value, completed: false };
          addTask(task);
          event.target.title.value = '';
        }}
      >
        <input type="text" name="title" placeholder="Add new task" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default Tasks;