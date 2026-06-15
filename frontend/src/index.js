import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();

if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
} else {
  console.log('Running in production mode');
}

window.addEventListener('error', (event) => {
  console.error('Error occurred:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection occurred:', event.reason);
});