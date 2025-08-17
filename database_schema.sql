-- FinTrack Database Schema
-- Milestone 1: Supabase Setup & Database Schema

-- Create custom enum type for transaction types
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    transaction_type transaction_type NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create shared_access table
CREATE TABLE shared_access (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    viewer_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_user_id, viewer_user_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_access ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_shared_access_owner ON shared_access(owner_user_id);
CREATE INDEX idx_shared_access_viewer ON shared_access(viewer_user_id);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
