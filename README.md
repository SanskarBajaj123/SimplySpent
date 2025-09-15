# SimplySpent - Smart Financial Tracking App

A complete, full-stack expense tracker application with web and mobile support, built with React, React Native, and Supabase. Track your finances with ease across all platforms.

## 🚀 Features

### ✨ Core Features
- **User Authentication**: Secure sign up/sign in with Supabase Auth
- **Transaction Management**: Add, edit, delete, and categorize income and expenses
- **Financial Analytics**: Monthly summaries with interactive charts and metrics
- **Data Sharing**: Share transaction data with other users and view shared transactions
- **Cross-Platform**: Web app (React) and mobile app (React Native)
- **Real-time Updates**: Live data synchronization with Supabase

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Currency Support**: Indian Rupee (₹) formatting throughout the app
- **Username Display**: Personalized experience using usernames instead of emails
- **Professional Branding**: SimplySpent logo and consistent theming

### 📱 Mobile App Features
- **Native Experience**: Optimized for mobile devices with React Native
- **Bottom Navigation**: Easy access to Dashboard, Metrics, Shared, and Profile
- **Floating Action Button**: Quick access to add transactions
- **Pull-to-Refresh**: Update data with a simple gesture
- **Welcome Message**: Personalized greeting with username and live timestamp
- **Transaction Actions**: Edit and delete transactions with confirmation dialogs
- **Shared Transactions Tab**: View transactions shared by other users
- **Profile Management**: User settings, data sharing, and account information

### 🌐 Web App Features
- **Dashboard**: Overview of monthly income, expenses, and balance
- **Transaction Management**: Add, edit, and delete transactions with improved UI
- **Metrics**: Interactive charts showing expense breakdown and trends
- **Profile Management**: User settings and data sharing controls
- **Shared Transactions**: View transactions shared by other users
- **Delete Confirmation**: Full-screen confirmation dialog for transaction deletion
- **Static Edit/Delete**: Improved transaction item UI with static action buttons

## 🛠 Technology Stack

### Backend & Database
- **Supabase**: PostgreSQL database, authentication, and auto-generated APIs
- **Row Level Security (RLS)**: Secure data access policies
- **Real-time Subscriptions**: Live data updates

### Web App
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router DOM** for navigation
- **Chart.js** for data visualization
- **Headless UI** for accessible components

### Mobile App
- **React Native** with Expo for cross-platform development
- **React Navigation** (Bottom Tabs) for mobile navigation
- **Expo Vector Icons** for consistent iconography
- **AsyncStorage** for local data persistence
- **URL Polyfill** for React Native compatibility

## 📁 Project Structure

```
SimplySpent/
├── database_schema.sql          # Database schema and setup
├── rls_policies.sql            # Row Level Security policies
├── setup_commands.md           # Web app setup instructions
├── mobile_setup_commands.md    # Mobile app setup instructions
├── DEPLOYMENT_GUIDE.md         # Comprehensive deployment guide
├── simply-spent-web/           # Web application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionItem.jsx
│   │   │   ├── TransactionModal.jsx
│   │   │   ├── DeleteConfirmationModal.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── MetricsPage.jsx
│   │   │   ├── SharedTransactionsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AuthPage.jsx
│   │   ├── supabaseClient.js  # Supabase configuration
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # App entry point
│   ├── package.json
│   └── README.md
└── simply-spent-mobile/        # Mobile application
    ├── src/
    │   ├── components/         # Mobile components
    │   │   └── TransactionModal.js
    │   ├── screens/           # Screen components
    │   │   ├── DashboardScreen.js
    │   │   ├── MetricsScreen.js
    │   │   ├── SharedTransactionsScreen.js
    │   │   ├── ProfileScreen.js
    │   │   └── AuthScreen.js
    │   ├── navigation/        # Navigation setup
    │   │   └── AppNavigator.js
    │   └── supabaseClient.js  # Supabase configuration
    ├── App.js                 # Main app component
    ├── app.json              # Expo configuration
    ├── eas.json              # EAS build configuration
    ├── package.json
    ├── APK_README.md         # APK installation guide
    ├── DEPLOYMENT_APK_GUIDE.md # APK build guide
    ├── quick-build-apk.bat   # Quick APK build script
    └── DEPLOYMENT_SUMMARY.md # Deployment summary
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
- **Secure authentication** via Supabase Auth with PKCE flow

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Expo CLI (for mobile development)
- EAS CLI (for APK builds)

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
   cd simply-spent-web
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
   cd simply-spent-mobile
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
- **Transaction Management**: Add, edit, and delete transactions with improved UI
- **Metrics**: Interactive charts showing expense breakdown and trends
- **Profile Management**: User settings and data sharing controls
- **Shared Transactions**: View transactions shared by other users
- **Responsive Design**: Works on desktop, tablet, and mobile browsers
- **Delete Confirmation**: Full-screen confirmation dialog for transaction deletion

### Mobile App Features
- **Native Experience**: Optimized for mobile devices
- **Bottom Navigation**: Easy access to Dashboard, Metrics, Shared, and Profile
- **Floating Action Button**: Quick access to add transactions
- **Pull-to-Refresh**: Update data with a simple gesture
- **Welcome Message**: Personalized greeting with username and live timestamp
- **Transaction Actions**: Edit and delete transactions with confirmation dialogs
- **Shared Transactions Tab**: View transactions shared by other users
- **Profile Management**: User settings, data sharing, and account information
- **Offline Support**: Basic offline functionality with Expo

## 🔧 Development

### Web App Development
```bash
cd simply-spent-web
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Mobile App Development
```bash
cd simply-spent-mobile
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
```

## 📊 API Endpoints

The application uses Supabase's auto-generated REST API:

- `GET /transactions` - Fetch user transactions
- `POST /transactions` - Create new transaction
- `PUT /transactions` - Update transaction
- `DELETE /transactions` - Delete transaction
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

#### APK Build (Recommended)
1. Install EAS CLI: `npm install -g eas-cli`
2. Login to Expo: `eas login`
3. Build APK: `eas build --platform android --profile preview`
4. Download and share the APK file

#### Quick Build Script
Use the provided batch script for Windows:
```bash
.\quick-build-apk.bat
```

#### Alternative Methods
- **Expo Go**: Run directly on device with Expo Go app
- **App Store**: Submit to Google Play Store or Apple App Store

## 📦 APK Distribution

The mobile app can be distributed as a standalone APK:

1. **Build APK**: Use EAS build service
2. **Download**: Get APK from Expo dashboard
3. **Share**: Send APK file to users
4. **Install**: Users can install directly on Android devices

See `APK_README.md` for detailed installation instructions.

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
- Check deployment guides for setup issues

## 🎯 Completed Features

- ✅ User authentication with Supabase
- ✅ Transaction management (CRUD operations)
- ✅ Financial analytics and metrics
- ✅ Data sharing between users
- ✅ Cross-platform support (Web + Mobile)
- ✅ Modern UI/UX design
- ✅ Currency formatting (₹)
- ✅ Username-based display
- ✅ Shared transactions tab
- ✅ Profile management
- ✅ APK deployment
- ✅ Real-time data synchronization
- ✅ Responsive design
- ✅ Delete confirmation dialogs
- ✅ Welcome messages with live timestamps

## 🚀 Future Roadmap

- [ ] Advanced analytics and reporting
- [ ] Budget planning and goals
- [ ] Export functionality (PDF/CSV)
- [ ] Multi-currency support
- [ ] Push notifications
- [ ] Dark mode support
- [ ] Receipt image upload
- [ ] Recurring transactions
- [ ] Financial goals tracking
- [ ] Expense categories customization

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**SimplySpent** - Smart Financial Tracking Made Simple 💰
