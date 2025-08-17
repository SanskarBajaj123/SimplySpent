# FinTrack Database Setup Guide

## 🚨 Current Issue
You're getting the error: `ERROR: 42710: type "transaction_type" already exists`

This means the database objects were partially created before. We need to completely reset the database.

## 🔧 Solution: Complete Database Reset

### Step 1: Check Current Database Status
First, run the status checker to see what's currently in your database:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `check_database_status.sql`
4. Run the query to see what objects exist

### Step 2: Complete Database Reset
Now run the complete reset script:

1. In the **SQL Editor**, copy and paste the contents of `database_reset.sql`
2. Run the script
3. You should see: `Database reset completed successfully!`

## 📋 What the Reset Script Does

The `database_reset.sql` script will:

### 1. **Clean Up Existing Objects**
- Drop all tables (`profiles`, `transactions`, `shared_access`)
- Drop the `transaction_type` enum
- Drop the `handle_new_user` function
- Drop all existing policies

### 2. **Recreate Everything Fresh**
- Create the `transaction_type` enum
- Create all three tables with proper relationships
- Enable Row Level Security (RLS) on all tables
- Create performance indexes
- Create the user registration trigger function
- Create all RLS policies for security

### 3. **Database Schema Overview**

#### Tables Created:
- **`profiles`**: User profile information
- **`transactions`**: Income and expense records
- **`shared_access`**: Data sharing permissions

#### Security Features:
- **Row Level Security (RLS)** enabled on all tables
- **User-specific data access** - users only see their own data
- **Shared data access** - users can view shared transactions
- **Automatic profile creation** when users sign up

## ✅ Verification Steps

After running the reset script, verify everything is working:

### 1. Check Tables Exist
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'transactions', 'shared_access');
```

### 2. Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'transactions', 'shared_access');
```

### 3. Check Policies Exist
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'transactions', 'shared_access');
```

## 🚀 Next Steps

Once the database is set up:

1. **Web App Setup**:
   ```bash
   cd fin-track-web
   npm install
   # Create .env with your Supabase credentials
   npm run dev
   ```

2. **Mobile App Setup**:
   ```bash
   cd fin-track-mobile
   npm install
   # Create .env with your Supabase credentials
   npm start
   ```

## 🔧 Environment Variables

### Web App (.env in fin-track-web/)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Mobile App (.env in fin-track-mobile/)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🆘 Troubleshooting

### If you still get errors:
1. **Check Supabase permissions** - Make sure you're using the correct database role
2. **Verify project settings** - Ensure you're in the right Supabase project
3. **Check for syntax errors** - Copy the SQL exactly as provided
4. **Contact support** - If issues persist, check the Supabase documentation

### Common Issues:
- **Permission denied**: Make sure you're using the correct database role
- **Connection issues**: Verify your Supabase URL and keys
- **Schema conflicts**: The reset script should handle all conflicts

## 📞 Support

If you encounter any issues:
1. Check the Supabase documentation
2. Review the error messages carefully
3. Ensure you're following the steps exactly
4. The reset script is designed to handle all common issues

---

**Note**: The reset script will completely clear your database. If you have any existing data you want to keep, make sure to back it up first!
