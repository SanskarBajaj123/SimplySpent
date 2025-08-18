@echo off
echo ========================================
echo SimplySpent APK Builder
echo ========================================
echo.

echo Step 1: Installing dependencies...
npm install
echo.

echo Step 2: Checking EAS CLI...
eas --version
echo.

echo Step 3: Building APK...
echo This will take several minutes...
eas build --platform android --profile preview
echo.

echo ========================================
echo Build completed!
echo Check your Expo dashboard for the APK download link.
echo ========================================
pause
