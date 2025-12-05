
import React from 'react';
import { Switch, Route } from 'react-router-dom';
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
            <Switch>
              <Route path="/admin" component={AdminView} />
              <Route path="/" component={UserView} />
            </Switch>
          </div>
        </ThemeProvider>
      </PortfolioProvider>
    </AuthProvider>
  );
}

export default App;
