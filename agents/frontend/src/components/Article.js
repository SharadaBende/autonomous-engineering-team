import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Article component
 * 
 * Displays a single article with its title, content, and author
 */
const Article = ({ articleId }) => {
  // State to store the article data
  const [article, setArticle] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect to fetch the article data when the component mounts
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Make a GET request to the backend to fetch the article data
        const response = await axios.get(`/api/articles/${articleId}`);
        setArticle(response.data);
      } catch (error) {
        // Handle any errors that occur during the fetch
        setError(error.message);
      } finally {
        // Set loading to false after the fetch is complete
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  // Render the article data if it's available
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <p>Author: {article.author}</p>
      <p>{article.content}</p>
    </div>
  );
};

export default Article;