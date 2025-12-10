import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ImageBackground } from 'react-native';
// Use the new splash image; require() is most robust with Metro
const heyImage = require('../../assets/studify (1080 x 1920 px) (2).png');
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Home: undefined;
  ARCamera: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in quickly
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // After ~3.2s, fade out and navigate to Welcome
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Welcome');
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.container, { opacity }]}>        
        <ImageBackground
          source={heyImage}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});