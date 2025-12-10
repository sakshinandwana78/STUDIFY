import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import ARCameraScreen from '../screens/ARCameraScreen';
import StudentLessonsScreen from '../screens/StudentLessonsScreen';
import QuizScreen from '../screens/QuizScreen';
import OfflineDownloadsScreen from '../screens/OfflineDownloadsScreen';
import TeacherReportsScreen from '../screens/TeacherReportsScreen';
import AdminLiteFlagsScreen from '../screens/AdminLiteFlagsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AuthNavigator from './AuthNavigator';
import { AvatarProvider } from '../ui/providers/AvatarProvider';
import { ThemeProvider } from '../ui/tokens/theme.tsx';
import BottomNavBar from '../components/BottomNavBar';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Auth: undefined;
  MainTabs: undefined;
  ARCamera: undefined;
  StudentLessons: undefined;
  Quiz: undefined;
  OfflineDownloads: undefined;
  TeacherReports: undefined;
  AdminLiteFlags: undefined;
  Settings: undefined;
  Profile: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type MainTabParamList = {
  Home: undefined;
  StudentLessons: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Home stack: keeps tab bar visible on feature screens launched from Home
const HomeStack = createNativeStackNavigator<RootStackParamList>();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="Quiz" component={QuizScreen} />
      <HomeStack.Screen name="OfflineDownloads" component={OfflineDownloadsScreen} />
      <HomeStack.Screen name="TeacherReports" component={TeacherReportsScreen} />
      <HomeStack.Screen name="AdminLiteFlags" component={AdminLiteFlagsScreen} />
      {/* Keep EditProfile accessible from Home to preserve existing navigation calls */}
      <HomeStack.Screen name="EditProfile" component={EditProfileScreen} />
    </HomeStack.Navigator>
  );
}

// Lessons stack: can grow with lesson details later, tab bar remains visible
const LessonsStack = createNativeStackNavigator<RootStackParamList>();
function LessonsStackScreen() {
  return (
    <LessonsStack.Navigator screenOptions={{ headerShown: false }}>
      <LessonsStack.Screen name="StudentLessonsScreen" component={StudentLessonsScreen} />
    </LessonsStack.Navigator>
  );
}

// Settings stack
const SettingsStack = createNativeStackNavigator<RootStackParamList>();
function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsScreen" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

// Profile stack: includes EditProfile while keeping tab bar visible
const ProfileStack = createNativeStackNavigator<RootStackParamList>();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={() => <BottomNavBar />}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="StudentLessons" component={LessonsStackScreen} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider initialMode={'light'}>
        <AvatarProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}
              initialRouteName="Splash"
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              {/* Auth flow remains nested and untouched */}
              <Stack.Screen name="Auth" component={AuthNavigator} />
              {/* Main app with bottom tabs visible across normal screens */}
              <Stack.Screen name="MainTabs" component={MainTabs} />
              {/* AR camera lives outside tabs so the tab bar is hidden */}
              <Stack.Screen name="ARCamera" component={ARCameraScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AvatarProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
