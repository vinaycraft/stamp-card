import { useState } from 'react';
import { Fingerprint, X, Check, AlertCircle } from 'lucide-react';
import { registerBiometricCredential, isWebAuthnSupported } from '../lib/webauthn';
import { updateUserBiometricCredential } from '../lib/storage';

interface BiometricRegistrationProps {
  userId: string;
  userEmail: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function BiometricRegistration({
  userId,
  userEmail,
  onSuccess,
  onClose,
}: BiometricRegistrationProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!isWebAuthnSupported()) {
      setError('Biometric authentication is not supported on this device');
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      const credentialId = await registerBiometricCredential(userEmail, userId);
      
      if (credentialId) {
        await updateUserBiometricCredential(userId, credentialId);
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Biometric registration error:', err);
      setError('Failed to register biometric credential. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Enable Biometric Login
          </h2>
          <button
            onClick={onClose}
            className="text-amber-600 hover:text-amber-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!success ? (
          <>
            <div className="mb-6">
              <p className="text-amber-700 text-sm mb-4">
                Set up biometric authentication (fingerprint or face recognition) for quick and secure login.
              </p>
              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-amber-800 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 text-amber-700">
                      <li>• Your biometric data stays on your device</li>
                      <li>• Quick login without typing password</li>
                      <li>• Works with fingerprint or face recognition</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Register Biometric
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">Registration Successful!</h3>
            <p className="text-amber-700 text-sm">
              You can now use biometric authentication to log in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
