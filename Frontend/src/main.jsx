// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx'; // Import the provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider> {/* Wrap the App component */}
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);