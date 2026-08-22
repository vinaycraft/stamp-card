import type { User, StampCard, Stamp, CafeSettings } from '../types';
import { supabase } from './supabase';

// User operations
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (error || !data) return [];
  
  return data.map(profile => ({
    id: profile.id,
    name: profile.name || 'User',
    email: profile.email || '',
    phone: profile.phone || '',
    role: profile.role || 'customer',
    uniqueCode: profile.unique_code,
    createdAt: profile.created_at,
  }));
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error || !data) return undefined;
  
  return {
    id: data.id,
    name: data.name || 'User',
    email: data.email || '',
    phone: data.phone || '',
    role: data.role || 'customer',
    uniqueCode: data.unique_code,
    createdAt: data.created_at,
  };
};

export const getUserByUniqueCode = async (uniqueCode: string): Promise<User | undefined> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('unique_code', uniqueCode)
    .single();
  
  if (error || !data) return undefined;
  
  return {
    id: data.id,
    name: data.name || 'User',
    email: data.email || '',
    phone: data.phone || '',
    role: data.role || 'customer',
    uniqueCode: data.unique_code,
    createdAt: data.created_at,
  };
};

// Stamp card operations
export const getUserStampCards = async (userId: string): Promise<StampCard[]> => {
  const { data, error } = await supabase
    .from('stamp_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(card => ({
    id: card.id,
    userId: card.user_id,
    cafeName: card.cafe_name,
    rewardDescription: card.reward_description,
    stampsRequired: card.stamps_required,
    currentStamps: card.current_stamps,
    status: card.status,
    createdAt: card.created_at,
  }));
};

export const saveStampCard = async (card: StampCard): Promise<void> => {
  const cardData = {
    user_id: card.userId,
    cafe_name: card.cafeName,
    reward_description: card.rewardDescription,
    stamps_required: card.stampsRequired,
    current_stamps: card.currentStamps,
    status: card.status,
  };

  if (card.id) {
    await supabase
      .from('stamp_cards')
      .update(cardData)
      .eq('id', card.id);
  } else {
    await supabase
      .from('stamp_cards')
      .insert(cardData);
  }
};

export const getStampCard = async (cardId: string): Promise<StampCard | undefined> => {
  const { data, error } = await supabase
    .from('stamp_cards')
    .select('*')
    .eq('id', cardId)
    .single();
  
  if (error || !data) return undefined;
  
  return {
    id: data.id,
    userId: data.user_id,
    cafeName: data.cafe_name,
    rewardDescription: data.reward_description,
    stampsRequired: data.stamps_required,
    currentStamps: data.current_stamps,
    status: data.status,
    createdAt: data.created_at,
  };
};

// Stamp operations
export const addStamp = async (cardId: string): Promise<void> => {
  const stampCode = generateStampCode();
  
  await supabase.from('stamps').insert({
    card_id: cardId,
    stamp_code: stampCode,
  });
  
  // Update card stamp count
  const { data: card } = await supabase
    .from('stamp_cards')
    .select('current_stamps, stamps_required')
    .eq('id', cardId)
    .single();
  
  if (card) {
    const newStamps = card.current_stamps + 1;
    const status = newStamps >= card.stamps_required ? 'completed' : 'active';
    
    await supabase
      .from('stamp_cards')
      .update({ 
        current_stamps: newStamps,
        status 
      })
      .eq('id', cardId);
  }
};

export const getCardStamps = async (cardId: string): Promise<Stamp[]> => {
  const { data, error } = await supabase
    .from('stamps')
    .select('*')
    .eq('card_id', cardId)
    .order('stamp_date', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(stamp => ({
    id: stamp.id,
    cardId: stamp.card_id,
    stampDate: stamp.stamp_date,
    stampCode: stamp.stamp_code,
  }));
};

// Cafe settings
export const getCafeSettings = async (): Promise<CafeSettings> => {
  const { data, error } = await supabase
    .from('cafe_settings')
    .select('*')
    .single();
  
  if (error || !data) {
    // Default settings
    return {
      id: 'default',
      cafeName: 'My Cafe',
      stampsRequired: 10,
      rewardDescription: 'Free coffee',
    };
  }
  
  return {
    id: data.id,
    cafeName: data.cafe_name,
    stampsRequired: data.stamps_per_card,
    rewardDescription: 'Free coffee',
  };
};

export const saveCafeSettings = async (settings: CafeSettings): Promise<void> => {
  await supabase
    .from('cafe_settings')
    .update({
      cafe_name: settings.cafeName,
      stamps_per_card: settings.stampsRequired,
    })
    .eq('id', settings.id);
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateStampCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
