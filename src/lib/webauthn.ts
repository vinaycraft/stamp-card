// WebAuthn utility functions for biometric authentication

// Convert ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Check if WebAuthn is supported
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'navigator' in window &&
    'credentials' in navigator &&
    (window as any).PublicKeyCredential !== undefined
  );
}

// Register a new biometric credential
export async function registerBiometricCredential(
  username: string,
  userId: string
): Promise<string | null> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device');
  }

  // Convert user ID to Uint8Array
  const userIdBuffer = new TextEncoder().encode(userId);

  const credentialCreationOptions: CredentialCreationOptions = {
    publicKey: {
      challenge: new Uint8Array(32),
      rp: {
        name: 'Stamp Card App',
        id: window.location.hostname,
      },
      user: {
        id: userIdBuffer,
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7, // ES256
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
      timeout: 60000,
    },
  };

  try {
    const credential = await navigator.credentials.create(credentialCreationOptions);
    
    if (!credential) {
      throw new Error('Credential creation failed');
    }

    const publicKeyCredential = credential as PublicKeyCredential;
    
    // Get the credential ID
    const credentialId = arrayBufferToBase64(publicKeyCredential.rawId);
    
    return credentialId;
  } catch (error) {
    console.error('Biometric registration error:', error);
    throw error;
  }
}

// Authenticate with existing biometric credential
export async function authenticateWithBiometric(
  credentialId: string
): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device');
  }

  const credentialRequestOptions: CredentialRequestOptions = {
    publicKey: {
      challenge: new Uint8Array(32),
      allowCredentials: [
        {
          type: 'public-key',
          id: base64ToArrayBuffer(credentialId),
        },
      ],
      userVerification: 'preferred',
      timeout: 60000,
    },
  };

  try {
    const credential = await navigator.credentials.get(credentialRequestOptions);
    
    if (!credential) {
      throw new Error('Authentication failed');
    }

    return true;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    throw error;
  }
}
