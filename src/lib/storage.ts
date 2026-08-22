import type { User, StampCard, Stamp, CafeSettings } from '../types';

const STORAGE_KEYS = {
  USERS: 'stampcard_users',
  CARDS: 'stampcard_cards',
  STAMPS: 'stampcard_stamps',
  SETTINGS: 'stampcard_settings',
  CURRENT_USER: 'stampcard_current_user',
};

// User operations
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email === email);
};

export const getUserByUniqueCode = (uniqueCode: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.uniqueCode === uniqueCode);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Stamp card operations
export const getStampCards = (): StampCard[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CARDS);
  return data ? JSON.parse(data) : [];
};

export const saveStampCard = (card: StampCard): void => {
  const cards = getStampCards();
  const existingIndex = cards.findIndex(c => c.id === card.id);
  if (existingIndex >= 0) {
    cards[existingIndex] = card;
  } else {
    cards.push(card);
  }
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
};

export const getUserStampCards = (userId: string): StampCard[] => {
  const cards = getStampCards();
  return cards.filter(c => c.userId === userId);
};

export const getStampCard = (cardId: string): StampCard | undefined => {
  const cards = getStampCards();
  return cards.find(c => c.id === cardId);
};

// Stamp operations
export const getStamps = (): Stamp[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STAMPS);
  return data ? JSON.parse(data) : [];
};

export const saveStamp = (stamp: Stamp): void => {
  const stamps = getStamps();
  stamps.push(stamp);
  localStorage.setItem(STORAGE_KEYS.STAMPS, JSON.stringify(stamps));
};

export const getCardStamps = (cardId: string): Stamp[] => {
  const stamps = getStamps();
  return stamps.filter(s => s.cardId === cardId);
};

// Cafe settings
export const getCafeSettings = (): CafeSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (data) {
    return JSON.parse(data);
  }
  // Default settings
  const defaultSettings: CafeSettings = {
    id: 'default',
    cafeName: 'My Cafe',
    stampsRequired: 10,
    rewardDescription: 'Free coffee',
  };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  return defaultSettings;
};

export const saveCafeSettings = (settings: CafeSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateStampCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
