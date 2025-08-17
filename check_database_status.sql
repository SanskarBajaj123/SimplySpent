-- FinTrack Database Status Checker
-- This script will show you the current state of your database

-- Check if the enum type exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as enum_status,
    'transaction_type' as enum_name;

-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN schemaname = 'public' AND tablename IN ('profiles', 'transactions', 'shared_access')
        THEN 'REQUIRED'
        ELSE 'OTHER'
    END as table_type
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check if RLS is enabled on our tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'transactions', 'shared_access')
ORDER BY tablename;

-- Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'transactions', 'shared_access')
ORDER BY tablename, policyname;

-- Check if indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'transactions', 'shared_access')
ORDER BY tablename, indexname;

-- Check if functions exist
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'handle_new_user';

-- Check if triggers exist
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'public' 
    AND c.relname IN ('users')
    AND t.tgname = 'on_auth_user_created';

-- Count records in each table (if they exist)
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles'
UNION ALL
SELECT 
    'transactions' as table_name,
    COUNT(*) as record_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'transactions'
UNION ALL
SELECT 
    'shared_access' as table_name,
    COUNT(*) as record_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'shared_access';
