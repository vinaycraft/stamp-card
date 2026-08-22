-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users with custom fields)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  phone TEXT,
  unique_code TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stamp_cards table
CREATE TABLE IF NOT EXISTS public.stamp_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  cafe_name TEXT NOT NULL,
  reward_description TEXT NOT NULL,
  stamps_required INTEGER DEFAULT 10 NOT NULL,
  current_stamps INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'redeemed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stamps table (for tracking individual stamps)
CREATE TABLE IF NOT EXISTS public.stamps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.stamp_cards(id) ON DELETE CASCADE,
  stamp_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  stamp_code TEXT UNIQUE NOT NULL
);

-- Create cafe_settings table
CREATE TABLE IF NOT EXISTS public.cafe_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cafe_name TEXT DEFAULT 'My Cafe',
  stamps_per_card INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default cafe settings
INSERT INTO public.cafe_settings (cafe_name, stamps_per_card)
VALUES ('My Cafe', 10)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_unique_code ON public.user_profiles(unique_code);
CREATE INDEX IF NOT EXISTS idx_stamp_cards_user_id ON public.stamp_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_card_id ON public.stamps(card_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for stamp_cards
CREATE POLICY "Users can view their own cards"
  ON public.stamp_cards FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cards"
  ON public.stamp_cards FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cards"
  ON public.stamp_cards FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all cards"
  ON public.stamp_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all cards"
  ON public.stamp_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for stamps
CREATE POLICY "Users can view stamps for their cards"
  ON public.stamps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stamp_cards 
      WHERE stamp_cards.id = stamps.card_id AND stamp_cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all stamps"
  ON public.stamps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create stamps"
  ON public.stamps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for cafe_settings (public read, admin write)
CREATE POLICY "Anyone can view cafe settings"
  ON public.cafe_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update cafe settings"
  ON public.cafe_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, unique_code, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'USR-' || substr(md5(random()::text), 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stamp_cards_updated_at BEFORE UPDATE ON public.stamp_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cafe_settings_updated_at BEFORE UPDATE ON public.cafe_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
