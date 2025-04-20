import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Header from './components/layout/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PasswordProvider } from './context/PasswordContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, checkAuth } = useAuth();
  
  useEffect(() => {
    if (!state.isAuthenticated) {
      checkAuth();
    }
  }, [state.isAuthenticated, checkAuth]);
  
  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return state.isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

const AppRoutes: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
      <Route path="/login" element={state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Header />
            <PasswordProvider>
              <Dashboard />
            </PasswordProvider>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;