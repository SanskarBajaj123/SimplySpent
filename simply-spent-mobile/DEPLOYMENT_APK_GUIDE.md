# SimplySpent APK Deployment Guide

This guide will help you build a standalone APK file that can be shared with anyone.

## Prerequisites

1. **Expo CLI** (already installed)
2. **EAS CLI** (Expo Application Services)
3. **Expo Account** (free)

## Step 1: Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

## Step 2: Login to Expo

```bash
eas login
```

Create a free account at https://expo.dev if you don't have one.

## Step 3: Configure EAS Build

Initialize EAS build configuration:

```bash
eas build:configure
```

This will create an `eas.json` file.

## Step 4: Update EAS Configuration

Edit the `eas.json` file to include APK build configuration:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Step 5: Build APK

### Option A: Build Locally (Recommended for testing)

```bash
eas build --platform android --profile preview --local
```

### Option B: Build on Expo Servers (Recommended for distribution)

```bash
eas build --platform android --profile preview
```

## Step 6: Download and Share APK

1. After the build completes, you'll get a download link
2. Download the APK file
3. Share the APK file with others

## Step 7: Install APK on Android Devices

### For Recipients:

1. **Enable Unknown Sources**:
   - Go to Settings > Security
   - Enable "Unknown Sources" or "Install unknown apps"

2. **Install APK**:
   - Open the APK file
   - Tap "Install"
   - Follow the prompts

## Alternative: Build APK with Expo Classic Build

If you prefer the older method:

```bash
expo build:android -t apk
```

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check your `app.json` configuration
2. **APK Too Large**: Optimize images and remove unused dependencies
3. **Installation Fails**: Ensure "Unknown Sources" is enabled

### Size Optimization:

1. Remove unused dependencies from `package.json`
2. Optimize images (use WebP format)
3. Enable ProGuard for code minification

## Security Considerations

1. **API Keys**: Ensure your Supabase keys are properly configured
2. **Permissions**: Only request necessary permissions
3. **Updates**: Consider implementing auto-update mechanism

## Distribution Options

1. **Direct APK**: Share APK file directly
2. **Google Play Store**: Submit to Play Store for wider distribution
3. **Internal Testing**: Use Google Play Console for beta testing

## Next Steps

1. Test the APK on different Android devices
2. Gather user feedback
3. Consider publishing to Google Play Store for easier distribution

## Support

If you encounter issues:
1. Check Expo documentation: https://docs.expo.dev
2. Visit Expo forums: https://forums.expo.dev
3. Check EAS documentation: https://docs.expo.dev/eas/
