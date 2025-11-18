import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
// Optimize and ensure native stack components are registered
enableScreens(true);
import { registerRootComponent } from 'expo';
import RootNavigator from './src/navigation/RootNavigator';

// Register the navigation root (Splash → ARApp)
registerRootComponent(RootNavigator);
