import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  Switch,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';

interface DashboardScreenProps {
  userSession: UserSession;
  onOpenPatientList: (tab?: 'Home' | 'Visits' | 'Reports' | 'Care') => void;
  onOpenBookVisit?: () => void;
  onOpenPayBills?: () => void;
  onOpenVisits?: () => void;
  onLogout: () => void;
  onChangePin?: () => void;
}

// Avatar mapping: Exact match with patient list / member list avatars
const getUserAvatarSource = (name?: string, customUri?: string, customAvatar?: any) => {
  if (customAvatar) return customAvatar;
  if (customUri) return { uri: customUri };
  const nameLower = (name || '').toLowerCase();
  if (nameLower.includes('rathi') || nameLower.includes('sharma') || !name) {
    return require('../assets/images/avatar_male.png');
  }
  if (nameLower.includes('kavita')) {
    return require('../assets/images/avatar_kavita.png');
  }
  if (nameLower.includes('aarav')) {
    return require('../assets/images/avatar_aarav.png');
  }
  if (nameLower.includes('deepak')) {
    return require('../assets/images/avatar_deepak.png');
  }
  return require('../assets/images/avatar_male.png');
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userSession,
  onOpenPatientList,
  onOpenBookVisit,
  onOpenPayBills,
  onOpenVisits,
  onLogout,
  onChangePin,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { theme, setTheme, isDark, colors } = useTheme();

  // Slide Bar & Settings State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'Home' | 'Visits' | 'Reports' | 'Care'>('Home');
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const slideAnim = useRef(new Animated.Value(520)).current;

  // Universal Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  const openSlideBar = () => {
    setShowProfileMenu(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const closeSlideBar = () => {
    Animated.timing(slideAnim, {
      toValue: 520,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowProfileMenu(false);
    });
  };

  const handleLogoutConfirm = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to securely log out of Patient Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          closeSlideBar();
          setLoaderState({
            visible: true,
            message: 'Logging out...',
            subtitle: 'Ending patient session securely',
          });
          setTimeout(() => {
            setLoaderState({ visible: false });
            onLogout();
          }, 500);
        },
      },
    ]);
  };

  // Determine time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = userSession.name || 'Rathi Vijay Sharma';
  const userAvatarSource = getUserAvatarSource(
    userSession.name,
    userSession.customAvatarUri,
    userSession.userAvatar
  );
  const displayInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RS';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* APP-THEMED AMBIENT PARENT BACKGROUND LAYER */}
        <View style={styles.ambientBgContainer} pointerEvents="none">
          {/* Top-right soft cyan ambient glow */}
          <View style={[styles.ambientTopGlow, isDark && { backgroundColor: '#1E3A5F', opacity: 0.3 }]} />

          {/* Mid-screen subtle healthcare ambient glow */}
          <View style={[styles.ambientMidGlow, isDark && { backgroundColor: '#162032', opacity: 0.2 }]} />

          {/* App's signature healthcare leaves & waves graphic watermark */}
          <Image
            source={require('../assets/images/leaves_wave_bg.png')}
            style={[styles.ambientWaveImage, isDark && { opacity: 0.07 }]}
            resizeMode="cover"
          />
        </View>

        {/* TOP HEADER ROW: Dashboard title centered in Blue, Curvy bottom line, Notifications + Profile Cartoon Avatar */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: isTablet ? 14 : 12,
            },
          ]}
        >
          {/* Left placeholder to balance right buttons and keep center title perfectly centered */}
          <View style={[styles.headerSideGroup, isTablet && { width: 104 }]} />

          {/* Centered Blue Header Title: Dashboard (No secondary text) */}
          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
              Dashboard
            </Text>
          </View>

          {/* Right Group: Notification Bell + Cartoon Avatar DP */}
          <View style={[styles.headerSideGroup, styles.headerRightGroup, isTablet && { width: 104, gap: 14 }]}>
            {/* Notification Bell with Badge Dot */}
            <TouchableOpacity
              style={[
                styles.bellButton,
                isDark && { backgroundColor: colors.borderLight },
                isTablet && { width: 44, height: 44, borderRadius: 22 },
              ]}
              onPress={() => Alert.alert('Notifications', 'You have 5 recent notifications from hospital staff.')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon name="bell" size={isTablet ? 24 : 21} color="#0083B0" />
              <View style={[styles.bellBadgeDot, isTablet && { top: 7, right: 8, width: 9, height: 9 }]} />
            </TouchableOpacity>

            {/* Profile Icon Button (triggers profile slide tab) */}
            <TouchableOpacity
              style={[
                styles.profileIconBtn,
                isDark && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                isTablet && { width: 44, height: 44, borderRadius: 22 },
              ]}
              onPress={openSlideBar}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="user" size={isTablet ? 23 : 20} color="#0083B0" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: insets.bottom + (isTablet ? 110 : 85),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. GOOD MORNING GREETING (NO BG, NO BORDER, NO DP, BIG GREETING, SMALLER NAME) */}
          <View style={[styles.greetingSection, isTablet && { marginBottom: 16 }]}>
            <View style={styles.greetingPillRow}>
            </View>

            <Text style={[styles.greetingBigHeading, { color: colors.textPrimary }, isTablet && { fontSize: 28 }]}>
              {getGreeting()},
            </Text>

            <Text style={[styles.greetingUserNameText, { color: colors.primary }, isTablet && { fontSize: 18 }]}>
              {displayName}
            </Text>

            <Text style={[styles.greetingEncouragementText, { color: colors.textSecondary }, isTablet && { fontSize: 13.5 }]}>
              {/* Wishing you good health & vitality today */}
            </Text>
          </View>

          {/* 2. TOP QUICK ACTION ROW (4 ICONS) */}
          <View style={[styles.quickActionsGrid, isTablet && { gap: 14, marginBottom: 20 }]}>
            {/* Card 1: Book Visit */}
            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: isDark ? colors.surface : '#E0F2FE', borderColor: isDark ? colors.border : '#BAE6FD' },
                isTablet && styles.actionCardTablet,
              ]}
              onPress={onOpenBookVisit || (() => Alert.alert('Book Visit', 'Select doctor or department to book a new appointment.'))}
              activeOpacity={0.75}
            >
              <AppIcon name="calendar" size={isTablet ? 30 : 26} color="#0083B0" />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }, isTablet && { fontSize: 13.5 }]}>
                Book Visit
              </Text>
            </TouchableOpacity>

            {/* Card 2: Pay Bills */}
            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: isDark ? colors.surface : '#E0F2FE', borderColor: isDark ? colors.border : '#BAE6FD' },
                isTablet && styles.actionCardTablet,
              ]}
              onPress={onOpenPayBills || (() => Alert.alert('Pay Bills', 'Viewing outstanding bills & payment options.'))}
              activeOpacity={0.75}
            >
              <AppIcon name="wallet-outline" size={isTablet ? 30 : 26} color="#0083B0" />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }, isTablet && { fontSize: 13.5 }]}>
                Pay Bills
              </Text>
            </TouchableOpacity>

            {/* Card 3: Diet Plan */}
            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: isDark ? colors.surface : '#E0F2FE', borderColor: isDark ? colors.border : '#BAE6FD' },
                isTablet && styles.actionCardTablet,
              ]}
              onPress={() => Alert.alert('Diet Plan', 'Viewing personalized nutritionist diet instructions.')}
              activeOpacity={0.75}
            >
              <AppIcon name="food-apple-outline" size={isTablet ? 30 : 26} color="#0083B0" />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }, isTablet && { fontSize: 13.5 }]}>
                Diet Plan
              </Text>
            </TouchableOpacity>

            {/* Card 4: Add Member */}
            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: isDark ? colors.surface : '#E0F2FE', borderColor: isDark ? colors.border : '#BAE6FD' },
                isTablet && styles.actionCardTablet,
              ]}
              onPress={() => onOpenPatientList()}
              activeOpacity={0.75}
            >
              <AppIcon name="usergroup-add" size={isTablet ? 30 : 26} color="#0083B0" />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }, isTablet && { fontSize: 13.5 }]}>
                Add Member
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. OUTSTANDING BILLS CARD */}
          <View
            style={[
              styles.billsSummaryCard,
              { backgroundColor: colors.surface, borderColor: isDark ? '#7F1D1D' : '#FEE2E2' },
              isTablet && { padding: 20, marginBottom: 18 },
            ]}
          >
            <View style={styles.billsLeftCol}>
              <View style={styles.billsTitleBadgeRow}>
                <Text style={[styles.billsTitleText, { color: colors.textPrimary }, isTablet && { fontSize: 16 }]}>
                  Outstanding Bills
                </Text>
                <View style={[styles.billsCountPill, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}>
                  <Text style={[styles.billsCountText, { color: colors.textSecondary }]}>2</Text>
                </View>
              </View>
              <Text style={[styles.billsAmountRed, isTablet && { fontSize: 22 }]}>₹2,000</Text>
            </View>

            <TouchableOpacity
              style={[styles.payBillsButton, isTablet && { paddingHorizontal: 22, height: 46 }]}
              onPress={onOpenPayBills || (() => Alert.alert('Pay Bills', 'Proceeding to secure hospital gateway to clear ₹2,000.'))}
              activeOpacity={0.88}
            >
              <Text style={[styles.payBillsText, isTablet && { fontSize: 15 }]}>Pay Bills</Text>
              <View style={{ marginLeft: 6 }}>
                <AppIcon name="arrow-right" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* 4. FAMILY MEMBERS SUMMARY CARD */}
          <TouchableOpacity
            style={[
              styles.familySummaryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isTablet && { padding: 18, marginBottom: 18 },
            ]}
            onPress={() => onOpenPatientList()}
            activeOpacity={0.85}
          >
            <View>
              <Text style={[styles.familyCardTitle, { color: colors.textPrimary }, isTablet && { fontSize: 18 }]}>
                Family Members
              </Text>
              <Text style={[styles.familyCardSub, { color: colors.textSecondary }, isTablet && { fontSize: 13.5 }]}>
                4 Members
              </Text>
            </View>

            {/* Overlapping Avatars for 4 Members: Rathi (Self), Kavita (Wife), Aarav (Son), Deepak (Brother) */}
            <View style={styles.avatarsGroupRow}>
              {/* Member 1: Main Owner - Rathi Vijay Sharma */}
              <View style={[styles.stackedAvatarCircle, { borderColor: colors.surface, backgroundColor: '#DEF0FD', zIndex: 4, marginRight: -10 }]}>
                <Image
                  source={require('../assets/images/avatar_male.png')}
                  style={styles.stackedAvatarImg}
                  resizeMode="cover"
                />
              </View>

              {/* Member 2: Wife - Kavita Chouhan */}
              <View style={[styles.stackedAvatarCircle, { borderColor: colors.surface, backgroundColor: '#FDE1E7', zIndex: 3, marginRight: -10 }]}>
                <Image
                  source={require('../assets/images/avatar_kavita.png')}
                  style={styles.stackedAvatarImg}
                  resizeMode="cover"
                />
              </View>

              {/* Member 3: Son - Aarav Chouhan */}
              <View style={[styles.stackedAvatarCircle, { borderColor: colors.surface, backgroundColor: '#DEF0FD', zIndex: 2, marginRight: -10 }]}>
                <Image
                  source={require('../assets/images/avatar_aarav.png')}
                  style={styles.stackedAvatarImg}
                  resizeMode="cover"
                />
              </View>

              {/* Member 4: Brother - Deepak Chouhan */}
              <View style={[styles.stackedAvatarCircle, { borderColor: colors.surface, backgroundColor: '#DEF0FD', zIndex: 1 }]}>
                <Image
                  source={require('../assets/images/avatar_deepak.png')}
                  style={styles.stackedAvatarImg}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.familyChevronBox}>
                <AppIcon name="chevron-right" size={20} color={colors.textMuted} />
              </View>
            </View>
          </TouchableOpacity>

          {/* 5. UPCOMING APPOINTMENTS SECTION (2 COMPACT CARDS WITH DOCTOR CARTOON DPS) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }, isTablet && { fontSize: 17 }]}>
              Upcoming Appointments
            </Text>
          
          </View>

          {/* Appointment Card 1: Dr. Chakravarthi PIS */}
          <View
            style={[
              styles.compactAppointmentCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isTablet && { padding: 16, marginBottom: 14 },
            ]}
          >
            <View style={styles.compactDocRow}>
              <View style={styles.compactDocAvatarBox}>
                <Image
                  source={require('../assets/images/avatar_doctor.png')}
                  style={[styles.compactDocAvatar, isDark && { borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
                  resizeMode="cover"
                />
                <View style={[styles.compactVerifiedBadge, { borderColor: colors.surface }]}>
                  <AppIcon name="check" size={9} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.compactDocDetails}>
                <Text style={[styles.compactDocName, { color: colors.textPrimary }, isTablet && { fontSize: 16.5 }]}>
                  Dr. Chakravarthi PIS
                </Text>
                <View style={styles.compactSpecRow}>
                  <View style={[styles.compactSpecPill, isDark && { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.compactSpecText, isDark && { color: '#38BDF8' }]}>Cardiology</Text>
                  </View>
                  <Text style={[styles.compactQualText, { color: colors.textSecondary }]}>• MBBS, MD</Text>
                </View>
              </View>

              <View style={styles.compactStatusPill}>
                <AppIcon name="check" size={11} color="#16A34A" />
                <Text style={styles.compactStatusText}>Paid</Text>
              </View>
            </View>

            <View
              style={[
                styles.compactMetaStrip,
                {
                  backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF',
                  borderColor: isDark ? colors.border : '#E0F2FE',
                },
              ]}
            >
              <View style={styles.compactMetaItem}>
                <AppIcon name="calendar" size={12.5} color="#0083B0" />
                <Text style={[styles.compactMetaText, { color: colors.textSecondary }]}>13 Jun, 2026</Text>
              </View>

              <View style={[styles.compactMetaDivider, { backgroundColor: colors.divider }] } />

              <View style={styles.compactMetaItem}>
                <AppIcon name="clock" size={12.5} color="#0083B0" />
                <Text style={[styles.compactMetaText, { color: colors.textSecondary }]}>05:00 PM</Text>
              </View>

              <View style={[styles.compactMetaDivider, { backgroundColor: colors.divider }]} />

              <View style={styles.compactMetaItem}>
                <AppIcon name="user" size={12.5} color="#0083B0" />
                <Text style={[styles.compactMetaText, { color: colors.textSecondary }]}>Vijay H Sharma</Text>
              </View>
            </View>
          </View>

          {/* Appointment Card 2: Dr. Ananya Roy */}
          <View
            style={[
              styles.compactAppointmentCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isTablet && { padding: 16, marginBottom: 20 },
            ]}
          >
            <View style={styles.compactDocRow}>
              <View style={styles.compactDocAvatarBox}>
                <Image
                  source={require('../assets/images/avatar_doctor_female.png')}
                  style={[styles.compactDocAvatar, isDark && { borderColor: colors.border, backgroundColor: colors.surfaceVariant }]}
                  resizeMode="cover"
                />
                <View style={[styles.compactVerifiedBadge, { borderColor: colors.surface }]}>
                  <AppIcon name="check" size={9} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.compactDocDetails}>
                <Text style={[styles.compactDocName, { color: colors.textPrimary }, isTablet && { fontSize: 16.5 }]}>
                  Dr. Ananya Roy
                </Text>
                <View style={styles.compactSpecRow}>
                  <View style={[styles.compactSpecPill, isDark && { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.compactSpecText, isDark && { color: '#38BDF8' }]}>Pediatrics</Text>
                  </View>
                  <Text style={[styles.compactQualText, { color: colors.textSecondary }]}>• MBBS</Text>
                </View>
              </View>

              <View style={styles.compactStatusPill}>
                <AppIcon name="check" size={11} color="#16A34A" />
                <Text style={styles.compactStatusText}>Paid</Text>
              </View>
            </View>

            <View
              style={[
                styles.compactMetaStrip,
                {
                  backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF',
                  borderColor: isDark ? colors.border : '#E0F2FE',
                },
              ]}
            >
              <View style={styles.compactMetaItem}>
                <AppIcon name="calendar" size={12.5} color="#0083B0" />
                <Text style={[styles.compactMetaText, { color: colors.textSecondary }]}>18 Jun, 2026</Text>
              </View>

              <View style={[styles.compactMetaDivider, { backgroundColor: colors.divider }]} />

              <View style={styles.compactMetaItem}>
                <AppIcon name="clock" size={12.5} color="#0083B0" />
                <Text style={[styles.compactMetaText, { color: colors.textSecondary }]}>11:30 AM</Text>
              </View>

              <View style={[styles.compactMetaDivider, { backgroundColor: colors.divider }]} />

              <View style={styles.compactMetaItem}>
                <AppIcon name="user" size={12.5} color="#0083B0" />
                <Text style={[styles.compactMetaText, { color: colors.textSecondary }]}>Aarav Chouhan</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 5-TAB FIXED BOTTOM NAVIGATION BAR */}
        <View
          style={[
            styles.bottomNavBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          {/* Tab 1: Home */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => setActiveTab('Home')}
          >
            {activeTab === 'Home' ? (
              <View style={styles.activeIndicatorBar} />
            ) : (
              <View style={styles.inactiveIndicatorPlaceholder} />
            )}
            <AppIcon
              name="home"
              size={isTablet ? 26 : 22}
              color={activeTab === 'Home' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Home' ? '#0083B0' : colors.textMuted },
                activeTab === 'Home' && styles.navLabelActive,
                isTablet && { fontSize: 13 },
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Visits */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('Visits');
              if (onOpenVisits) {
                onOpenVisits();
              } else {
                Alert.alert('Visits', 'Viewing your appointments and visit schedule.');
              }
            }}
          >
            {activeTab === 'Visits' ? (
              <View style={styles.activeIndicatorBar} />
            ) : (
              <View style={styles.inactiveIndicatorPlaceholder} />
            )}
            <AppIcon
              name="calendar"
              size={isTablet ? 26 : 22}
              color={activeTab === 'Visits' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Visits' ? '#0083B0' : colors.textMuted },
                activeTab === 'Visits' && styles.navLabelActive,
                isTablet && { fontSize: 13 },
              ]}
            >
              Visits
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Reports */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('Reports');
              if (onOpenPatientList) onOpenPatientList('Reports');
            }}
          >
            {activeTab === 'Reports' ? (
              <View style={styles.activeIndicatorBar} />
            ) : (
              <View style={styles.inactiveIndicatorPlaceholder} />
            )}
            <AppIcon
              name="document"
              size={isTablet ? 26 : 22}
              color={activeTab === 'Reports' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Reports' ? '#0083B0' : colors.textMuted },
                activeTab === 'Reports' && styles.navLabelActive,
                isTablet && { fontSize: 13 },
              ]}
            >
              Reports
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Care */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab('Care');
              Alert.alert('Care', 'Health programs, diet charts, and doctor chat.');
            }}
          >
            {activeTab === 'Care' ? (
              <View style={styles.activeIndicatorBar} />
            ) : (
              <View style={styles.inactiveIndicatorPlaceholder} />
            )}
            <AppIcon
              name="care"
              size={isTablet ? 26 : 22}
              color={activeTab === 'Care' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Care' ? '#0083B0' : colors.textMuted },
                activeTab === 'Care' && styles.navLabelActive,
                isTablet && { fontSize: 13 },
              ]}
            >
              Care
            </Text>
          </TouchableOpacity>
        </View>

        {/* PROFILE SLIDE BAR MODAL */}
        <Modal
          visible={showProfileMenu}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeSlideBar}
        >
          <View style={styles.slideBarOverlay}>
            <TouchableOpacity
              style={styles.slideBarBackdrop}
              activeOpacity={1}
              onPress={closeSlideBar}
            />

            <Animated.View
              style={[
                styles.slideBarPanel,
                {
                  backgroundColor: colors.surface,
                  transform: [{ translateX: slideAnim }],
                  width: isTablet ? 460 : '86%',
                  paddingTop: Math.max(insets.top, 16),
                  paddingBottom: Math.max(insets.bottom, 20),
                },
              ]}
            >
              <View
                style={[
                  styles.slideBarHeader,
                  {
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slideBarTitle, { color: colors.textPrimary }]}>
                    Profile & Settings
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.slideBarCloseBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                  onPress={closeSlideBar}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <AppIcon name="close" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.slideBarScrollContent}
              >
                {/* User Identity Banner with Profile Pic & Verified Badge */}
                <View style={[styles.slideUserBanner, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                  <View style={[styles.slideAvatarWrapper, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD', overflow: 'hidden' }]}>
                    <Image
                      source={userAvatarSource}
                      style={styles.slideAvatarImg}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.slideUserName, { color: colors.textPrimary }]}>{displayName}</Text>
                      <View style={[styles.verifiedBadge, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                        <AppIcon name="check" size={11} color="#0083B0" />
                      </View>
                    </View>
                    <Text style={styles.slideUserUhid}>UHID: 109282827</Text>
                    <Text style={[styles.slideUserMobile, { color: colors.textSecondary }]}>
                      +91 {userSession.mobileNumber || '9414023873'}
                    </Text>
                  </View>
                </View>

                {/* SECTION 1: HOSPITAL REGISTRATION (MRD) */}
                <View style={styles.slideSectionContainer}>
                  <View style={styles.slideSectionHeaderRow}>
                 
                  </View>
                  <View style={[styles.mrdDetailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.mrdRow}>
                      <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Full Name</Text>
                      <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>{displayName}</Text>
                    </View>
                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    <View style={styles.mrdRow}>
                      <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Date of Birth</Text>
                      <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>1992-05-14</Text>
                    </View>
                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    <View style={styles.mrdRow}>
                      <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Gender</Text>
                      <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>Male</Text>
                    </View>
                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    <View style={styles.mrdRow}>
                      <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Primary Mobile</Text>
                      <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>{userSession.mobileNumber || '9414023873'}</Text>
                    </View>
                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    <View style={styles.mrdRow}>
                      <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>UHID</Text>
                      <Text style={styles.mrdValueAccent}>109282827</Text>
                    </View>
                  </View>
                </View>

                {/* SECTION 2: ACCOUNT */}
                <View style={styles.slideSectionContainer}>
                  <Text style={[styles.slideSectionHeader, { color: colors.textSecondary }]}>Account</Text>
                  <View style={[styles.slideMenuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {/* Digital Medical ID */}
                  

                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    {/* My Family */}
                    <TouchableOpacity
                      style={styles.slideMenuItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        closeSlideBar();
                        onOpenPatientList();
                      }}
                    >
                      <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                        <AppIcon name="users" size={19} color="#0083B0" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>My Family</Text>
                        <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>4 member(s)</Text>
                      </View>
                      <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    {/* Request Profile Correction */}
                    <TouchableOpacity
                      style={styles.slideMenuItem}
                      activeOpacity={0.7}
                      onPress={() => Alert.alert('Profile Correction', 'Submit request to hospital registration desk to update name, DOB, gender or mobile number.')}
                    >
                      <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                        <AppIcon name="edit" size={19} color="#0083B0" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
                        <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Name, DOB, gender or mobile number</Text>
                      </View>
                      <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.mrdDivider} />

                  

                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    {/* Who Can Access My Records */}
                    <TouchableOpacity
                      style={styles.slideMenuItem}
                      activeOpacity={0.7}
                      onPress={() => Alert.alert('Access Permissions', '2 active grant(s) for family members & assigned doctors.')}
                    >
                      <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                        <AppIcon name="shield-check" size={19} color="#0083B0" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Who Can Access My Records</Text>
                        <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>2 active grant(s)</Text>
                      </View>
                      <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    {/* Announcements */}
                    <TouchableOpacity
                      style={styles.slideMenuItem}
                      activeOpacity={0.7}
                      onPress={() => Alert.alert('Announcements', 'No new hospital announcements today.')}
                    >
                      <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                        <AppIcon name="bullhorn" size={19} color="#0083B0" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Announcements</Text>
                        <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Hospital notices & OPD timings</Text>
                      </View>
                      <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    {/* Medical Records */}
                    <TouchableOpacity
                      style={styles.slideMenuItem}
                      activeOpacity={0.7}
                      onPress={() => Alert.alert('Medical Records', 'Visit history, reports & prescriptions.')}
                    >
                      <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                        <AppIcon name="hospital" size={19} color="#0083B0" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Medical Records</Text>
                        <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Visit history, reports & prescriptions</Text>
                      </View>
                      <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                    </TouchableOpacity>

                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                    {/* Security PIN */}
                    <TouchableOpacity
                      style={styles.slideMenuItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (onChangePin) {
                          closeSlideBar();
                          onChangePin();
                        } else {
                          Alert.alert('Security PIN', 'Updating 4-digit login PIN.');
                        }
                      }}
                    >
                      <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                        <AppIcon name="key" size={19} color="#0083B0" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Security PIN</Text>
                        <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Change login PIN</Text>
                      </View>
                      <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* SECTION 3: DISPLAY & ACCESSIBILITY */}
                <View style={styles.slideSectionContainer}>
                  <Text style={[styles.slideSectionHeader, { color: colors.textSecondary }]}>DISPLAY & ACCESSIBILITY</Text>
                  <View style={[styles.slideMenuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {/* Dark Mode: 2 Modes (Light & Dark) */}
                    <View style={{ padding: 14 }}>
                      <Text style={[styles.displayRowLabel, { color: colors.textPrimary }]}>Appearance Theme</Text>
                      <View style={[styles.themeSegmentContainer, { backgroundColor: isDark ? '#162032' : '#F1F5F9' }]}>
                        {(['Light', 'Dark'] as const).map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[
                              styles.themeSegmentBtn,
                              theme === t && styles.themeSegmentBtnActive,
                            ]}
                            onPress={() => setTheme(t)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.themeSegmentText,
                                theme === t && styles.themeSegmentTextActive,
                              ]}
                            >
                              {t}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                 
                  </View>
                </View>
              </ScrollView>

              {/* STICKY FIXED LOGOUT BUTTON AT THE BOTTOM */}
              <View
                style={[
                  styles.slideStickyFooter,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: Math.max(insets.bottom, 16),
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.slideLogoutBtn,
                    isDark && { backgroundColor: '#3B1A1A', borderColor: '#7F1D1D' },
                  ]}
                  onPress={handleLogoutConfirm}
                  activeOpacity={0.88}
                >
                  <AppIcon name="logout" size={18} color="#EF4444" />
                  <Text style={styles.slideLogoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Universal Loader */}
        <UniversalLoader
          visible={loaderState.visible}
          message={loaderState.message}
          subtitle={loaderState.subtitle}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EDF5F8',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#EDF5F8',
    position: 'relative',
  },

  // AMBIENT HEALTHCARE BACKGROUND
  ambientBgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#DEF0FD',
    opacity: 0.65,
  },
  ambientMidGlow: {
    position: 'absolute',
    top: '36%',
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E0F2FE',
    opacity: 0.45,
  },
  ambientWaveImage: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    width: '100%',
    height: 290,
    opacity: 0.22,
  },

  // 1. TOP HEADER BAR (Curvy bottom line, Blue centered title)
  headerBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerSideGroup: {
    width: 88,
  },
  headerCenterGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCentered: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0083B0',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    position: 'relative',
  },
  profileOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // 2. GREETING SECTION (CLEAN, NO BG, NO BORDER, NO DP)
  greetingSection: {
    paddingHorizontal: 4,
    paddingTop: 4,
    marginBottom: 16,
  },
  greetingPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greetingTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  greetingTimeBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0083B0',
  },
  greetingBigHeading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  greetingUserNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0083B0',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  greetingEncouragementText: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 17,
  },

  // SCROLL CONTENT
  scrollContent: {
    flexGrow: 1,
  },

  // 1. 4 TOP ACTION CARDS (MATCHING REFERENCE MOCKUP)
  quickActionsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 82,
  },
  actionCardTablet: {
    paddingVertical: 18,
    minHeight: 104,
    borderRadius: 20,
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 6,
  },

  // FIXED BOTTOM NAVIGATION BAR
  bottomNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 10,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  activeIndicatorBar: {
    width: 22,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0083B0',
    marginBottom: 5,
  },
  inactiveIndicatorPlaceholder: {
    width: 22,
    height: 3,
    marginBottom: 5,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#0083B0',
    fontWeight: '700',
  },

  // FAMILY SUMMARY CARD
  familySummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  familyCardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  familyCardSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  avatarsGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stackedAvatarImg: {
    width: 36,
    height: 36,
  },
  avatarBubbleRk: {
    backgroundColor: '#DEF0FD',
  },
  avatarBubbleAs1: {
    backgroundColor: '#E0F2FE',
  },
  avatarBubbleAs2: {
    backgroundColor: '#FDE1E7',
  },
  stackedAvatarInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  familyChevronBox: {
    marginLeft: 10,
  },

  // OUTSTANDING BILLS CARD
  billsSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  billsLeftCol: {
    flex: 1,
  },
  billsTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billsTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  billsCountPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  billsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  billsAmountRed: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E11D48',
    marginTop: 4,
  },
  payBillsButton: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 21,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  payBillsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // UPCOMING APPOINTMENTS SECTION (COMPACT & MODERN)
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSeeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0083B0',
  },
  compactAppointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  compactDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  compactDocAvatarBox: {
    position: 'relative',
    marginRight: 11,
  },
  compactDocAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DEF0FD',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  compactVerifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  compactDocDetails: {
    flex: 1,
  },
  compactDocName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  compactSpecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  compactSpecPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compactSpecText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0083B0',
  },
  compactQualText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  compactStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  compactMetaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  compactMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  compactMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  compactMetaDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
  },

  // SLIDE BAR STYLES
  slideBarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  slideBarBackdrop: {
    flex: 1,
  },
  slideBarPanel: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
  },
  slideBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 74,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  slideBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F253E',
    letterSpacing: -0.3,
  },
  slideBarCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideBarScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  slideUserBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  slideAvatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DEF0FD',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  slideUserName: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0B2341',
  },
  slideUserUhid: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0083B0',
    marginTop: 2,
  },
  slideUserMobile: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  slideSectionContainer: {
    marginBottom: 16,
  },
  slideSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slideSectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  mrdDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mrdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mrdLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  mrdValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F253E',
  },
  mrdValueAccent: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0083B0',
  },
  mrdDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  mrdNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 8,
  },
  mrdNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
  },
  slideMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  slideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  slideMenuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  slideMenuItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F253E',
  },
  slideMenuItemSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  displayRowLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  themeSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginTop: 10,
  },
  themeSegmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  themeSegmentBtnActive: {
    backgroundColor: '#0083B0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  themeSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  themeSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  accessibilityDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 6,
  },
  slideStickyFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  slideLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    gap: 8,
  },
  slideLogoutText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#DC2626',
  },
});

export default DashboardScreen;
