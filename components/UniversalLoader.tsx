import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Easing,
} from 'react-native';
import IMAGES from './imageAssets';
import { useTheme } from './ThemeContext';

export interface UniversalLoaderProps {
  visible?: boolean;
  message?: string;
  subtitle?: string;
  overlay?: boolean;
}

export const UniversalLoader: React.FC<UniversalLoaderProps> = ({
  visible = true,
  message = 'Please wait...',
  subtitle = 'Processing your request securely',
  overlay = true,
}) => {
  const { isDark, colors } = useTheme();
  // Pulse & Rotation animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0.85)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Heart Logo subtle breathing animation
    const heartBeat = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Radiating teal ripple ring
    const ripple = Animated.loop(
      Animated.parallel([
        Animated.timing(rippleAnim, {
          toValue: 1.4,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous rotation for spinner accent ring
    const spinner = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    heartBeat.start();
    ripple.start();
    spinner.start();

    return () => {
      heartBeat.stop();
      ripple.stop();
      spinner.stop();
    };
  }, [visible, pulseAnim, rippleAnim, rippleOpacity, rotateAnim]);

  if (!visible) return null;

  const spinInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const content = (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#EDF2F7', shadowColor: colors.primary }]}>
      {/* Icon with Glowing Pulse & Rotating Medical Accent Ring */}
      <View style={styles.iconContainer}>
        {/* Radiating Teal Ripple */}
        <Animated.View
          style={[
            styles.rippleCircle,
            {
              backgroundColor: colors.primaryLight,
              transform: [{ scale: rippleAnim }],
              opacity: rippleOpacity,
            },
          ]}
        />

        {/* Circular Accent Spinner Ring */}
        <Animated.View
          style={[
            styles.spinnerRing,
            {
              borderColor: colors.primary,
              borderRightColor: colors.accent,
              transform: [{ rotate: spinInterpolation }],
            },
          ]}
        />

        {/* Elevated App Logo Badge */}
        <Animated.View
          style={[
            styles.logoBadge,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Image
            source={IMAGES.patientPortalLogo}
            fadeDuration={0}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Message & Subtitle */}
      <Text style={[styles.messageText, { color: colors.textPrimary }]}>{message}</Text>
      {subtitle ? <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>{subtitle}</Text> : null}

      {/* Animated Medical Accent Progress Dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.5 }]} />
        <View style={[styles.dot, { backgroundColor: colors.accent, transform: [{ scale: 1.3 }] }]} />
        <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.5 }]} />
      </View>
    </View>
  );

  if (!overlay) {
    return <View style={styles.inlineWrapper}>{content}</View>;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlayBackdrop}>{content}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 35, 65, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inlineWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#00A896',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  iconContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rippleCircle: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#D4F7F2',
  },
  spinnerRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: '#02AAB0',
    borderTopColor: 'transparent',
    borderRightColor: '#0284C7',
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  logoImg: {
    width: 52,
    height: 52,
  },
  messageText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2341',
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default UniversalLoader;
