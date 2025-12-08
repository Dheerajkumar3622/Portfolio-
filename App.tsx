import React, { useState, useEffect } from 'react';
import UserView from './views/UserView';
import AdminView from './views/AdminView';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const getView = () => {
    // Normalize hash: #/admin -> /admin
    const path = currentPath.replace(/^#/, '') || '/';
    // Handle both /admin and /admin/ (trailing slash)
    if (path === '/admin' || path === '/admin/') {
      return <AdminView />;
    }
    return <UserView />;
  };

  return (
    <AuthProvider>
      <PortfolioProvider>
        <ThemeProvider>
          <div className="font-sans transition-colors duration-300">
            {getView()}
          </div>
        </ThemeProvider>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;