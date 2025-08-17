# SimplySpent - Expense Tracker Application

A complete, full-stack expense tracker application with web and mobile support, built with React, React Native, and Supabase.

## 🚀 Features

- **User Authentication**: Secure sign up/sign in with Supabase Auth
- **Transaction Management**: Add, view, and categorize income and expenses
- **Financial Analytics**: Monthly summaries with charts and metrics
- **Data Sharing**: Share transaction data with other users
- **Cross-Platform**: Web app (React) and mobile app (React Native)
- **Real-time Updates**: Live data synchronization with Supabase

## 🛠 Technology Stack

### Backend & Database
- **Supabase**: PostgreSQL database, authentication, and auto-generated APIs
- **Row Level Security (RLS)**: Secure data access policies

### Web App
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router** for navigation
- **Headless UI** for accessible components
- **Recharts** for data visualization

### Mobile App
- **React Native** with Expo for cross-platform development
- **React Navigation** for mobile navigation
- **Expo Vector Icons** for consistent iconography

## 📁 Project Structure

```
SimplySpent/
├── database_schema.sql          # Database schema and setup
├── rls_policies.sql            # Row Level Security policies
├── setup_commands.md           # Web app setup instructions
├── mobile_setup_commands.md    # Mobile app setup instructions
├── simply-spent-web/           # Web application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── supabaseClient.js  # Supabase configuration
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # App entry point
│   ├── package.json
│   └── README.md
└── simply-spent-mobile/        # Mobile application
    ├── src/
    │   ├── components/         # Mobile components
    │   ├── screens/           # Screen components
    │   ├── navigation/        # Navigation setup
    │   └── supabaseClient.js  # Supabase configuration
    ├── App.js                 # Main app component
    └── package.json
```

## 🗄 Database Schema

The application uses three main tables:

### `profiles`
- User profile information linked to Supabase Auth
- Username, avatar URL, and creation timestamp

### `transactions`
- Core transaction data with amount, type, category, and notes
- Supports both income and expense types
- Includes transaction dates and user associations

### `shared_access`
- Manages data sharing permissions between users
- Owner-viewer relationships with timestamps

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User-specific data access** - users can only access their own data
- **Shared data access** - users can view shared transactions
- **Secure authentication** via Supabase Auth

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Expo CLI (for mobile development)

### 1. Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in order:
   ```sql
   -- First, run the schema
   \i database_schema.sql
   
   -- Then, run the RLS policies
   \i rls_policies.sql
   ```

### 2. Web App Setup

1. Navigate to the web app directory:
   ```bash
   cd fin-track-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   # Create .env file
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Mobile App Setup

1. Navigate to the mobile app directory:
   ```bash
   cd fin-track-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   # Create .env file
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the Expo development server:
   ```bash
   npm start
   ```

## 📱 App Features

### Web App Features
- **Dashboard**: Overview of monthly income, expenses, and balance
- **Transaction Management**: Add, view, and categorize transactions
- **Metrics**: Interactive charts showing expense breakdown and trends
- **Profile Management**: User settings and data sharing controls
- **Responsive Design**: Works on desktop, tablet, and mobile browsers

### Mobile App Features
- **Native Experience**: Optimized for mobile devices
- **Bottom Navigation**: Easy access to Dashboard, Metrics, and Profile
- **Floating Action Button**: Quick access to add transactions
- **Pull-to-Refresh**: Update data with a simple gesture
- **Offline Support**: Basic offline functionality with Expo

## 🔧 Development

### Web App Development
```bash
cd fin-track-web
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Mobile App Development
```bash
cd fin-track-mobile
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
```

## 📊 API Endpoints

The application uses Supabase's auto-generated REST API:

- `GET /transactions` - Fetch user transactions
- `POST /transactions` - Create new transaction
- `GET /profiles` - Fetch user profiles
- `POST /shared_access` - Share data with another user
- `DELETE /shared_access` - Revoke data sharing

## 🚀 Deployment

### Web App Deployment
The web app is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Mobile App Deployment
The mobile app can be deployed using Expo:

1. Build the app: `expo build:android` or `expo build:ios`
2. Submit to app stores using Expo's build service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


## 🆘 Support

For support and questions:
- Check the documentation in each app's README
- Review the Supabase documentation
- Open an issue in the repository

## 🎯 Roadmap

- [ ] Enhanced mobile app features
- [ ] Advanced analytics and reporting
- [ ] Budget planning and goals
- [ ] Export functionality
- [ ] Multi-currency support
- [ ] Push notifications
- [ ] Dark mode support
