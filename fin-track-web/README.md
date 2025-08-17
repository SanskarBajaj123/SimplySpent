# 💰 FinTrack - Personal Finance Tracker

A modern, responsive personal finance tracking application built with React, Supabase, and Tailwind CSS. Track your income, expenses, and get detailed analytics to manage your finances effectively.

![FinTrack Dashboard](https://img.shields.io/badge/FinTrack-Personal%20Finance%20Tracker-blue?style=for-the-badge&logo=react)

## ✨ Features

### 🎯 Core Features
- **📊 Real-time Dashboard** - View your financial overview at a glance
- **💰 Transaction Management** - Add, view, and categorize income and expenses
- **📈 Advanced Analytics** - Detailed spending patterns and insights
- **🎨 Modern UI/UX** - Beautiful, responsive design with smooth animations
- **🔒 Secure Authentication** - Supabase Auth with email/password
- **📱 Mobile Responsive** - Works perfectly on all devices

### 🏷️ Transaction Categories
**Expenses:** Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Rent/Mortgage, Insurance, Education, Travel, Subscriptions, Other

**Income:** Salary, Freelance, Investment, Business, Gift, Refund, Bonus, Other

### 📊 Analytics Features
- **Period-based Analysis** - View data by month, quarter, or year
- **Top Spending Categories** - Identify your biggest expense areas
- **Monthly Trends** - Visual charts showing income vs expenses
- **Net Balance Tracking** - Monitor your financial health

## 🚀 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Styling:** Tailwind CSS with custom animations
- **Deployment:** Vercel (Frontend), Supabase (Backend)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fin-track.git
cd fin-track/fin-track-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the `fin-track-web` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the database setup script from `database_reset.sql`

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Tables
- **profiles** - User profile information
- **transactions** - Income and expense records
- **shared_access** - User sharing permissions

### Key Features
- Row Level Security (RLS) for data protection
- Automatic profile creation on signup
- Real-time updates with Supabase subscriptions

## 🎨 UI/UX Features

### Design Highlights
- **Glassmorphism Effects** - Modern glass-like UI elements
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Hover effects and transitions
- **Responsive Design** - Optimized for all screen sizes
- **Dark/Light Mode Ready** - Easy theme switching capability

### Components
- **Modern Navigation** - Fixed header with user info
- **Interactive Cards** - Hover effects and animations
- **Smart Forms** - Validation and error handling
- **Real-time Updates** - Live data synchronization

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Vercel**
- Go to [Vercel](https://vercel.com)
- Connect your GitHub repository
- Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Deploy!

### Environment Variables for Production
Make sure to set these in your Vercel project settings:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 📱 Mobile App

A React Native mobile app is also available in the `fin-track-mobile` directory with the same features and design.

## 🔧 Configuration

### Customization
- **Colors:** Modify Tailwind config for brand colors
- **Categories:** Update category options in components
- **Currency:** Change from ₹ to other currencies in components

### Adding Features
- **Budget Tracking** - Set monthly budgets per category
- **Export Data** - CSV/PDF export functionality
- **Recurring Transactions** - Automatic transaction creation
- **Bill Reminders** - Payment due date notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service
- **Tailwind CSS** for the utility-first CSS framework
- **React** for the powerful frontend library
- **Vercel** for seamless deployment

## 📞 Support

If you have any questions or need help:
- Create an issue on GitHub
- Email: support@fintrack.com
- Documentation: [docs.fintrack.com](https://docs.fintrack.com)

---

**Made with ❤️ for better financial management**
