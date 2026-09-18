import React, { useState, useRef, useEffect } from 'react';
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
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface DashboardScreenProps {
  userSession: UserSession;
  onOpenPatientList: (tab?: 'Home' | 'Visits' | 'Reports' | 'Care', autoAddMember?: boolean) => void;
  onOpenAddMember?: () => void;
  onOpenBookVisit?: () => void;
  onOpenBookTest?: () => void;
  onOpenPayBills?: () => void;
  onOpenVisits?: () => void;
  onOpenReports?: () => void;
  onOpenCare?: () => void;
  onLogout: () => void;
  onChangePin?: () => void;
}

// Avatar mapping: Exact match with patient list / member list avatars
const getUserAvatarSource = (name?: string, customUri?: string, customAvatar?: any) => {
  if (customAvatar) return customAvatar;
  if (customUri) return { uri: customUri };
  const nameLower = (name || '').toLowerCase();
  if (nameLower.includes('rathi') || nameLower.includes('sharma') || !name) {
    return IMAGES.avatarMale;
  }
  if (nameLower.includes('kavita')) {
    return IMAGES.avatarKavita;
  }
  if (nameLower.includes('aarav')) {
    return IMAGES.avatarAarav;
  }
  if (nameLower.includes('deepak')) {
    return IMAGES.avatarDeepak;
  }
  return IMAGES.avatarMale;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userSession,
  onOpenPatientList,
  onOpenAddMember,
  onOpenBookVisit,
  onOpenBookTest,
  onOpenPayBills,
  onOpenVisits,
  onOpenReports,
  onOpenCare,
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

  // Auto-scroll Promo Carousel State & Ref
  const carouselRef = useRef<any>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const PROMO_BANNERS = [
    {
      id: 'womens_wellness',
      title: "Women's Wellness Clinic",
      subtitle: 'Care Designed Around You • Gynecology, Maternity & Screening',
      image: IMAGES.bannerWomensWellness,
      onPress: () =>
        Alert.alert(
          "Women's Wellness Clinic",
          'Book appointment with specialized Gynecologists & Maternity Care specialists at GMCH Hospital.'
        ),
    },
    {
      id: 'heart_campaign',
      title: 'Heart Health Campaign',
      subtitle: 'Listen to Your Heart Before It Whispers • Special Screening Package',
      image: IMAGES.bannerHeartCampaign,
      onPress: () =>
        Alert.alert(
          'Heart Health Campaign',
          'Special Heart Screening Package activated! Includes ECG, Lipid Profile, BP & Cardiac Consultation.'
        ),
    },
    {
      id: 'surgical_care',
      title: 'Advanced Surgical & Recovery Care',
      subtitle: 'Expertise Across Every Step • Precision Surgery & Personalized Rehab',
      image: IMAGES.bannerSurgicalCare,
      onPress: () =>
        Alert.alert(
          'Advanced Surgical Unit',
          'Consult top surgical specialists & personalized recovery rehabilitation doctors at GMCH Hospital.'
        ),
    },
    {
      id: 'trauma_emergency',
      title: '24/7 Emergency & Trauma Care',
      subtitle: 'Ready When Every Second Counts • Rapid Response & Life Support',
      image: IMAGES.bannerTraumaEmergency,
      onPress: () =>
        Alert.alert(
          '24/7 Emergency Services',
          'Connecting to Hospital Emergency Trauma Desk & Ambulance Helpline (1800-209-4455 / 108).'
        ),
    },
    {
      id: 'community_camp',
      title: 'Community Health Camp',
      subtitle: 'Care That Reaches Everyone • Free Consultation & Health Screening',
      image: IMAGES.bannerCommunityCamp,
      onPress: () =>
        Alert.alert(
          'Community Health Camp',
          'Free health camp registration successful! Open for all age groups at GMCH Community Grounds this Saturday.'
        ),
    },
    {
      id: 'blood_donation',
      title: 'Mega Blood Donation Camp',
      subtitle: 'Donate Blood, Save Lives • Free Health Checkup Included',
      image: IMAGES.bannerBloodDonation,
      onPress: () =>
        Alert.alert(
          'Blood Donation Drive',
          'Thank you for expressing interest in donating blood! Our medical team will contact you for the drive at GMCH Auditorium.'
        ),
    },
  ];

  // Auto-scroll Carousel effect (scrolls every 3.6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % PROMO_BANNERS.length;
        const bannerCardWidth = isTablet ? 560 : width - 12;
        carouselRef.current?.scrollTo({ x: nextIndex * bannerCardWidth, animated: true });
        return nextIndex;
      });
    }, 3600);

    return () => clearInterval(timer);
  }, [width, isTablet, PROMO_BANNERS.length]);

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

  useEffect(() => {
    const onBackPress = () => {
      if (showProfileMenu) {
        closeSlideBar();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showProfileMenu]);

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
            source={IMAGES.leavesWaveBg}
            fadeDuration={0}
            style={[styles.ambientWaveImage, isDark && { opacity: 0.07 }]}
            resizeMode="cover"
          />
        </View>

        {/* TOP HEADER ROW: Subtle Border, "Good morning, <User Name>" greeting (No "Dashboard" text) */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: isDark ? colors.border : '#E2E8F0',
              borderBottomWidth: 1.5,
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: isTablet ? 14 : 12,
            },
          ]}
        >
          {/* Header Left / Center: "Good morning, <User Name>" */}
          <View style={styles.headerGreetingCol}>
            <Text style={[styles.headerGreetingTime, { color: colors.textSecondary }]}>
              {getGreeting()} 👋
            </Text>
            <Text style={[styles.headerGreetingName, { color: '#0083B0' }, isTablet && { fontSize: 20 }]} numberOfLines={1}>
              {displayName}
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
              <AppIcon name="user" size={isTablet ? 27 : 24} color="#0083B0" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: isTablet ? 14 : 12,
              paddingBottom: insets.bottom + (isTablet ? 110 : 85),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. AUTO-SCROLLING RECTANGULAR HOSPITAL BANNER CAROUSEL (100% SINGLE POSTER PER SWIPE, ZERO CROPPING) */}
          <View style={[styles.carouselWrapper, isTablet && { marginBottom: 18 }]}>
            {(() => {
              const cardWidth = isTablet ? 560 : width - 12;
              const cardHeight = isTablet ? 260 : Math.round(cardWidth * 0.54);
              return (
                <ScrollView
                  ref={carouselRef}
                  horizontal
                  pagingEnabled
                  snapToInterval={cardWidth}
                  snapToAlignment="center"
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
                    if (newIndex >= 0 && newIndex < PROMO_BANNERS.length) {
                      setActiveBannerIndex(newIndex);
                    }
                  }}
                  style={{ width: cardWidth, alignSelf: 'center' }}
                >
                  {PROMO_BANNERS.map((banner) => (
                    <TouchableOpacity
                      key={banner.id}
                      style={[
                        styles.posterCard,
                        {
                          width: cardWidth,
                          height: cardHeight,
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={banner.onPress}
                      activeOpacity={0.92}
                    >
                      <Image
                        source={banner.image}
                        fadeDuration={0}
                        style={styles.posterImageBg}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              );
            })()}

            {/* Sleek Pagination Dots */}
            <View style={styles.paginationRow}>
              {PROMO_BANNERS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.paginationDot,
                    i === activeBannerIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* 2. SERVICES & QUICK ACCESS CARD (COMPACT HEIGHT PAYTM-STYLE CARD) */}
          <View
            style={[
              styles.servicesCardContainer,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.border : '#E2E8F0',
              },
              isTablet && { padding: 14, marginBottom: 14 },
            ]}
          >
            {/* Card Header: Title */}
            <View style={styles.servicesCardHeader}>
              <Text style={[styles.servicesCardTitle, { color: colors.textPrimary }, isTablet && { fontSize: 18 }]}>
                Services & Care
              </Text>
            </View>

            {/* Horizontal Scrollable Icons Row (Slim compact icons with 1-line text below) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesScrollContent}
              style={styles.servicesScrollView}
            >
              {/* Item 1: Book Appointment */}
              <TouchableOpacity
                style={styles.serviceItem}
                onPress={onOpenBookVisit || (() => Alert.alert('Book Appointment', 'Select doctor or department to book a new appointment.'))}
                activeOpacity={0.75}
              >
                <View style={styles.serviceIconWrap}>
                  <AppIcon name="calendar" size={isTablet ? 22 : 18} color="#0083B0" />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                  Book Appointment
                </Text>
              </TouchableOpacity>

              {/* Item 2: Pay Bills */}
              <TouchableOpacity
                style={styles.serviceItem}
                onPress={onOpenPayBills || (() => Alert.alert('Pay Bills', 'Viewing outstanding bills & payment options.'))}
                activeOpacity={0.75}
              >
                <View style={styles.serviceIconWrap}>
                  <AppIcon name="wallet-outline" size={isTablet ? 22 : 18} color="#0083B0" />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                  Pay Bills
                </Text>
              </TouchableOpacity>

              {/* Item 3: Book Test */}
              <TouchableOpacity
                style={styles.serviceItem}
                onPress={onOpenBookTest || (() => Alert.alert('Book Test', 'Select lab test or diagnostic package to book.'))}
                activeOpacity={0.75}
              >
                <View style={styles.serviceIconWrap}>
                  <AppIcon name="flask" size={isTablet ? 22 : 18} color="#0083B0" />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                  Book Test
                </Text>
              </TouchableOpacity>

              {/* Item 4: Medicines */}
              <TouchableOpacity
                style={styles.serviceItem}
                onPress={() => Alert.alert('Medicines', 'Order prescribed medicines or view active pharmacy orders.')}
                activeOpacity={0.75}
              >
                <View style={styles.serviceIconWrap}>
                  <AppIcon name="pill" size={isTablet ? 22 : 18} color="#0083B0" />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                  Medicines
                </Text>
              </TouchableOpacity>

              {/* Item 5: Diet Plan */}
              <TouchableOpacity
                style={styles.serviceItem}
                onPress={() => Alert.alert('Diet Plan', 'Viewing personalized nutritionist diet instructions.')}
                activeOpacity={0.75}
              >
                <View style={styles.serviceIconWrap}>
                  <AppIcon name="food-apple-outline" size={isTablet ? 22 : 18} color="#0083B0" />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                  Diet Plan
                </Text>
              </TouchableOpacity>

              {/* Item 6: Add Member */}
              <TouchableOpacity
                style={styles.serviceItem}
                onPress={() => {
                  if (onOpenAddMember) onOpenAddMember();
                  else onOpenPatientList('Home', true);
                }}
                activeOpacity={0.75}
              >
                <View style={styles.serviceIconWrap}>
                  <AppIcon name="usergroup-add" size={isTablet ? 22 : 18} color="#0083B0" />
                </View>
                <Text style={[styles.serviceLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                  Add Member
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Scroll Indicator Track Pill at bottom of Card */}
            <View style={styles.scrollTrackContainer}>
              <View style={styles.scrollTrackBg}>
                <View style={[styles.scrollTrackThumb, { backgroundColor: isDark ? colors.borderLight : '#64748B' }]} />
              </View>
            </View>
          </View>

          {/* 2B. EXCLUSIVE HEALTH POINTS & REWARDS BANNER (BRIGHT SOFT CYAN CARD) */}
          <TouchableOpacity
            style={[
              styles.rewardsPillBanner,
              {
                backgroundColor: isDark ? '#1E293B' : '#D0EDFF',
                borderColor: isDark ? '#38BDF8' : '#0083B0',
              },
              isTablet && { paddingHorizontal: 20, paddingVertical: 16, marginBottom: 18 },
            ]}
            onPress={() =>
              Alert.alert(
                `You Have ${userSession.healthPoints ?? 450} Health Points 🎉`,
                `You currently have ${userSession.healthPoints ?? 450} Health Points (₹${userSession.healthPoints ?? 450} value) in your GMCH Patient Account!\n\nBook your next visit now to redeem your points and get up to ₹${userSession.healthPoints ?? 450} instant discount applied at checkout.`,
                [
                  { text: 'Book Next Visit', onPress: onOpenBookVisit },
                  { text: 'Close', style: 'cancel' },
                ]
              )
            }
            activeOpacity={0.88}
          >
            <Image
              source={IMAGES.giftBoxRewards}
              fadeDuration={0}
              style={styles.giftBoxIconImage}
              resizeMode="contain"
            />
            <View style={styles.rewardsTextContainer}>
              <Text style={[styles.rewardsTitle, { color: isDark ? '#F1F5F9' : '#004F6E' }, isTablet && { fontSize: 17 }]}>
                You Have {userSession.healthPoints ?? 450} Health Points! 🎁
              </Text>
              <Text style={[styles.rewardsSubtitle, { color: isDark ? '#7DD3FC' : '#006B94' }, isTablet && { fontSize: 13 }]} numberOfLines={1}>
                Book your next visit & get discount offer!
              </Text>
            </View>
            <View style={styles.rewardsChevronWrap}>
              <AppIcon name="chevron-right" size={20} color={isDark ? '#7DD3FC' : '#0083B0'} />
            </View>
          </TouchableOpacity>

          {/* 3. OUTSTANDING BILLS CARD */}
          <View
            style={[
              styles.billsSummaryCard,
              { backgroundColor: colors.surface, borderColor: isDark ? '#7F1D1D' : '#FEE2E2' },
              isTablet && { padding: 18, marginBottom: 18 },
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
              style={[styles.payBillsButton, isTablet && { paddingHorizontal: 20, height: 42 }]}
              onPress={onOpenPayBills || (() => Alert.alert('Pay Bills', 'Proceeding to secure hospital gateway to clear ₹2,000.'))}
              activeOpacity={0.88}
            >
              <Text style={[styles.payBillsText, isTablet && { fontSize: 14 }]}>Pay Bills</Text>
              <View style={{ marginLeft: 6 }}>
                <AppIcon name="arrow-right" size={15} color="#FFFFFF" />
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
            onPress={() => onOpenPatientList('Home', false)}
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
                  source={IMAGES.avatarMale}
                  fadeDuration={0}
                  style={styles.stackedAvatarImg}
                  resizeMode="cover"
                />
              </View>

              {/* Member 2: Wife - Kavita Chouhan */}
              <View style={[styles.stackedAvatarCircle, { borderColor: colors.surface, backgroundColor: '#FDE1E7', zIndex: 3, marginRight: -10 }]}>
                <Image
                  source={IMAGES.avatarKavita}
                  fadeDuration={0}
                  style={styles.stackedAvatarImg}
                  resizeMode="cover"
                />
              </View>

              {/* Member 3: Son - Aarav Chouhan */}
              <View style={[styles.stackedAvatarCircle, { borderColor: colors.surface, backgroundColor: '#DEF0FD', zIndex: 2, marginRight: -10 }]}>
                <Image
                  source={IMAGES.avatarAarav}
                  fadeDuration={0}
                  style={styles.stackedAvatarImg}
                  resizeMode="cover"
                />
              </View>

              {/* Member 4: Brother - Deepak Chouhan */}
              <View style={[styles.stackedAvatarCircle, { borderColor: colors.surface, backgroundColor: '#DEF0FD', zIndex: 1 }]}>
                <Image
                  source={IMAGES.avatarDeepak}
                  fadeDuration={0}
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
                  source={IMAGES.avatarDoctor}
                  fadeDuration={0}
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
                  source={IMAGES.avatarDoctorFemale}
                  fadeDuration={0}
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

        {/* FLOATING CURVY BOTTOM NAVIGATION BAR */}
        <View
          style={[
            styles.bottomNavBar,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? colors.border : '#E2E8F0',
              bottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          {/* Tab 1: Home */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => setActiveTab('Home')}
          >
            <AppIcon
              name="home"
              size={isTablet ? 24 : 20}
              color={activeTab === 'Home' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Home' ? '#0083B0' : colors.textMuted },
                activeTab === 'Home' && styles.navLabelActive,
                isTablet && { fontSize: 12.5 },
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
            <AppIcon
              name="calendar"
              size={isTablet ? 24 : 20}
              color={activeTab === 'Visits' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Visits' ? '#0083B0' : colors.textMuted },
                activeTab === 'Visits' && styles.navLabelActive,
                isTablet && { fontSize: 12.5 },
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
              if (onOpenReports) {
                onOpenReports();
              } else if (onOpenPatientList) {
                onOpenPatientList('Reports');
              }
            }}
          >
            <AppIcon
              name="document"
              size={isTablet ? 24 : 20}
              color={activeTab === 'Reports' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Reports' ? '#0083B0' : colors.textMuted },
                activeTab === 'Reports' && styles.navLabelActive,
                isTablet && { fontSize: 12.5 },
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
              if (onOpenCare) onOpenCare();
            }}
          >
            <AppIcon
              name="care"
              size={isTablet ? 24 : 20}
              color={activeTab === 'Care' ? '#0083B0' : colors.textMuted}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === 'Care' ? '#0083B0' : colors.textMuted },
                activeTab === 'Care' && styles.navLabelActive,
                isTablet && { fontSize: 12.5 },
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
                        onOpenPatientList('Home', false);
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
  headerGreetingCol: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 2,
  },
  headerGreetingTime: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  headerGreetingName: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 1,
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

  // 2. AUTO-SCROLLING RECTANGULAR CAROUSEL
  carouselWrapper: {
    marginBottom: 16,
    marginTop: 2,
  },
  posterCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F253E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  posterImageBg: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  posterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 35, 65, 0.42)',
    padding: 14,
    justifyContent: 'space-between',
  },
  posterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  posterBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  posterBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  posterBottomCol: {
    justifyContent: 'flex-end',
  },
  posterTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  posterSubText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#F1F5F9',
    marginTop: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  posterActionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  posterActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#0083B0',
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },

  // SCROLL CONTENT
  scrollContent: {
    flexGrow: 1,
  },

  // 2. SERVICES & QUICK ACCESS CARD (COMPACT HEIGHT PAYTM CARD CONTAINER)
  servicesCardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  servicesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  servicesCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0083B0',
  },
  servicesScrollView: {
    marginHorizontal: -4,
    marginBottom: 4,
  },
  servicesScrollContent: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceItem: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  serviceIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  serviceLabel: {
    fontSize: 9.2,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: -0.2,
  },

  // SCROLL INDICATOR TRACK PILL AT BOTTOM OF CARD
  scrollTrackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  scrollTrackBg: {
    width: 28,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#CBD5E1',
    overflow: 'hidden',
  },
  scrollTrackThumb: {
    width: 12,
    height: 3.5,
    borderRadius: 1.75,
  },

  // REWARDS & POINTS PILL BANNER
  rewardsPillBanner: {
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  giftBoxIconImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  rewardsTextContainer: {
    flex: 1,
  },
  rewardsTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  rewardsSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rewardsChevronWrap: {
    marginLeft: 8,
  },

  // SLIM FLOATING BOTTOM NAVIGATION BAR WITH CURVY CORNERS
  bottomNavBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    shadowColor: '#0F253E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 7,
    zIndex: 100,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
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

  // OUTSTANDING BILLS CARD (COMPACT HEIGHT MATCHING FAMILY SUMMARY CARD)
  billsSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#E11D48',
    marginTop: 2,
  },
  payBillsButton: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  payBillsText: {
    fontSize: 13.5,
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
