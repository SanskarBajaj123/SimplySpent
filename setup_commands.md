# FinTrack Setup Commands

## Milestone 3: Web App Setup

### Create React project with Vite
```bash
npm create vite@latest fin-track-web -- --template react
cd fin-track-web
```

### Install dependencies
```bash
npm install @supabase/supabase-js react-router-dom @headlessui/react
npm install -D tailwindcss postcss autoprefixer
```

### Initialize Tailwind CSS
```bash
npx tailwindcss init -p
```

### Update tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Add Tailwind directives to src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Create .env file
Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
