// frontend/src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Try-catch block for error handling
  try {
    return (
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>About Us</h5>
              <p>
                BlogMaster is a blogging platform where users can create and share their thoughts and ideas.
              </p>
            </div>
            <div className="col-md-4">
              <h5>Quick Links</h5>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>Follow Us</h5>
              <ul>
                <li>
                  <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <p>
                &copy; {new Date().getFullYear()} BlogMaster. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    // Log the error and return a fallback component
    console.error('Error rendering Footer component:', error);
    return <div>Error rendering Footer component</div>;
  }
};

export default Footer;