# Code Modification Guide

This guide explains how to modify the Mathematics 4.0 app and prepare it for redeployment.

---

## Project Structure

```
math-4-0-edu/
├── app/                          # App screens and navigation
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation configuration
│   │   ├── index.tsx            # Home screen
│   │   ├── topics.tsx           # Topics screen
│   │   ├── progress.tsx         # Progress screen
│   │   └── settings.tsx         # Settings screen
│   ├── _layout.tsx              # Root layout with providers
│   └── oauth/callback.tsx       # OAuth callback (don't modify)
├── components/                   # Reusable UI components
│   ├── screen-container.tsx     # SafeArea wrapper for all screens
│   ├── ui/icon-symbol.tsx       # Icon mapping for tab bar
│   └── ...
├── hooks/                        # Custom React hooks
│   ├── use-colors.ts            # Theme colors hook
│   ├── use-auth.ts              # Authentication hook
│   └── ...
├── lib/                          # Utilities and configuration
│   ├── trpc.ts                  # API client
│   ├── utils.ts                 # Utility functions
│   └── ...
├── constants/                    # App constants
│   ├── theme.ts                 # Theme colors
│   └── ...
├── assets/images/               # App icons and images
│   ├── icon.png                 # App icon (1024×1024)
│   ├── splash-icon.png          # Splash screen icon
│   └── ...
├── theme.config.js              # Theme configuration (colors)
├── tailwind.config.js           # Tailwind CSS configuration
├── app.config.ts                # Expo app configuration
├── package.json                 # Dependencies
└── DEPLOYMENT_GUIDE.md          # Deployment instructions
```

---

## Common Modifications

### 1. Changing App Colors

**File**: `theme.config.js`

The app uses a bright color palette. To customize colors:

```js
const themeColors = {
  primary: { light: '#0066CC', dark: '#0066CC' },      // Main blue
  background: { light: '#FFFFFF', dark: '#0F172A' },   // Background
  surface: { light: '#F0F4FF', dark: '#1E293B' },      // Card backgrounds
  foreground: { light: '#1A1A2E', dark: '#F1F5F9' },   // Text color
  success: { light: '#10B981', dark: '#34D399' },      // Success (green)
  warning: { light: '#F59E0B', dark: '#FBBF24' },      // Warning (amber)
  error: { light: '#EF4444', dark: '#F87171' },        // Error (red)
};
```

**Example**: Change primary color to purple:
```js
primary: { light: '#7C3AED', dark: '#7C3AED' },
```

### 2. Updating App Name and Branding

**File**: `app.config.ts`

```ts
const env = {
  appName: "Mathematics 4.0",        // Change display name
  appSlug: "math-4-0-edu",           // Keep this unchanged
  logoUrl: "",                        // Add S3 URL of custom logo
};
```

### 3. Modifying Home Screen Content

**File**: `app/(tabs)/index.tsx`

The home screen displays featured topics and statistics. To modify:

- **Featured Topics**: Edit the `FEATURED_TOPICS` array
- **Quick Stats**: Update the stat values in the stats section
- **Hero Section**: Modify the title and description text

**Example**: Add a new featured topic:
```tsx
const FEATURED_TOPICS: FeaturedTopic[] = [
  // ... existing topics
  {
    id: "4",
    title: "Number Theory",
    description: "Cryptography for IoT Security",
    icon: "🔐",
    color: "bg-red-100",
  },
];
```

### 4. Adding New Topics

**File**: `app/(tabs)/topics.tsx`

Topics are defined in the `ALL_TOPICS` array. To add a new topic:

```tsx
const ALL_TOPICS: Topic[] = [
  // ... existing topics
  {
    id: "7",
    title: "Complex Numbers",
    description: "Advanced mathematics for signal processing",
    category: "Algebra",
    difficulty: "Advanced",
    progress: 0,
    icon: "🔢",
  },
];
```

### 5. Updating Tab Navigation Icons

**File**: `components/ui/icon-symbol.tsx`

Add new icon mappings:

```ts
const MAPPING = {
  "house.fill": "home",
  "book.fill": "library-books",
  "chart.bar.fill": "bar-chart",
  "gear": "settings",
  // Add new icons here
  "star.fill": "star",
};
```

Then use in `app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen
  name="favorites"
  options={{
    title: "Favorites",
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
  }}
/>
```

### 6. Customizing Progress Screen

**File**: `app/(tabs)/progress.tsx`

- **Achievements**: Edit the `ACHIEVEMENTS` array to add/remove badges
- **Learning Path**: Modify the progress bar sections
- **Statistics**: Update the stat cards

### 7. Modifying Settings Screen

**File**: `app/(tabs)/settings.tsx`

- **Profile Section**: Update user profile display
- **Preferences**: Add new preference options
- **About Section**: Update app version and links

---

## Styling with Tailwind CSS

The app uses **NativeWind** (Tailwind CSS for React Native). Common utilities:

| Utility | Example | Purpose |
|---------|---------|---------|
| Padding | `p-4`, `px-6`, `py-3` | Add spacing |
| Margin | `m-2`, `mb-4`, `mt-2` | Add margins |
| Flexbox | `flex-row`, `items-center`, `justify-between` | Layout |
| Colors | `bg-primary`, `text-foreground`, `border-border` | Colors |
| Sizing | `w-full`, `h-12`, `rounded-xl` | Size and shape |
| Display | `gap-4`, `flex-1` | Spacing and flex |

**Example**: Create a styled card:
```tsx
<View className="bg-surface rounded-xl p-4 border border-border gap-2">
  <Text className="text-lg font-semibold text-foreground">Title</Text>
  <Text className="text-sm text-muted">Description</Text>
</View>
```

---

## Adding New Screens

To add a new tab screen:

1. **Create the screen file**: `app/(tabs)/newscreen.tsx`
2. **Add to tab navigation**: Update `app/(tabs)/_layout.tsx`
3. **Add icon mapping**: Update `components/ui/icon-symbol.tsx`

**Example**: Create a favorites screen:

```tsx
// app/(tabs)/favorites.tsx
import { ScreenContainer } from "@/components/screen-container";
import { ScrollView, Text, View } from "react-native";

export default function FavoritesScreen() {
  return (
    <ScreenContainer className="p-6">
      <ScrollView>
        <Text className="text-2xl font-bold text-foreground">
          Favorite Topics
        </Text>
        {/* Add content here */}
      </ScrollView>
    </ScreenContainer>
  );
}
```

---

## Working with Data

### Local Storage (AsyncStorage)

For persistent local data storage:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
await AsyncStorage.setItem('key', JSON.stringify(data));

// Retrieve data
const data = await AsyncStorage.getItem('key');
const parsed = JSON.parse(data);
```

### State Management

Use React hooks for component state:

```tsx
import { useState } from 'react';

export default function MyScreen() {
  const [count, setCount] = useState(0);

  return (
    <TouchableOpacity onPress={() => setCount(count + 1)}>
      <Text>{count}</Text>
    </TouchableOpacity>
  );
}
```

---

## Testing Changes Locally

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **View in browser**: Open the URL shown in terminal (usually http://localhost:8081)

3. **Test on mobile**: Scan QR code with Expo Go app (iOS/Android)

4. **Hot reload**: Changes auto-reload when you save files

---

## Building and Deploying

### Local Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Auto-Submit to App Stores

```bash
# Build and auto-submit to both stores
eas build --platform ios --auto-submit
eas build --platform android --auto-submit
```

---

## Performance Tips

1. **Use FlatList** for long lists (not ScrollView with `.map()`)
2. **Memoize components** that don't need frequent re-renders
3. **Lazy load images** using `expo-image`
4. **Avoid inline object creation** in render methods
5. **Use `useMemo` and `useCallback`** for expensive operations

---

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| App crashes on startup | Check TypeScript errors: `pnpm check` |
| Styling not applied | Verify Tailwind class names are correct |
| Navigation not working | Ensure screen files exist in `app/(tabs)/` |
| Icons not showing | Add icon mapping in `icon-symbol.tsx` |
| Build fails | Clear cache: `rm -rf .expo node_modules && pnpm install` |

---

## Resources

- **Expo Documentation**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **NativeWind (Tailwind)**: https://www.nativewind.dev
- **Tailwind CSS**: https://tailwindcss.com

---

## Next Steps

1. Make desired code modifications
2. Test changes locally with `pnpm dev`
3. Update version in `app.config.ts`
4. Build for iOS and Android
5. Submit to app stores following DEPLOYMENT_GUIDE.md

---

**Happy coding!** 🚀
