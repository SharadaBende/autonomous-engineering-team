import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Header component
const Header = () => {
  // State to store user data
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Navigate function from react-router-dom
  const navigate = useNavigate();

  // Effect to fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Make API call to fetch user data
        const response = await axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        // Handle error
        setError(error.message);
      }
    };
    fetchUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Make API call to logout
      await axios.post('/api/logout');
      // Remove user data from state
      setUser(null);
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      // Handle error
      setError(error.message);
    }
  };

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          {user ? (
            <li>
              <Link to="/dashboard">{user.name}</Link>
              <button onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </header>
  );
};

export default Header;