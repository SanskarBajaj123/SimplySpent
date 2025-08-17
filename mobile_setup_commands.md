# SimplySpent Mobile App Setup Commands

## Milestone 6: Mobile App (React Native with Expo)

### Create React Native project with Expo
```bash
npx create-expo-app fin-track-mobile
cd fin-track-mobile
```

### Install dependencies
```bash
npm install @supabase/supabase-js @react-navigation/native @react-navigation/bottom-tabs react-native-dotenv
npm install react-native-screens react-native-safe-area-context
```

### Install Expo dependencies
```bash
npx expo install expo-secure-store
```

### Create .env file
Create a `.env` file in the root directory with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Update babel.config.js for environment variables
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }]
    ]
  };
};
```
