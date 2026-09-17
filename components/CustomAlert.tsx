import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Alert as RNAlert,
} from 'react-native';
import AppIcon, { IconType } from './Icons';
import { useTheme } from './ThemeContext';

export interface AlertButtonConfig {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertData {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButtonConfig[];
}

type AlertListener = (data: CustomAlertData) => void;

let globalAlertListener: AlertListener | null = null;
let isAlertOverridden = false;

export const setGlobalAlertListener = (listener: AlertListener | null) => {
  globalAlertListener = listener;
};

/**
 * Trigger the custom app-themed alert dialog with curvy corners
 */
export const showAppAlert = (
  title: string,
  message?: string,
  buttons?: AlertButtonConfig[]
) => {
  if (globalAlertListener) {
    globalAlertListener({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default' }],
    });
  } else {
    // Fallback if container not yet mounted
    RNAlert.alert(title, message, buttons as any);
  }
};

/**
 * Initialize global Alert.alert override so all existing alerts
 * across the entire app automatically use the themed curvy alert!
 */
export const initAlertOverride = () => {
  if (isAlertOverridden) return;
  isAlertOverridden = true;

  RNAlert.alert = (title: string, message?: string, buttons?: any) => {
    showAppAlert(title, message, buttons);
  };
};

// Automatically initialize override upon module load
initAlertOverride();

/**
 * Helper to determine icon & color theme based on title & buttons
 */
const getAlertTheme = (title: string, buttons?: AlertButtonConfig[]) => {
  const lowerTitle = title.toLowerCase();
  const hasDestructive = buttons?.some((b) => b.style === 'destructive');

  if (hasDestructive || lowerTitle.includes('logout') || lowerTitle.includes('remove') || lowerTitle.includes('delete')) {
    return {
      icon: (lowerTitle.includes('logout') ? 'logout' : 'trash') as IconType,
      iconColor: '#DC2626',
      badgeBg: '#FEE2E2',
      badgeBorder: '#FECACA',
      accentColor: '#DC2626',
    };
  }

  if (lowerTitle.includes('success') || lowerTitle.includes('added') || lowerTitle.includes('updated') || lowerTitle.includes('reset') || lowerTitle.includes('sent')) {
    return {
      icon: 'check' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('bill') || lowerTitle.includes('pay')) {
    return {
      icon: 'wallet-outline' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('diet')) {
    return {
      icon: 'food-apple-outline' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('visit') || lowerTitle.includes('appointment')) {
    return {
      icon: 'calendar' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('family') || lowerTitle.includes('member')) {
    return {
      icon: 'users' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('pin') || lowerTitle.includes('security')) {
    return {
      icon: 'key' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('notification')) {
    return {
      icon: 'bell' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('qr') || lowerTitle.includes('digital medical')) {
    return {
      icon: 'qrcode' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('report') || lowerTitle.includes('audit') || lowerTitle.includes('record')) {
    return {
      icon: 'document' as IconType,
      iconColor: '#0083B0',
      badgeBg: '#DEF0FD',
      badgeBorder: '#BAE6FD',
      accentColor: '#0083B0',
    };
  }

  if (lowerTitle.includes('required') || lowerTitle.includes('invalid') || lowerTitle.includes('mismatch') || lowerTitle.includes('error')) {
    return {
      icon: 'alert-circle' as IconType,
      iconColor: '#D97706',
      badgeBg: '#FEF3C7',
      badgeBorder: '#FDE68A',
      accentColor: '#D97706',
    };
  }

  // Default App Theme Notice
  return {
    icon: 'info' as IconType,
    iconColor: '#0083B0',
    badgeBg: '#DEF0FD',
    badgeBorder: '#BAE6FD',
    accentColor: '#0083B0',
  };
};

export const CustomAlertContainer: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { isDark, colors } = useTheme();

  const [alertData, setAlertData] = useState<CustomAlertData>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const [scaleAnim] = useState(new Animated.Value(0.92));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    setGlobalAlertListener((data) => {
      setAlertData(data);
      if (data.visible) {
        scaleAnim.setValue(0.92);
        opacityAnim.setValue(0);
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    return () => {
      setGlobalAlertListener(null);
    };
  }, [scaleAnim, opacityAnim]);

  const handleClose = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setAlertData((prev) => ({ ...prev, visible: false }));
    });
  };

  const handleButtonPress = (btn: AlertButtonConfig) => {
    handleClose();
    if (btn.onPress) {
      setTimeout(() => {
        btn.onPress?.();
      }, 80);
    }
  };

  if (!alertData.visible) return null;

  const buttons = alertData.buttons && alertData.buttons.length > 0
    ? alertData.buttons
    : [{ text: 'OK', style: 'default' as const }];

  const theme = getAlertTheme(alertData.title, buttons);

  return (
    <Modal
      visible={alertData.visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Curvy Alert Dialog Box */}
        <Animated.View
          style={[
            styles.alertCard,
            {
              width: Math.min(width - 44, isTablet ? 420 : 340),
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: isDark ? 1 : 1.5,
            },
          ]}
        >
          {/* Top Curvy Theme Badge with Icon */}
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: isDark ? colors.surfaceVariant : theme.badgeBg,
                borderColor: isDark ? colors.border : theme.badgeBorder,
              },
            ]}
          >
            <AppIcon name={theme.icon} size={28} color={theme.iconColor} />
          </View>

          {/* Curvy Accent Header Border Line */}
          <View style={[styles.curvyTopAccent, { backgroundColor: theme.accentColor }]} />

          {/* Title in Deep Navy or Theme Primary Text */}
          <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>{alertData.title}</Text>

          {/* Message Text */}
          {!!alertData.message && (
            <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>{alertData.message}</Text>
          )}

          {/* Curvy Action Buttons */}
          <View
            style={[
              styles.buttonsContainer,
              buttons.length === 2 && styles.buttonsRow,
              buttons.length > 2 && styles.buttonsColumn,
            ]}
          >
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';

              const btnStyle: any = isCancel
                ? [styles.cancelButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]
                : isDestructive
                ? styles.destructiveButton
                : styles.defaultButton;

              const textStyle: any = isCancel
                ? [styles.cancelButtonText, { color: colors.textSecondary }]
                : isDestructive
                ? styles.destructiveButtonText
                : styles.defaultButtonText;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.buttonBase,
                    btnStyle,
                    buttons.length === 2 && { flex: 1 },
                  ]}
                  onPress={() => handleButtonPress(btn)}
                  activeOpacity={0.8}
                >
                  <Text style={textStyle}>{btn.text || 'OK'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Curvy corners
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  curvyTopAccent: {
    position: 'absolute',
    top: 0,
    left: 28,
    right: 28,
    height: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29, // Curvy circle
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0F253E',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  alertMessage: {
    fontSize: 13.8,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  buttonsContainer: {
    width: '100%',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonsColumn: {
    flexDirection: 'column',
    gap: 10,
  },
  buttonBase: {
    paddingVertical: 12.5,
    paddingHorizontal: 16,
    borderRadius: 14, // Curvy button corners
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButton: {
    backgroundColor: '#0083B0', // App theme blue
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  defaultButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
  },
  destructiveButton: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  destructiveButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CustomAlertContainer;
