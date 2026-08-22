import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is logged in and has admin role, navigate to dashboard
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(formData.email, formData.password);
    
    if (!success) {
      setError('Invalid admin credentials');
      return;
    }

    // Check if user has admin role
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-800 to-amber-900 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-amber-50" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-amber-900 text-center mb-2">
            Admin Panel
          </h1>
          <p className="text-sm text-amber-600 text-center">
            Manage stamp cards and customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-0 py-2 sm:py-3 border-0 border-b border-amber-200 focus:border-amber-800 focus:ring-0 bg-transparent text-amber-900 placeholder-amber-400 transition-colors text-base"
              placeholder="Email"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-0 py-2 sm:py-3 border-0 border-b border-amber-200 focus:border-amber-800 focus:ring-0 bg-transparent text-amber-900 placeholder-amber-400 transition-colors text-base"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-800 to-amber-900 text-white py-3 sm:py-3.5 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all text-sm sm:text-base font-semibold shadow-md"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-amber-600 hover:text-amber-900 transition-colors"
          >
            Back to Customer Login
          </button>
        </div>
      </div>
    </div>
  );
}
