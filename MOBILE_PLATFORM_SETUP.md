# Mobile Platform Setup Guide

This guide covers setting up PalPalette for Android and iOS development using Ionic Capacitor.

## Prerequisites

### For Both Platforms

- Node.js 18+ installed
- Ionic CLI: `npm install -g @ionic/cli`
- Capacitor CLI: `npm install -g @capacitor/cli`

### For Android Development

- **Android Studio** with SDK 21+ (Android 5.0+)
- **Java Development Kit (JDK) 17**
- **Android SDK Platform Tools**
- **Android Build Tools**

### For iOS Development (macOS only)

- **Xcode 14+**
- **iOS SDK 13+**
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Account** (for device testing and distribution)

## Project Setup

### 1. Install Dependencies

```bash
cd palpalette-app
npm install
```

### 2. Build the Web App

```bash
npm run build
```

### 3. Add Mobile Platforms

#### Add Android

```bash
npm run cap:add:android
```

#### Add iOS (macOS only)

```bash
npm run cap:add:ios
```

## Development Workflow

### Android Development

#### 1. Sync Changes

```bash
npm run cap:sync:android
```

#### 2. Open in Android Studio

```bash
npm run cap:open:android
```

#### 3. Run on Device/Emulator

```bash
npm run cap:run:android
```

### iOS Development

#### 1. Sync Changes

```bash
npm run cap:sync:ios
```

#### 2. Open in Xcode

```bash
npm run cap:open:ios
```

#### 3. Run on Device/Simulator

```bash
npm run cap:run:ios
```

## Configuration

### Android Configuration

The `android/` folder contains:

- `app/src/main/AndroidManifest.xml` - App permissions and configuration
- `app/build.gradle` - Build configuration
- `app/src/main/res/` - App icons, splash screens, and resources

### iOS Configuration

The `ios/` folder contains:

- `App/App/Info.plist` - App permissions and configuration
- `App.xcworkspace` - Xcode workspace
- `App/App/Assets.xcassets` - App icons and images

## Permissions

### Camera Permission (for QR scanning and photo features)

**Android** (`android/app/src/main/AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

**iOS** (`ios/App/App/Info.plist`):

```xml
<key>NSCameraUsageDescription</key>
<string>This app uses the camera to scan QR codes and capture photos for color palette extraction.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app accesses your photo library to extract color palettes from images.</string>
```

### Network Permission (for WebSocket and API communication)

**Android** - Automatically granted for HTTPS
**iOS** - Automatically granted for HTTPS

## Building for Production

### Android APK/AAB

1. **Debug Build:**

```bash
npm run build:mobile
cd android
./gradlew assembleDebug
```

2. **Release Build:**

```bash
npm run build:mobile
cd android
./gradlew assembleRelease
```

### iOS IPA

1. **Open in Xcode:**

```bash
npm run cap:open:ios
```

2. **Select Target Device/Simulator**
3. **Product > Archive**
4. **Distribute App**

## Testing

### Device Testing

- **Android**: Enable Developer Options and USB Debugging
- **iOS**: Add device to Apple Developer Account

### Emulator/Simulator Testing

- **Android**: Use Android Studio AVD Manager
- **iOS**: Use Xcode Simulator

## Troubleshooting

### Common Android Issues

1. **Gradle Build Fails:**

   - Update Android Gradle Plugin in `android/build.gradle`
   - Sync project with Gradle files

2. **SDK Issues:**
   - Set `ANDROID_HOME` environment variable
   - Install required SDK platforms and build tools

### Common iOS Issues

1. **Code Signing:**

   - Set up proper signing certificates in Xcode
   - Configure Team and Bundle Identifier

2. **CocoaPods Issues:**
   ```bash
   cd ios/App
   pod install --repo-update
   ```

### General Issues

1. **Capacitor Sync Issues:**

   ```bash
   npx cap doctor
   npx cap sync --deployment
   ```

2. **Clear Cache:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build:mobile
   ```

## Live Reload Development

### Enable Live Reload

1. **Start the dev server:**

```bash
npm run dev
```

2. **Find your local IP address:**

```bash
ipconfig  # Windows
ifconfig  # macOS/Linux
```

3. **Update capacitor.config.ts temporarily:**

```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:5173',
  cleartext: true
}
```

4. **Sync and run:**

```bash
npm run cap:sync
npm run cap:run:android  # or cap:run:ios
```

## App Store Distribution

### Android (Google Play)

1. Generate signed APK/AAB
2. Create Google Play Console account
3. Upload and configure app listing
4. Submit for review

### iOS (App Store)

1. Archive and distribute via Xcode
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## Resources

- [Ionic Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/documentation/)
- [React Native to Ionic Migration](https://ionicframework.com/docs/react)
