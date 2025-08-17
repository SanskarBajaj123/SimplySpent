-- FinTrack Row Level Security Policies
-- Milestone 2: Backend Security Rules

-- Profiles table policies
-- Users can see all profiles (to find people to share with)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but good to have)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions table policies
-- Users can perform all actions on their own transactions
CREATE POLICY "Users can manage own transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id);

-- Users can view transactions shared with them
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
CREATE POLICY "Users can create sharing invitations" ON shared_access
    FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- Users can delete sharing invitations where they are the owner
CREATE POLICY "Users can delete own sharing invitations" ON shared_access
    FOR DELETE USING (auth.uid() = owner_user_id);

-- Users can view invitations where they are either owner or viewer
CREATE POLICY "Users can view relevant sharing invitations" ON shared_access
    FOR SELECT USING (
        auth.uid() = owner_user_id OR auth.uid() = viewer_user_id
    );
