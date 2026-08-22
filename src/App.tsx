import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

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
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoutes />} />
          <Route path="/*" element={<CustomerRoutes />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
