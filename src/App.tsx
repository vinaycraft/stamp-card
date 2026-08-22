import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function AdminLoginWrapper() {
  return (
    <AuthProvider>
      <AdminLogin />
    </AuthProvider>
  );
}

function CustomerRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}

function AdminRoutes() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLoginWrapper />} />
        <Route
          path="/*"
          element={
            <AuthProvider>
              <Routes>
                <Route path="/admin/dashboard" element={<AdminRoutes />} />
                <Route path="/*" element={<CustomerRoutes />} />
              </Routes>
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
