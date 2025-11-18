import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Login, Signup } from './Components/auth';
import Chat from './pages/Chat';
import { AuthProvider, AuthContext } from './context/AuthContext';
import theme from './theme/theme';
import GlobalStyles from './theme/GlobalStyles';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Auth Layout Component that handles switching between Login and Signup
const AuthLayout = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isLogin ? <Login onToggleMode={handleToggleMode} /> : <Signup onToggleMode={handleToggleMode} />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthLayout />} />
            <Route path="/signup" element={<AuthLayout />} />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;