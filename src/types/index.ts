export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  uniqueCode: string; // Unique QR code for customer
  createdAt: string;
  biometricCredentialId?: string; // For biometric authentication
}

export interface StampCard {
  id: string;
  userId: string;
  cafeName: string;
  rewardDescription: string;
  stampsRequired: number;
  currentStamps: number;
  createdAt: string;
  status: 'active' | 'completed' | 'redeemed';
}

export interface Stamp {
  id: string;
  cardId: string;
  stampDate: string;
  stampCode: string;
  staffId?: string;
}

export interface CafeSettings {
  id: string;
  cafeName: string;
  stampsRequired: number;
  rewardDescription: string;
}
