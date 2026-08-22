import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  if (!isAuthenticated) {
    return (
      <div>
        <LoginForm />
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-cafe-brown hover:text-cafe-dark transition-colors"
          >
            Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/*"
          element={
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
