@echo off
echo.
echo 🚀 SimplySpent APK Builder - Quick Start
echo ========================================
echo.

echo 📋 Prerequisites Check:
echo - EAS CLI: 
eas --version
echo.

echo 🔧 Building APK...
echo ⏳ This may take 10-15 minutes...
echo.

eas build --platform android --profile preview

echo.
echo ✅ Build process completed!
echo 📱 Check your Expo dashboard for the download link
echo.
pause
