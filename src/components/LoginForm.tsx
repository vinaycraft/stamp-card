import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Coffee, Fingerprint } from 'lucide-react';
import { isWebAuthnSupported } from '../lib/webauthn';

export default function LoginForm() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [fallbackEmail, setFallbackEmail] = useState('');

  const handleBiometricLogin = async (specificCredentialId?: string) => {
    setIsBiometricAuthenticating(true);
    setError('');

    try {
      // Authenticate with biometric (with or without specific credential ID)
      const { authenticateWithBiometric } = await import('../lib/webauthn');
      const credentialId = await authenticateWithBiometric(specificCredentialId);
      
      // Look up user by credential ID
      const { getUserByBiometricCredential } = await import('../lib/storage');
      const user = await getUserByBiometricCredential(credentialId);
      
      if (!user) {
        setError('No account found for this biometric credential. Please enable biometric login first.');
        return;
      }

      // Store credential ID for future use
      localStorage.setItem('last_biometric_credential_id', credentialId);

      // Log the user in
      const loginSuccess = await login(user.email, user.phone);
      if (loginSuccess) {
        navigate('/dashboard');
      } else {
        setError('Biometric authentication succeeded but login failed');
      }
    } catch (err: any) {
      console.error('Biometric login error:', err);
      
      // If error is about no passkey available, show email fallback
      if (err.message?.includes('no passkey') || err.name === 'NotAllowedError') {
        setShowEmailFallback(true);
        setError('No passkey found. Please enter your email to use your registered biometric credential.');
      } else {
        setError('Biometric authentication failed. Please try again or use password login.');
      }
    } finally {
      setIsBiometricAuthenticating(false);
    }
  };

  const handleEmailFallbackLogin = async () => {
    if (!fallbackEmail.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsBiometricAuthenticating(true);
    setError('');

    try {
      // Get user by email to find their credential ID
      const { getUserByEmail } = await import('../lib/storage');
      const user = await getUserByEmail(fallbackEmail.trim());
      
      if (!user || !user.biometricCredentialId) {
        setError('No biometric credentials found for this email. Please enable biometric login first.');
        setIsBiometricAuthenticating(false);
        return;
      }

      // Authenticate with specific credential ID
      await handleBiometricLogin(user.biometricCredentialId);
    } catch (err) {
      console.error('Email fallback error:', err);
      setError('Failed to authenticate. Please try password login.');
      setIsBiometricAuthenticating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (!success) {
        setError('Invalid email or password');
      }
    } else {
      const success = await register(formData.name, formData.email, formData.phone, formData.password);
      if (!success) {
        setError('Email already registered');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-800 to-amber-900 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6 sm:w-7 sm:h-7 text-amber-50" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-amber-900 text-center mb-2">
            {isLogin ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-sm text-amber-600 text-center">
            {isLogin ? 'Welcome back' : 'Start earning rewards'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {!isLogin && (
            <div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-0 py-2 sm:py-3 border-0 border-b border-amber-200 focus:border-amber-800 focus:ring-0 bg-transparent text-amber-900 placeholder-amber-400 transition-colors text-base"
                placeholder="Full name"
              />
            </div>
          )}

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

          {!isLogin && (
            <div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-0 py-2 sm:py-3 border-0 border-b border-amber-200 focus:border-amber-800 focus:ring-0 bg-transparent text-amber-900 placeholder-amber-400 transition-colors text-base"
                placeholder="Phone (optional)"
              />
            </div>
          )}

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
            {isLogin ? 'Continue' : 'Create account'}
          </button>

          {isLogin && isWebAuthnSupported() && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-amber-600">or</span>
              </div>
            </div>
          )}

          {isLogin && isWebAuthnSupported() && (
            <>
              <button
                type="button"
                onClick={() => handleBiometricLogin()}
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

              {showEmailFallback && (
                <div className="mt-4 space-y-3">
                  <input
                    type="email"
                    value={fallbackEmail}
                    onChange={(e) => setFallbackEmail(e.target.value)}
                    className="w-full px-0 py-2 sm:py-3 border-0 border-b border-amber-200 focus:border-amber-800 focus:ring-0 bg-transparent text-amber-900 placeholder-amber-400 transition-colors text-base"
                    placeholder="Enter your email"
                  />
                  <button
                    type="button"
                    onClick={handleEmailFallbackLogin}
                    disabled={isBiometricAuthenticating}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 sm:py-3.5 rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all text-sm sm:text-base font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBiometricAuthenticating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Use Email for Biometric'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-amber-600 hover:text-amber-900 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
          <div className="mt-3 sm:mt-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-xs text-amber-500 hover:text-amber-900 transition-colors"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
