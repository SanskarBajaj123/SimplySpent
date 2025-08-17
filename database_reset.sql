-- SimplySpent Complete Database Reset
-- This script will completely reset the database and recreate all objects

-- Drop all existing objects in the correct order
-- First, drop tables that depend on the enum
DROP TABLE IF EXISTS shared_access CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop the enum type
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Now recreate everything from scratch

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles table policies
-- Users can see all profiles (to find people to share with)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but good to have)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions table policies
-- Users can perform all actions on their own transactions
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id);

-- Users can view transactions shared with them
DROP POLICY IF EXISTS "Users can view shared transactions" ON transactions;
CREATE POLICY "Users can view shared transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_access 
            WHERE viewer_user_id = auth.uid() 
            AND owner_user_id = transactions.user_id
        )
    );

-- Shared access table policies
-- Users can create sharing invitations where they are the owner
DROP POLICY IF EXISTS "Users can create sharing invitations" ON shared_access;
CREATE POLICY "Users can create sharing invitations" ON shared_access
    FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- Users can delete sharing invitations where they are the owner
DROP POLICY IF EXISTS "Users can delete own sharing invitations" ON shared_access;
CREATE POLICY "Users can delete own sharing invitations" ON shared_access
    FOR DELETE USING (auth.uid() = owner_user_id);

-- Users can view invitations where they are either owner or viewer
DROP POLICY IF EXISTS "Users can view relevant sharing invitations" ON shared_access;
CREATE POLICY "Users can view relevant sharing invitations" ON shared_access
    FOR SELECT USING (
        auth.uid() = owner_user_id OR auth.uid() = viewer_user_id
    );

-- Insert some sample data for testing (optional)
-- You can comment out or remove this section if you don't want sample data

-- Sample profiles (these will be created automatically when users sign up)
-- Sample transactions (these will be created by users)

-- Display confirmation
SELECT 'Database reset completed successfully!' as status;
