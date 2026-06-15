import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ArticleList component
const ArticleList = () => {
  // State to store the list of articles
  const [articles, setArticles] = useState([]);
  // State to store the error message
  const [error, setError] = useState(null);
  // State to store the loading status
  const [loading, setLoading] = useState(true);

  // Function to fetch articles from the backend API
  const fetchArticles = async () => {
    try {
      // Make a GET request to the backend API to fetch articles
      const response = await axios.get('/api/articles');
      // Set the articles state with the response data
      setArticles(response.data);
      // Set the loading state to false
      setLoading(false);
    } catch (error) {
      // Set the error state with the error message
      setError(error.message);
      // Set the loading state to false
      setLoading(false);
    }
  };

  // Use effect to fetch articles when the component mounts
  useEffect(() => {
    fetchArticles();
  }, []);

  // Render the article list
  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.id}>
              <h2>{article.title}</h2>
              <p>{article.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArticleList;