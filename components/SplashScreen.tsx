import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  View,
  Text,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import IMAGES from './imageAssets';
import { useTheme } from './ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number; // Duration in milliseconds before fading out
}

export default function SplashScreen({ onFinish, duration = 2500 }: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  // Animations
  const screenFadeAnim = useRef(new Animated.Value(1)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.82)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    // 1. Entrance animation (Logo pops & fades in, then text slides up)
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Exit transition: fade out after specified duration
    const timer = setTimeout(() => {
      Animated.timing(screenFadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, Math.max(duration, 1500));

    return () => clearTimeout(timer);
  }, [duration, onFinish, screenFadeAnim, logoScaleAnim, logoFadeAnim, textFadeAnim, textSlideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFadeAnim,
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Decorative Top Accent Glow */}
      <View style={[styles.topAccentBar, { backgroundColor: colors.primary }]} />

      {/* Main Center Branding */}
      <View style={styles.centerContent}>
        {/* Animated Patient Portal Heart Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            isTablet && { width: 124, height: 124, borderRadius: 32 },
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: colors.border,
              shadowColor: colors.primary,
              opacity: logoFadeAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          <Image
            source={IMAGES.patientPortalLogo}
            fadeDuration={0}
            style={[styles.logoImage, isTablet && { width: 110, height: 110 }]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Brand Title & Subtitle */}
        <Animated.View
          style={[
            styles.brandTextContainer,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textSlideAnim }],
            },
          ]}
        >
          <View style={styles.brandTitleRow}>
            <Text style={[styles.brandTitleDark, { color: colors.textPrimary }, isTablet && { fontSize: 42 }]}>Patient </Text>
            <Text style={[styles.brandTitleTeal, { color: colors.primary }, isTablet && { fontSize: 42 }]}>Portal</Text>
          </View>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }, isTablet && { fontSize: 16.5, marginTop: 8 }]}>
            Care Today. Healthier Tomorrow.
          </Text>

          {/* Minimal Animated Pulse Dots */}
          <View style={styles.pulseContainer}>
            <View style={[styles.pulseDot, { backgroundColor: colors.primary, opacity: 0.4 }]} />
            <View style={[styles.pulseDot, { backgroundColor: colors.accent, transform: [{ scale: 1.25 }] }]} />
            <View style={[styles.pulseDot, { backgroundColor: colors.primary, opacity: 0.4 }]} />
          </View>
        </Animated.View>
      </View>

      {/* Bottom Wave Footer pinned to edge */}
      <View style={styles.waveFooterContainer}>
        <Image
          source={IMAGES.waveFooterBg}
          fadeDuration={0}
          style={[
            styles.waveFooterImage,
            {
              height: isTablet ? 290 : 210,
            },
          ]}
          resizeMode="stretch"
        />

        {/* Subtle Bottom Trust Mark */}
        <View style={styles.trustBadge}>
          <Text style={[styles.trustBadgeText, isTablet && { fontSize: 13 }]}>
            Patient Portal • Secure Healthcare Access
          </Text>
        </View>
      </View>
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
    backgroundColor: '#F8FAFE',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9999,
  },
  topAccentBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#02AAB0',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  logoWrapper: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A896',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  logoImage: {
    width: 86,
    height: 86,
  },
  brandTextContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandTitleDark: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0B2341',
    letterSpacing: -0.5,
  },
  brandTitleTeal: {
    fontSize: 32,
    fontWeight: '800',
    color: '#02AAB0',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  waveFooterContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  waveFooterImage: {
    width: '100%',
    height: 210,
  },
  trustBadge: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 18 : 12,
    alignSelf: 'center',
  },
  trustBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0B2341',
    opacity: 0.75,
    letterSpacing: 0.3,
  },
});
