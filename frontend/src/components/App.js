import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoList from './TodoList';
import TodoForm from './TodoForm';

function App() {
  // State to store todos
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos from backend API on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('/api/todos');
        setTodos(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  // Handle adding new todo
  const handleAddTodo = async (newTodo) => {
    try {
      const response = await axios.post('/api/todos', newTodo);
      setTodos([...todos, response.data]);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle deleting todo
  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle updating todo
  const handleUpdateTodo = async (updatedTodo) => {
    try {
      const response = await axios.put(`/api/todos/${updatedTodo.id}`, updatedTodo);
      setTodos(todos.map((todo) => (todo.id === updatedTodo.id ? response.data : todo)));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Todo App</h1>
      <TodoForm handleAddTodo={handleAddTodo} />
      <TodoList todos={todos} handleDeleteTodo={handleDeleteTodo} handleUpdateTodo={handleUpdateTodo} />
    </div>
  );
}

export default App;