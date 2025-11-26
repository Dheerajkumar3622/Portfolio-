
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserView from './views/UserView';
import AdminView from './views/AdminView';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <ThemeProvider>
          <div className="font-sans transition-colors duration-300">
            <Routes>
              <Route path="/admin" element={<AdminView />} />
              <Route path="/" element={<UserView />} />
            </Routes>
          </div>
        </ThemeProvider>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;
