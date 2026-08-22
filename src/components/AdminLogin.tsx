import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isWebAuthnSupported } from '../lib/webauthn';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [storedCredentialId, setStoredCredentialId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // Load stored credential ID on mount
  useEffect(() => {
    const storedId = localStorage.getItem('biometric_credential_id');
    if (storedId) {
      setStoredCredentialId(storedId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(formData.email, formData.password);
    
    if (!success) {
      setError('Invalid admin credentials');
      return;
    }

    navigate('/admin/dashboard');
  };

  const handleBiometricLogin = async (specificCredentialId?: string) => {
    setIsBiometricAuthenticating(true);
    setError('');

    try {
      // Authenticate with biometric (with or without specific credential ID)
      const { authenticateWithBiometric } = await import('../lib/webauthn');
      const credentialId = await authenticateWithBiometric(specificCredentialId);
      
      // Look up user by credential ID
      const { getUserByBiometricCredential } = await import('../lib/storage');
      const authUser = await getUserByBiometricCredential(credentialId);
      
      if (!authUser) {
        setError('No account found for this biometric credential. Please enable biometric login first.');
        return;
      }

      // Check if user is admin
      if (authUser.role !== 'admin') {
        setError('This biometric credential is not for an admin account.');
        return;
      }

      // Update stored credential ID
      localStorage.setItem('biometric_credential_id', credentialId);

      // Log the user in
      const loginSuccess = await login(authUser.email, authUser.phone);
      if (loginSuccess) {
        navigate('/admin/dashboard');
      } else {
        setError('Biometric authentication succeeded but login failed');
      }
    } catch (err: any) {
      console.error('Biometric login error:', err);
      setError('Biometric authentication failed. Please try again or use password login.');
    } finally {
      setIsBiometricAuthenticating(false);
    }
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

          {isWebAuthnSupported() && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-amber-600">or</span>
              </div>
            </div>
          )}

          {isWebAuthnSupported() && (
            <button
              type="button"
              onClick={() => handleBiometricLogin(storedCredentialId || undefined)}
              disabled={isBiometricAuthenticating}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white py-3 sm:py-3.5 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all text-sm sm:text-base font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBiometricAuthenticating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Biometric Login
                </>
              )}
            </button>
          )}
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
