# Mathematics 4.0 - Deployment Guide

This guide covers deploying the Mathematics 4.0 educational app to Google Play Store and Apple App Store.

---

## Prerequisites

Before deploying, ensure you have:

1. **Apple Developer Account** ($99/year) for iOS deployment
2. **Google Play Developer Account** ($25 one-time) for Android deployment
3. **Expo Account** (free) for building and managing releases
4. **Xcode** (macOS only) for iOS signing
5. **Android Studio** for Android signing (optional, can use Expo for building)

---

## Project Configuration

The app is configured in `app.config.ts` with the following settings:

| Setting | Value | Notes |
|---------|-------|-------|
| App Name | Mathematics 4.0 | Display name in app stores |
| App Slug | math-4-0-edu | Unique identifier (don't change) |
| Bundle ID (iOS) | space.manus.math.4.0.edu.t... | Auto-generated from timestamp |
| Package Name (Android) | space.manus.math.4.0.edu.t... | Auto-generated from timestamp |
| Version | 1.0.0 | Update for each release |

---

## Building for iOS (Apple App Store)

### Step 1: Prepare iOS Build

Run the following command to create an iOS build:

```bash
eas build --platform ios --auto-submit
```

Alternatively, for a local build:

```bash
eas build --platform ios
```

### Step 2: Create App Store Connect Entry

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in the app information:
   - **Platform**: iOS
   - **App Name**: Mathematics 4.0
   - **Bundle ID**: Use the ID from `app.config.ts`
   - **SKU**: math-4-0-edu
   - **User Access**: Select appropriate access level

### Step 3: Configure App Details

In App Store Connect, configure:

- **App Information**: Description, keywords, category (Education)
- **Pricing and Availability**: Set pricing and regions
- **App Preview and Screenshots**: Add 2-5 screenshots (iPhone 6.5" and 5.5")
- **Description**: Write compelling app description highlighting Industry 4.0 focus
- **Keywords**: mathematics, education, industry 4.0, learning
- **Support URL**: Provide support contact information
- **Privacy Policy URL**: Link to your privacy policy

### Step 4: Build and Upload

1. Download the build from Expo
2. Use Xcode or Transporter to upload to App Store Connect
3. Submit for review

### Step 5: Review and Release

- Apple reviews typically take 24-48 hours
- Once approved, release to App Store
- Monitor reviews and ratings

---

## Building for Android (Google Play Store)

### Step 1: Prepare Android Build

Run the following command to create an Android build:

```bash
eas build --platform android --auto-submit
```

Alternatively, for a local build:

```bash
eas build --platform android
```

### Step 2: Create Google Play Console Entry

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in the app information:
   - **App name**: Mathematics 4.0
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free

### Step 3: Configure App Details

In Google Play Console, configure:

- **App access**: Select appropriate access level
- **Content rating**: Complete the content rating questionnaire
- **Target audience**: Select Education category
- **Content**: Add app description, screenshots, and promotional graphics
- **Pricing and distribution**: Set regions and pricing
- **Release management**: Create a release track (internal, closed, open)

### Step 4: Upload Build

1. Download the build from Expo (AAB format recommended)
2. Go to Release → Production (or test track)
3. Upload the AAB file
4. Review and confirm app details

### Step 5: Review and Release

- Google Play reviews typically take 2-4 hours
- Once approved, release to production
- Monitor reviews and ratings

---

## Version Updates

When releasing updates:

1. **Update version** in `app.config.ts`:
   ```ts
   version: "1.0.1",  // Increment patch version
   ```

2. **Rebuild** for both platforms:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

3. **Upload new builds** to respective app stores
4. **Update release notes** with changes and improvements

---

## Code Modifications and Redeployment

The app source code is fully accessible for modifications. To make changes and redeploy:

### Making Code Changes

1. Edit files in the project (e.g., `app/(tabs)/index.tsx`, `theme.config.js`)
2. Test changes locally:
   ```bash
   pnpm dev
   ```
3. Commit changes to version control

### Rebuilding and Redeploying

1. **Update version** in `app.config.ts` (increment version number)
2. **Create a new build**:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```
3. **Upload to app stores** following the steps above
4. **Submit for review** and release

---

## Key Files for Customization

| File | Purpose |
|------|---------|
| `app.config.ts` | App name, version, bundle ID, permissions |
| `theme.config.js` | Color palette and theme tokens |
| `app/(tabs)/index.tsx` | Home screen content |
| `app/(tabs)/topics.tsx` | Topics screen and data |
| `app/(tabs)/progress.tsx` | Progress tracking screen |
| `app/(tabs)/settings.tsx` | Settings and preferences |
| `assets/images/icon.png` | App icon (1024×1024) |
| `assets/images/splash-icon.png` | Splash screen icon |

---

## Testing Before Deployment

Before submitting to app stores:

1. **Test on real devices**:
   - iOS: Use TestFlight for beta testing
   - Android: Use Google Play internal testing track

2. **Verify functionality**:
   - All navigation works
   - Topics load correctly
   - Progress tracking functions
   - Settings save preferences

3. **Check performance**:
   - App loads quickly
   - No memory leaks
   - Smooth scrolling and transitions

4. **Test on different screen sizes**:
   - iPhone SE (small screen)
   - iPhone 14 Pro Max (large screen)
   - Various Android devices

---

## Troubleshooting

### iOS Build Fails

- Ensure Apple Developer account is active
- Check provisioning profiles in Xcode
- Verify bundle ID matches App Store Connect entry

### Android Build Fails

- Ensure Google Play Developer account is active
- Check package name matches Google Play Console entry
- Verify signing keys are configured

### App Rejected by Store

- Review rejection reason carefully
- Address all issues mentioned in rejection
- Resubmit with updated build

---

## Support and Resources

- **Expo Documentation**: https://docs.expo.dev
- **Apple App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **EAS Build Documentation**: https://docs.expo.dev/build/introduction/

---

## Next Steps

1. Create a checkpoint of the current state
2. Test the app on iOS and Android devices
3. Prepare app store listings and screenshots
4. Submit for review to both app stores
5. Monitor reviews and plan updates

---

**Note**: This guide provides a high-level overview. For detailed instructions, refer to the official Expo, Apple, and Google documentation.
