# 🚀 SimplySpent Deployment Guide

This guide will walk you through deploying your SimplySpent application to GitHub and Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Supabase project already set up
- Node.js and npm installed

## 🔧 Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
       - **Repository name**: `simply-spent` (or your preferred name)
    - **Description**: "Personal Finance Tracker - Track income, expenses, and get detailed analytics"
   - **Visibility**: Choose Public or Private
   - **Initialize with**: Don't initialize (we'll push existing code)
5. Click "Create repository"

### 1.2 Push Code to GitHub

Run these commands in your project directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FinTrack Personal Finance Tracker"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/simply-spent.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Vercel Deployment

### 2.1 Connect to Vercel

1. Go to [Vercel](https://vercel.com) and sign in (you can use GitHub to sign in)
2. Click "New Project"
3. Import your GitHub repository:
   - Select "Import Git Repository"
       - Find and select your `simply-spent` repository
   - Click "Import"

### 2.2 Configure Project Settings

1. **Framework Preset**: Select "Vite"
2. **Root Directory**: Leave as default (or set to `fin-track-web` if needed)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 2.3 Environment Variables

Add these environment variables in Vercel:

1. Click "Environment Variables" section
2. Add the following variables:

```
VITE_SUPABASE_URL=https://bxlkhxstrdnccqcacarg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bGtoeHN0cmRuY2NxY2FjYXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDM5NzUsImV4cCI6MjA3MTAxOTk3NX0.cvPpA9pc5x-6O48WR5MKTDhJLHi7kNegTnE0Hl3qcDw
```

3. Set **Environment**: Production, Preview, and Development
4. Click "Add"

### 2.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at a URL like: `https://simply-spent-xxxxx.vercel.app`

## 🔄 Step 3: Continuous Deployment

### 3.1 Automatic Deployments

Vercel will automatically deploy your app whenever you push changes to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature: Add new analytics charts"
git push origin main
```

### 3.2 Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions

## 📱 Step 4: Mobile App Deployment (Optional)

### 4.1 Expo Deployment

If you want to deploy the mobile app:

```bash
cd fin-track-mobile

# Install Expo CLI globally
npm install -g @expo/cli

# Login to Expo
expo login

# Build for production
expo build:web

# Deploy to Expo
expo publish
```

## 🔍 Step 5: Testing Your Deployment

### 5.1 Test Checklist

- [ ] ✅ App loads without errors
- [ ] ✅ Authentication works (sign up/sign in)
- [ ] ✅ Can add transactions
- [ ] ✅ Dashboard shows data correctly
- [ ] ✅ Analytics charts render properly
- [ ] ✅ Mobile responsive design works
- [ ] ✅ Navigation between pages works

### 5.2 Common Issues & Solutions

**Issue**: App shows blank page
- **Solution**: Check environment variables in Vercel
- **Solution**: Verify Supabase URL and API key

**Issue**: Charts not loading
- **Solution**: Check browser console for errors
- **Solution**: Verify Chart.js dependencies are installed

**Issue**: Authentication not working
- **Solution**: Check Supabase Auth settings
- **Solution**: Verify redirect URLs in Supabase

## 🛠️ Step 6: Production Optimizations

### 6.1 Performance Optimization

1. **Enable Vercel Analytics** (optional)
2. **Set up caching headers** in Vercel
3. **Optimize images** and assets
4. **Enable compression**

### 6.2 Security

1. **Set up Content Security Policy** (CSP)
2. **Enable HTTPS** (automatic with Vercel)
3. **Review Supabase RLS policies**

## 📊 Step 7: Monitoring

### 7.1 Vercel Analytics

1. Go to your Vercel project dashboard
2. Click "Analytics" tab
3. Enable analytics to track:
   - Page views
   - Performance metrics
   - Error rates

### 7.2 Supabase Monitoring

1. Go to your Supabase dashboard
2. Check "Logs" for any errors
3. Monitor database performance

## 🔄 Step 8: Updates and Maintenance

### 8.1 Regular Updates

```bash
# Update dependencies
npm update

# Test locally
npm run dev

# Commit and push
git add .
git commit -m "Update dependencies"
git push origin main
```

### 8.2 Database Backups

1. In Supabase dashboard, go to "Settings" → "Database"
2. Set up automated backups
3. Export data periodically

## 🎉 Congratulations!

Your SimplySpent application is now live and ready to use! 

### Quick Links:
- **Live App**: Your Vercel URL
- **GitHub Repository**: Your GitHub repo URL
- **Supabase Dashboard**: Your Supabase project
- **Vercel Dashboard**: Your Vercel project

### Next Steps:
1. Share your app with friends and family
2. Add more features (budget tracking, export functionality)
3. Set up monitoring and analytics
4. Consider adding a custom domain

---

**Need Help?**
- Check the [Vercel Documentation](https://vercel.com/docs)
- Review [Supabase Documentation](https://supabase.com/docs)
- Create issues in your GitHub repository

**Happy Coding! 🚀**
