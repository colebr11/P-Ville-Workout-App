# Interval Timer — React Native (Expo)

A dark, gym-focused HIIT interval timer for iOS and Android.

## Project Structure

```
WorkoutTimer/
├── App.js                        # Root: navigation container
├── app.json                      # Expo config (name, bundle ID, etc.)
├── package.json                  # Dependencies
├── babel.config.js
└── src/
    ├── constants/
    │   └── theme.js              # Colors, spacing, phase config
    ├── hooks/
    │   └── useWorkout.js         # Core state machine + timer logic
    ├── utils/
    │   └── formatTime.js         # Time formatting helpers
    ├── components/
    │   └── CircularProgress.js   # SVG ring progress component
    └── screens/
        ├── ConfigScreen.js       # Workout setup (inputs + presets)
        └── WorkoutScreen.js      # Active timer screen
```

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start

# 3. Scan the QR code with Expo Go on your phone
```

### Run on simulator
```bash
npx expo start --ios      # iOS Simulator (Mac only)
npx expo start --android  # Android Emulator
```

## Features
- Configurable work time, rest time, reps/set, sets, and set rest
- Circular SVG progress ring per phase
- Color-coded phases: Red = Work, Green = Rest, Blue = Set Rest
- Haptic feedback on phase transitions
- Screen stays awake during workout (expo-keep-awake)
- Pause/resume mid-workout
- Overall rep progress bar
- Built-in presets: Tabata, EMOM, Sprint

## Customization

**Change colors** → `src/constants/theme.js` (COLORS object)  
**Change default config** → `src/hooks/useWorkout.js` (DEFAULT_CONFIG)  
**Add presets** → `src/screens/ConfigScreen.js` (PRESETS array)

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Next Steps / Feature Ideas
- [ ] Audio beeps on phase transitions (expo-av)
- [ ] Save/load custom workout presets (AsyncStorage)
- [ ] Workout history log
- [ ] Apple Watch / WearOS companion
- [ ] Background audio tick (keep timer running when app minimized)
- [ ] Custom exercise names per set
