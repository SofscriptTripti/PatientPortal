import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number; // Duration in milliseconds to show the splash before fading out
}

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish, duration = 3000 }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start a timer to fade out the splash screen
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600, // 600ms fade out transition
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, onFinish]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: '#000000',
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.Image
        source={require('../assets/gifs/patient_portal_splash_transparent_NO_BLACK_FINAL.gif')}
        style={styles.gif}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Render on top of all other components
  },
  gif: {
    width: width * 0.7,
    height: width * 0.7,
  },
});
