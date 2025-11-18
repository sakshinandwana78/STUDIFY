# Studify AR

A TypeScript-based Expo + Viro AR application that allows users to place 3D models in augmented reality.

## Project Structure

```
studify-ar/
├── App.tsx                  # Main application component
├── app.json                 # Expo configuration
├── assets/                  # Static assets
│   ├── models/              # 3D model files (.glb, .gltf)
│   │   ├── free__volcano_low_poly.glb
│   │   └── human_heart_3d_model.glb
│   └── ...                  # Other app assets
├── index.ts                 # Entry point
├── src/
│   ├── components/          # UI components
│   │   └── ModelPicker.tsx  # Bottom sheet for model selection
│   ├── hooks/               # Custom React hooks
│   │   └── useModelAssets.ts # Hook to manage 3D model assets
│   ├── scenes/              # AR scene components
│   │   └── ARScene.tsx      # Main AR scene
│   └── types/               # TypeScript type definitions
│       └── models.ts        # Types for models and components
└── package.json             # Dependencies and scripts
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Install Expo CLI globally if you haven't already:

```bash
npm install -g expo-cli
```

## Running the App

This app requires a development build as it uses native AR capabilities that aren't supported in Expo Go.

### 1. Prebuild the project

```bash
expo prebuild
```

### 2. Run on Android

```bash
expo run:android
```

### 3. Run on iOS

```bash
expo run:ios
```

## Adding Your Own 3D Models

1. Place your GLB or GLTF files in the `assets/models/` directory
2. Update the `useModelAssets.ts` hook to include your new models:

```typescript
const modelsList: Model3D[] = [
  // Existing models...
  {
    id: 'your-model-id',
    name: 'Your Model Name',
    modelPath: require('../../assets/modals/your-model-file.glb'),
    defaultScale: [0.2, 0.2, 0.2], // Adjust scale as needed
    defaultPosition: [0, 0, -1],   // Adjust position as needed
  },
];
```

## Native Changes After Prebuild

### iOS

After running `expo prebuild`, you may need to:

1. Open the iOS project in Xcode: `open ios/studifyar.xcworkspace`
2. Ensure Camera permissions are properly set in Info.plist
3. Set the deployment target to iOS 11.0 or higher
4. Build and run from Xcode

### Android

After running `expo prebuild`, you may need to:

1. Open the Android project in Android Studio: `android/`
2. Ensure Camera permissions are properly set in AndroidManifest.xml
3. Set the minimum SDK version to 24 or higher in build.gradle
4. Build and run from Android Studio

## Future Enhancements

- Add support for model manipulation (scale, rotate)
- Implement surface detection for better model placement
- Add model physics and interactions
- Support for saving and sharing AR scenes
- Add custom lighting controls for better model visualization