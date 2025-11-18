import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import ARCameraScreen from '../screens/ARCameraScreen';
import StudentLessonsScreen from '../screens/StudentLessonsScreen';
import QuizScreen from '../screens/QuizScreen';
import OfflineDownloadsScreen from '../screens/OfflineDownloadsScreen';
import TeacherReportsScreen from '../screens/TeacherReportsScreen';
import AdminLiteFlagsScreen from '../screens/AdminLiteFlagsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ARCamera: undefined;
  StudentLessons: undefined;
  Quiz: undefined;
  OfflineDownloads: undefined;
  TeacherReports: undefined;
  AdminLiteFlags: undefined;
  Settings: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}
          initialRouteName="Splash"
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ARCamera" component={ARCameraScreen} />
          <Stack.Screen name="StudentLessons" component={StudentLessonsScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="OfflineDownloads" component={OfflineDownloadsScreen} />
          <Stack.Screen name="TeacherReports" component={TeacherReportsScreen} />
          <Stack.Screen name="AdminLiteFlags" component={AdminLiteFlagsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}