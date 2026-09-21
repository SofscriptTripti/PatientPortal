import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  useWindowDimensions,
  Switch,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { PatientMember, UserSession } from './types';
import { INITIAL_PATIENTS } from './mockData';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';
import { getActiveMember, getAvatarForMember } from './accountManager';
import ProfileSettingsDrawer from './ProfileSettingsDrawer';
import NotificationsModal from './NotificationsModal';

interface PatientListScreenProps {
  userSession: UserSession;
  initialTab?: 'Home' | 'Visits' | 'Reports' | 'Care' | 'IP';
  autoOpenAddMember?: boolean;
  onOpenAddMember?: () => void;
  onLogout: () => void;
  onChangePin: () => void;
  onBack?: () => void;
  onOpenBookVisit?: () => void;
  onOpenBookTest?: () => void;
  onOpenPayBills?: () => void;
  onOpenMedicines?: () => void;
  onOpenVisits?: () => void;
  onOpenReports?: () => void;
  onOpenCare?: () => void;
  onOpenNotifications?: () => void;
  onOpenDiet?: () => void;
  onOpenAnnouncements?: (bannerId?: string) => void;
  onEditMember?: (member: PatientMember) => void;
  onSwitchAccount?: (memberId: string) => void;
}

// Avatar mapping: Exact cartoon avatars matching reference mockup
const getAvatarSource = (patient: PatientMember) => {
  if (patient.customAvatarUri) {
    return { uri: patient.customAvatarUri };
  }
  const nameLower = patient.name.toLowerCase();
  const relLower = patient.relation.toLowerCase();
  if (
    nameLower.includes('rathi') ||
    nameLower.includes('sharma') ||
    relLower === 'self' ||
    relLower === 'you'
  ) {
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
  if (nameLower.includes('chandan') || relLower.includes('father')) {
    return IMAGES.avatarMale;
  }
  return patient.genderType === 'F'
    ? IMAGES.avatarKavita
    : IMAGES.avatarMale;
};

// Pastel circle background for each avatar
const getAvatarBg = (patient: PatientMember, primaryLight?: string) => {
  if (patient.genderType === 'F' || patient.relation.toLowerCase() === 'wife') {
    return '#FDE1E7'; // Pastel pink
  }
  if (patient.patientType === 'IP' || patient.relation.toLowerCase() === 'father') {
    return '#FEF3C7'; // Pastel Amber for In-Patients
  }
  return primaryLight || '#DEF0FD'; // Pastel theme tint
};

export const PatientListScreen: React.FC<PatientListScreenProps> = ({
  userSession,
  initialTab = 'Home',
  autoOpenAddMember = false,
  onOpenAddMember,
  onLogout,
  onChangePin,
  onBack,
  onOpenBookVisit,
  onOpenBookTest,
  onOpenPayBills,
  onOpenMedicines,
  onOpenVisits,
  onOpenReports,
  onOpenCare,
  onOpenNotifications,
  onOpenDiet,
  onOpenAnnouncements,
  onEditMember,
  onSwitchAccount,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;

  // OP / IP Mode State
  const [patientMode, setPatientMode] = useState<'OP' | 'IP'>(initialTab === 'IP' ? 'IP' : 'OP');
  const [showModeDropdown, setShowModeDropdown] = useState<boolean>(false);
  const isModeLocked = initialTab === 'IP';

  useEffect(() => {
    if (initialTab === 'IP') {
      setPatientMode('IP');
    }
  }, [initialTab]);

  // Dynamic responsive dimensions according to device width & height
  const isSmallMobile = width < 380;
  const avatarSize = isTablet ? 76 : (isSmallMobile ? 56 : 62);
  const cardMinHeight = isTablet ? Math.min(Math.round(height * 0.11), 140) : 84;
  const nameFontSize = isTablet ? 18 : (isSmallMobile ? 14.5 : 15.5);
  const tagFontSize = isTablet ? 11 : 10;
  const chevronSize = isTablet ? 34 : (isSmallMobile ? 26 : 28);
  const chevronIconSize = isTablet ? 18 : (isSmallMobile ? 14 : 15);
  const labelFontSize = isTablet ? 12.5 : (isSmallMobile ? 10 : 10.5);
  const valueFontSize = isTablet ? 14 : (isSmallMobile ? 11.5 : 12);
  const dividerHeight = isTablet ? 28 : (isSmallMobile ? 18 : 20);
  const dividerMargin = isTablet ? 10 : (isSmallMobile ? 4 : 5);

  // Family members list - all registered members
  const [patients, setPatients] = useState<PatientMember[]>(INITIAL_PATIENTS);

  // Filtered patients according to OP / IP patient mode
  const displayedPatients = patients.filter((p) => {
    if (patientMode === 'IP') {
      return p.patientType === 'IP' || p.id === '5' || p.relation.toLowerCase() === 'father';
    }
    return p.patientType !== 'IP' && p.id !== '5' && p.relation.toLowerCase() !== 'father';
  });

  // Dynamic Active Member across app identity
  const activeMember = getActiveMember();

  // Main owner / user identity from family members (same profile pic as on patient list)
  const mainMember = activeMember;

  const userAvatarSource = getAvatarForMember(activeMember);

  const [activeTab, setActiveTab] = useState<'Home' | 'Visits' | 'Reports' | 'Care' | 'IP'>(initialTab || 'IP');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Universal Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Modals state
  const [selectedPatient, setSelectedPatient] = useState<PatientMember | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [actionType, setActionType] = useState<'Book Appointment' | 'Pay Bills' | 'Diet' | null>(null);

  // Profile Slide Bar & Settings State
  const { theme, setTheme, colorOptionId, setColorOptionId, colorOptions, isDark, colors } = useTheme();
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const slideAnim = useRef(new Animated.Value(520)).current;

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

  // Add Member Form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Son');
  const [newSex, setNewSex] = useState<'M' | 'F'>('M');
  const [newAge, setNewAge] = useState('');
  const [newMobile, setNewMobile] = useState(userSession.mobileNumber || '73737377376');
  const [newPatientNo, setNewPatientNo] = useState('');

  // Quick Action Handler: Book Appointment (Direct navigation using active member)
  const handleQuickBookVisit = () => {
    if (onOpenBookVisit) onOpenBookVisit();
    else if (onOpenVisits) onOpenVisits();
  };

  // Quick Action Handler: Pay Bills (Direct navigation using active member)
  const handleQuickPayBills = () => {
    if (onOpenPayBills) onOpenPayBills();
  };

  // Quick Action Handler: Diet
  const handleQuickDiet = () => {
    const active = getActiveMember();
    Alert.alert(
      'Diet & Nutrition',
      `Personalized recovery diet plans and nutritional schedule are ready for ${active.name}.`
    );
  };

  // Add New Member Handler (Ionicons person-add)
  const handleAddNewMember = () => {
    if (!newName.trim()) {
      Alert.alert('Name Required', 'Please enter member full name.');
      return;
    }
    if (!newAge.trim()) {
      Alert.alert('Age Required', 'Please enter member age.');
      return;
    }

    setLoaderState({
      visible: true,
      message: 'Adding Family Member...',
      subtitle: 'Linking hospital health record',
    });

    setTimeout(() => {
      setLoaderState({ visible: false });
      const newMember: PatientMember = {
        id: Date.now().toString(),
        name: newName.trim(),
        relation: newRelation,
        sex: newSex,
        age: `${newAge.trim()} Y`,
        maritalStatus: '',
        registrationStatus: 'Registered',
        mobileNumber: newMobile.trim() || '73737377376',
        patientNumber: newPatientNo.trim() || Math.floor(100000000 + Math.random() * 900000000).toString(),
        genderType: newSex,
      };

      setPatients((prev) => [...prev, newMember]);
      setShowAddMemberModal(false);
      setNewName('');
      setNewAge('');
      setNewPatientNo('');
      Alert.alert('Success', `${newName.trim()} added to your family members.`);
    }, 600);
  };

  // Remove / Unlink Member Handler
  const handleRemoveMember = (patientId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this family member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setLoaderState({
              visible: true,
              message: 'Removing Member...',
              subtitle: 'Updating family portal records',
            });
            setTimeout(() => {
              setLoaderState({ visible: false });
              setPatients((prev) => prev.filter((p) => p.id !== patientId));
              setSelectedPatient(null);
            }, 500);
          },
        },
      ]
    );
  };

  // Appointment for selected patient
  const handleBookAppointmentForPatient = (patient: PatientMember) => {
    setSelectedPatient(null);
    setLoaderState({
      visible: true,
      message: 'Loading Doctor Schedule...',
      subtitle: `Fetching available time slots for ${patient.name}`,
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      Alert.alert('Book Appointment', `Ready to book an appointment for ${patient.name} (Patient No: ${patient.patientNumber}).`);
    }, 600);
  };

  // Reports for selected patient
  const handleViewReportsForPatient = (patient: PatientMember) => {
    setSelectedPatient(null);
    setLoaderState({
      visible: true,
      message: 'Fetching Diagnostic Reports...',
      subtitle: `Retrieving lab & radiology reports for ${patient.name}`,
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      Alert.alert('Medical Reports', `Viewing reports and digital prescriptions for ${patient.name}.`);
    }, 600);
  };

  // Render individual Patient Card with adjusted width and professional styling
  const renderPatientCard = ({ item }: { item: PatientMember }) => {
    const avatarBg = isDark ? (item.genderType === 'F' ? '#3B1F2B' : colors.primaryLight) : getAvatarBg(item, colors.primaryLight);

    return (
      <TouchableOpacity
        style={[
          styles.patientCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingHorizontal: isTablet ? 20 : 14,
            paddingVertical: isTablet ? 18 : 14,
            marginBottom: isTablet ? 16 : 12,
            borderRadius: isTablet ? 20 : 16,
            minHeight: cardMinHeight,
          },
        ]}
        onPress={() => setSelectedPatient(item)}
        activeOpacity={0.88}
      >
        {/* Left: Avatar with pastel colored circular background */}
        <View
          style={[
            styles.avatarCircle,
            {
              backgroundColor: avatarBg,
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              marginRight: isTablet ? 16 : 12,
            },
          ]}
        >
          <Image
            source={getAvatarSource(item)}
            style={{ width: avatarSize, height: avatarSize }}
            resizeMode="cover"
          />
        </View>

        {/* Right: Info Section */}
        <View style={styles.cardRightContent}>
          {/* Top Row: Name + OP / IP Badge */}
          <View style={[styles.cardTopRow, { marginBottom: isTablet ? 10 : 6 }]}>
            <View style={styles.nameAndTagGroup}>
              <Text style={[styles.cardPatientName, { color: colors.textPrimary, fontSize: nameFontSize }]} numberOfLines={1}>
                {item.name}
              </Text>
              {/* OP / IP Badge */}
              <View
                style={[
                  styles.cardTypeBadge,
                  {
                    backgroundColor: item.patientType === 'IP' ? '#FEF3C7' : '#E0F2FE',
                    borderColor: item.patientType === 'IP' ? '#F59E0B' : '#38BDF8',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardTypeBadgeText,
                    { color: item.patientType === 'IP' ? '#D97706' : '#0284C7' },
                  ]}
                >
                  {item.patientType || 'OP'}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Section: 2 Columns with Left-Aligned Keyword & Value */}
          <View style={[styles.cardInfoContainer, { marginTop: isTablet ? 6 : 4 }]}>
            {/* Row 1: Gender / Age  |  Phone No */}
            <View style={styles.cardInfoRow}>
              <View style={styles.cardInfoItem}>
                <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Gender / Age</Text>
                <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                  {item.sex === 'M' ? 'Male' : 'Female'} / {item.age}
                </Text>
              </View>
              <View style={styles.cardInfoItem}>
                <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Phone No</Text>
                <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                  {item.mobileNumber || '+91 9414023873'}
                </Text>
              </View>
            </View>

            {/* Row 2: Patient No  |  Relation */}
            <View style={[styles.cardInfoRow, { marginTop: isTablet ? 8 : 6 }]}>
              <View style={styles.cardInfoItem}>
                <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Patient No</Text>
                <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                  {item.patientNumber}
                </Text>
              </View>
              <View style={styles.cardInfoItem}>
                <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Relation</Text>
                <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                  {item.relation}
                </Text>
              </View>
            </View>

            {/* Row 3 (3rd Line): IP NO & Bed No for IP Toggle List / IP Patients */}
            {(patientMode === 'IP' || item.patientType === 'IP') && (
              <View style={[styles.cardInfoRow, { marginTop: isTablet ? 8 : 6 }]}>
                <View style={styles.cardInfoItem}>
                  <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>IP No</Text>
                  <Text style={[styles.infoColValue, { color: colors.primary, fontWeight: '700', fontSize: valueFontSize }]} numberOfLines={1}>
                    {item.ipNo || `IP-${item.patientNumber}`}
                  </Text>
                </View>
                <View style={styles.cardInfoItem}>
                  <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Bed No / Ward</Text>
                  <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                    {item.bedNumber || 'Bed 304 (Ward 4A)'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // User initial for top avatar
  const userInitial = (userSession.name && userSession.name.trim().charAt(0).toUpperCase()) || 'D';

  const handleHeaderBack = () => {
    if (showModeDropdown) {
      setShowModeDropdown(false);
      return;
    }
    if (showContactModal) {
      setShowContactModal(false);
      return;
    }
    if (showAddMemberModal) {
      setShowAddMemberModal(false);
      return;
    }
    if (showProfileMenu) {
      closeSlideBar();
      return;
    }
    if (onBack) onBack();
  };

  useEffect(() => {
    const onBackPress = () => {
      if (showModeDropdown) {
        setShowModeDropdown(false);
        return true;
      }
      if (showContactModal) {
        setShowContactModal(false);
        return true;
      }
      if (showAddMemberModal) {
        setShowAddMemberModal(false);
        return true;
      }
      if (showProfileMenu) {
        closeSlideBar();
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showModeDropdown, showContactModal, showAddMemberModal, showProfileMenu, onBack]);

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

        {/* 1. TOP HEADER BAR: Member list centered in Blue, Curvy bottom line */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
              paddingHorizontal: isTablet ? 20 : 16,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: isTablet ? 14 : 12,
            },
          ]}
        >
          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]}>
            {onBack ? (
              <TouchableOpacity
                onPress={handleHeaderBack}
                style={[styles.headerBackBtn, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="back" size={isTablet ? 24 : 20} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
              Member list
            </Text>
          </View>

          {/* Right header group: Notification Bell Icon */}
          <View style={[styles.headerSideGroup, { alignItems: 'flex-end' }, isTablet && { width: 44 }]}>
            <TouchableOpacity
              style={[styles.bellButton, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
              onPress={() => {
                if (onOpenNotifications) onOpenNotifications();
                else setShowContactModal(true);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="bell" size={isTablet ? 24 : 20} color={colors.primary} />
              <View style={styles.bellBadgeDot} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 20 : 12,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: insets.bottom + (initialTab === 'IP' ? (isTablet ? 110 : 85) : (isTablet ? 70 : 60)),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >

          {/* 2. OP / IP CENTERING DROPDOWN BUTTON (60% WIDTH, CENTERED) */}
          <TouchableOpacity
            style={[
              styles.centeredModeDropdownBtn,
              {
                backgroundColor: colors.surface,
                borderColor: isModeLocked ? colors.border : colors.primary,
              },
            ]}
            onPress={() => {
              if (isModeLocked) {
                return;
              }
              setShowModeDropdown(true);
            }}
            activeOpacity={isModeLocked ? 1 : 0.8}
          >
            <Text style={[styles.centeredModeText, { color: colors.textPrimary }]}>
              {patientMode === 'IP' ? 'IP Patients' : 'OP Patients'}
            </Text>
            <AppIcon name="chevron-down" size={18} color={isModeLocked ? colors.textMuted : colors.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          {/* 3. SECTION TITLE ROW */}
          <View
            style={[
              styles.sectionHeaderRow,
              {
                marginTop: isTablet ? 12 : 8,
                marginBottom: isTablet ? 14 : 10,
                paddingHorizontal: isTablet ? 4 : 2,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitleText,
                { color: colors.textPrimary, fontSize: isTablet ? 22 : 18.5 },
              ]}
            >
              {patientMode === 'IP'
                ? `In-Patients (${displayedPatients.length})`
                : `Your Family Members (${displayedPatients.length})`}
            </Text>
          </View>

          {/* 4. LIST OF FAMILY PATIENT CARDS */}
          {displayedPatients.map((item) => (
            <View key={item.id}>{renderPatientCard({ item })}</View>
          ))}
        </ScrollView>

        {/* FLOATING BOTTOM-RIGHT "ADD MEMBER" ACTION BUTTON (OP Mode Only) */}
        {patientMode === 'OP' && (
          <TouchableOpacity
            style={[
              styles.floatingAddMemberFab,
              { bottom: Math.max(insets.bottom, 10) + (initialTab === 'IP' ? 82 : 16) },
            ]}
            onPress={() => {
              if (onOpenAddMember) onOpenAddMember();
              else setShowAddMemberModal(true);
            }}
            activeOpacity={0.88}
          >
            <View style={styles.floatingFabIconWrap}>
              <AppIcon name="user-plus" size={17} color="#FFFFFF" />
            </View>
            <Text style={styles.floatingFabText}>Add Member</Text>
          </TouchableOpacity>
        )}

        {/* FLOATING CURVY BOTTOM NAVIGATION BAR (Only shown when accessed via IP tab from bottom navigator) */}
        {initialTab === 'IP' && (
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
              onPress={() => {
                setActiveTab('Home');
                if (onBack) onBack();
              }}
              activeOpacity={0.8}
            >
              <AppIcon name="home" size={isTablet ? 24 : 20} color={activeTab === 'Home' ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'Home' ? colors.primary : colors.textMuted },
                  activeTab === 'Home' && styles.navLabelActive,
                  isTablet && { fontSize: 12.5 },
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>

            {/* Tab 2: IP (In-Patients ACTIVE) */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setActiveTab('IP');
              }}
              activeOpacity={0.8}
            >
              <AppIcon name="bed-pulse" size={isTablet ? 24 : 20} color={activeTab === 'IP' ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'IP' ? colors.primary : colors.textMuted },
                  activeTab === 'IP' && styles.navLabelActive,
                  isTablet && { fontSize: 12.5 },
                ]}
              >
                IP
              </Text>
            </TouchableOpacity>

            {/* Tab 3: Visits */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setActiveTab('Visits');
                if (onOpenVisits) {
                  onOpenVisits();
                } else {
                  handleQuickBookVisit();
                }
              }}
              activeOpacity={0.8}
            >
              <AppIcon name="calendar" size={isTablet ? 24 : 20} color={activeTab === 'Visits' ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'Visits' ? colors.primary : colors.textMuted },
                  activeTab === 'Visits' && styles.navLabelActive,
                  isTablet && { fontSize: 12.5 },
                ]}
              >
                Visits
              </Text>
            </TouchableOpacity>

            {/* Tab 4: Reports */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setActiveTab('Reports');
                if (onOpenReports) onOpenReports();
              }}
              activeOpacity={0.8}
            >
              <AppIcon name="document" size={isTablet ? 24 : 20} color={activeTab === 'Reports' ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'Reports' ? colors.primary : colors.textMuted },
                  activeTab === 'Reports' && styles.navLabelActive,
                  isTablet && { fontSize: 12.5 },
                ]}
              >
                Reports
              </Text>
            </TouchableOpacity>

            {/* Tab 5: Care */}
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => {
                setActiveTab('Care');
                if (onOpenCare) onOpenCare();
                else setShowContactModal(true);
              }}
              activeOpacity={0.8}
            >
              <AppIcon name="care" size={isTablet ? 24 : 20} color={activeTab === 'Care' ? colors.primary : colors.textMuted} />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'Care' ? colors.primary : colors.textMuted },
                  activeTab === 'Care' && styles.navLabelActive,
                  isTablet && { fontSize: 12.5 },
                ]}
              >
                Care
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MODAL: ADD FAMILY MEMBER */}
      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Link a family member account to manage visits and reports together.
            </Text>

            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Aarav Chouhan"
              placeholderTextColor="#94A3B8"
              value={newName}
              onChangeText={setNewName}
            />

            <View style={styles.formSplitRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.formLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      newSex === 'M' && styles.genderOptionActive,
                    ]}
                    onPress={() => setNewSex('M')}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        newSex === 'M' && styles.genderOptionTextActive,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      newSex === 'F' && styles.genderOptionActive,
                    ]}
                    onPress={() => setNewSex('F')}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        newSex === 'F' && styles.genderOptionTextActive,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.formLabel}>Age *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 8"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={3}
                  value={newAge}
                  onChangeText={setNewAge}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Relationship</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. You, Wife, Son, Daughter"
              placeholderTextColor="#94A3B8"
              value={newRelation}
              onChangeText={setNewRelation}
            />

            <Text style={styles.formLabel}>Patient Number (Optional)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 109282830"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={newPatientNo}
              onChangeText={setNewPatientNo}
            />

            <TouchableOpacity
              style={styles.primaryModalBtn}
              onPress={handleAddNewMember}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryModalBtnText}>Add Member to Family</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SLIDE MODAL FROM BOTTOM: IN-PATIENT QUICK SERVICES */}
      <Modal
        visible={!!selectedPatient}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPatient(null)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetBackdrop} onPress={() => setSelectedPatient(null)} activeOpacity={1} />
          <View style={[styles.sheetCardContainer, { backgroundColor: colors.surface }]}>
            {/* Top Handle Bar */}
            <View style={styles.sheetHandleBar} />

            {/* Patient DP & Info Header */}
            <View style={styles.sheetPatientHeader}>
              {selectedPatient && (
                <View style={[styles.avatarCircle, { backgroundColor: getAvatarBg(selectedPatient, colors.primaryLight), width: 50, height: 50, borderRadius: 25, marginRight: 12 }]}>
                  <Image source={getAvatarSource(selectedPatient)} style={{ width: 50, height: 50 }} resizeMode="cover" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.sheetPatientName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {selectedPatient?.name}
                  </Text>
                  <Text style={styles.sheetRelationTag}>
                    {selectedPatient?.relation.toLowerCase() === 'self' || selectedPatient?.relation.toLowerCase() === 'you'
                      ? '( SELF )'
                      : `( ${selectedPatient?.relation.toUpperCase()} )`}
                  </Text>
                </View>
                <Text style={[styles.sheetPatientSub, { color: colors.textSecondary }]}>
                  UHID: {selectedPatient?.patientNumber} {selectedPatient?.patientType === 'IP' ? `• IP NO: ${selectedPatient?.ipNo || 'IP-' + selectedPatient?.patientNumber}` : ''} {selectedPatient?.bedNumber ? `• ${selectedPatient.bedNumber}` : '• OPD Patient'}
                </Text>
              </View>
              <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setSelectedPatient(null)} activeOpacity={0.7}>
                <AppIcon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Section Title */}
            <Text style={[styles.sheetSectionTitle, { color: colors.primary }]}>
              {selectedPatient?.patientType === 'IP' ? 'IN-PATIENT QUICK SERVICES' : 'PATIENT QUICK SERVICES'}
            </Text>

            {/* HORIZONTAL SCROLL OF ALL SERVICE ICONS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 2, paddingVertical: 12, gap: 12 }}
            >
              {/* Service 1: Book Appointment */}
              <TouchableOpacity
                style={styles.servicePillItem}
                onPress={() => {
                  const p = selectedPatient;
                  setSelectedPatient(null);
                  if (p && onSwitchAccount) onSwitchAccount(p.id);
                  if (onOpenBookVisit) onOpenBookVisit();
                  else if (onOpenVisits) onOpenVisits();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.servicePillIconWrap}>
                  <AppIcon name="calendar" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>Book Visit</Text>
              </TouchableOpacity>

              {/* Service 2: Pay Bills */}
              <TouchableOpacity
                style={styles.servicePillItem}
                onPress={() => {
                  const p = selectedPatient;
                  setSelectedPatient(null);
                  if (p && onSwitchAccount) onSwitchAccount(p.id);
                  if (onOpenPayBills) onOpenPayBills();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.servicePillIconWrap}>
                  <AppIcon name="wallet" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>Pay Bills</Text>
              </TouchableOpacity>

              {/* Service 3: Book Tests */}
              <TouchableOpacity
                style={styles.servicePillItem}
                onPress={() => {
                  const p = selectedPatient;
                  setSelectedPatient(null);
                  if (p && onSwitchAccount) onSwitchAccount(p.id);
                  if (onOpenBookTest) onOpenBookTest();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.servicePillIconWrap}>
                  <AppIcon name="flask" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>Book Tests</Text>
              </TouchableOpacity>

              {/* Service 4: Medicines */}
              <TouchableOpacity
                style={styles.servicePillItem}
                onPress={() => {
                  const p = selectedPatient;
                  setSelectedPatient(null);
                  if (p && onSwitchAccount) onSwitchAccount(p.id);
                  if (onOpenMedicines) onOpenMedicines();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.servicePillIconWrap}>
                  <AppIcon name="pill" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>Medicines</Text>
              </TouchableOpacity>

              {/* Service 5: Diet Plan (In-Patient Quick Access Only) */}
              {selectedPatient?.patientType === 'IP' && (
                <TouchableOpacity
                  style={styles.servicePillItem}
                  onPress={() => {
                    const p = selectedPatient;
                    setSelectedPatient(null);
                    if (p && onSwitchAccount) onSwitchAccount(p.id);
                    if (onOpenDiet) onOpenDiet();
                    else Alert.alert('Diet & Food Plan', `Viewing in-patient nutritionist diet chart for ${p?.name}.`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.servicePillIconWrap}>
                    <AppIcon name="food-apple-outline" size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>Diet Plan</Text>
                </TouchableOpacity>
              )}

              {/* Service 6: Visit Details */}
              <TouchableOpacity
                style={styles.servicePillItem}
                onPress={() => {
                  const p = selectedPatient;
                  setSelectedPatient(null);
                  if (p && onSwitchAccount) onSwitchAccount(p.id);
                  if (onOpenVisits) onOpenVisits();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.servicePillIconWrap}>
                  <AppIcon name="history" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>Visit Details</Text>
              </TouchableOpacity>

              {/* Service 7: Care */}
              <TouchableOpacity
                style={styles.servicePillItem}
                onPress={() => {
                  setSelectedPatient(null);
                  if (onOpenCare) onOpenCare();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.servicePillIconWrap}>
                  <AppIcon name="care" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>24/7 Care</Text>
              </TouchableOpacity>

              {/* Service 8: Reports */}
              <TouchableOpacity
                style={styles.servicePillItem}
                onPress={() => {
                  const p = selectedPatient;
                  setSelectedPatient(null);
                  if (p && onSwitchAccount) onSwitchAccount(p.id);
                  if (onOpenReports) onOpenReports();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.servicePillIconWrap}>
                  <AppIcon name="document" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.servicePillLabel, { color: colors.textPrimary }]}>Reports</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: NOTIFICATIONS */}
      <NotificationsModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* MODAL: OP / IP PATIENT TYPE SELECTOR DROPDOWN */}
      <Modal
        visible={showModeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModeDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modeModalOverlay}
          activeOpacity={1}
          onPress={() => setShowModeDropdown(false)}
        >
          <View style={[styles.modeMenuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modeMenuHeaderTitle, { color: colors.textSecondary }]}>
              SWITCH PATIENT TYPE
            </Text>

            {/* Option 1: OP Patients */}
            <TouchableOpacity
              style={[
                styles.modeOptionRow,
                patientMode === 'OP' && { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: colors.primary },
              ]}
              onPress={() => {
                setPatientMode('OP');
                setShowModeDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.modeOptionIconBg, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="usergroup-add" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.modeOptionTitle, { color: colors.textPrimary }]}>
                  OP Patients
                </Text>
                <Text style={[styles.modeOptionDesc, { color: colors.textSecondary }]}>
                  Out-patient family members (4 registered)
                </Text>
              </View>
              {patientMode === 'OP' && (
                <View style={[styles.modeCheckCircle, { backgroundColor: colors.primary }]}>
                  <AppIcon name="check" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <View style={[styles.modeOptionDivider, { backgroundColor: colors.divider }]} />

            {/* Option 2: IP Patients */}
            <TouchableOpacity
              style={[
                styles.modeOptionRow,
                patientMode === 'IP' && { backgroundColor: isDark ? colors.surfaceVariant : '#FEF3C7', borderColor: '#D97706' },
              ]}
              onPress={() => {
                setPatientMode('IP');
                setShowModeDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.modeOptionIconBg, { backgroundColor: '#FEF3C7' }]}>
                <AppIcon name="bed-pulse" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.modeOptionTitle, { color: colors.textPrimary }]}>
                  IP Patients
                </Text>
                <Text style={[styles.modeOptionDesc, { color: colors.textSecondary }]}>
                  In-patient admission (Chandan Chouhan - Father)
                </Text>
              </View>
              {patientMode === 'IP' && (
                <View style={[styles.modeCheckCircle, { backgroundColor: '#D97706' }]}>
                  <AppIcon name="check" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Standalone Profile & Settings Drawer Component */}
      <ProfileSettingsDrawer
        visible={showProfileMenu}
        onClose={closeSlideBar}
        userSession={userSession}
        onSwitchAccount={onSwitchAccount}
        onLogout={onLogout}
        onChangePin={onChangePin}
        onOpenAnnouncements={onOpenAnnouncements ? () => onOpenAnnouncements() : undefined}
        onEditMember={onEditMember}
      />

      {/* Universal Loader with App Icon and Status Message */}
      <UniversalLoader
        visible={loaderState.visible}
        message={loaderState.message}
        subtitle={loaderState.subtitle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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

  // 1. PROPER TOP HEADER BAR (with border and crisp background)
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerSideGroup: {
    width: 38,
    justifyContent: 'center',
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
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
  profileInitialCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  profileInitialText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0284C7',
  },

  // 2. SCROLL CONTENT (Adjusted padding to remove excessive side gaps)
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },

  // 4 FEATURE COLUMNS ROW: Distributed equally, no borders around or between
  featureRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  featureCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconWrapper: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  featureIconTile: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
    textAlign: 'center',
  },

  // 3. SECTION HEADER ROW (Clean title without redundant add icon)
  sectionHeaderRow: {
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleText: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  // 4. PATIENT CARD DESIGN (Adjusted width & professional typography)
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: 66,
    height: 66,
  },
  cardRightContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nameAndTagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
    overflow: 'hidden',
  },
  cardPatientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    flexShrink: 0,
  },
  // Relation: Pure Blue Text inside () without border
  relationTextOnly: {
    color: '#0083B0',
    fontWeight: '700',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDF6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3-COLUMN GRID INSIDE CARD (Balanced widths)
  threeColumnGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  infoCol: {
    flex: 1,
  },
  infoColLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  infoColValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  colDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
  },

  // 5. FLOATING FIXED BOTTOM NAVIGATION BAR
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
  navLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  navLabelActive: {
    fontWeight: '700',
    color: '#0083B0',
  },
  navLabelInactive: {
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabIndicator: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0083B0',
    marginTop: 3,
  },
  tabIndicatorPlaceholder: {
    width: 32,
    height: 3,
    marginTop: 3,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 35, 65, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactItemLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  contactItemVal: {
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },

  // FORM INPUTS
  formLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  formSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  genderOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  genderOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  primaryModalBtn: {
    backgroundColor: '#0083B0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryModalBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // PROFILE / ACTIONS SHEET
  userProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileModalAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileModalAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284C7',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  profilePhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // MEMBER SELECT MODAL
  memberSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberSelectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberSelectSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  memberSelectChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDF8FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // SLIDE BAR DRAWER STYLES
  slideBarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  slideBarPanel: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 24,
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
  slideStickyFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  slideBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
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
  slideBarScroll: {
    padding: 18,
    paddingBottom: 40,
  },
  slideBarUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  slideBarAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slideBarUserName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedBadge: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideBarUserUhid: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0083B0',
    marginTop: 2,
  },
  slideBarUserMobile: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  slideSection: {
    marginBottom: 20,
  },
  slideSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slideSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 8,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  mrdDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mrdFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mrdFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  mrdFieldValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  mrdDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  mrdNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    marginTop: 10,
  },
  mrdNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 17,
    fontWeight: '500',
  },
  slideMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  slideMenuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  slideMenuItemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  displayRowLabel: {
    fontSize: 14,
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
  colorOptionSubtext: {
    fontSize: 11.5,
    marginTop: 2,
    marginBottom: 10,
  },
  colorSwatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorSwatchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSwatchBtnActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  selectedColorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  selectedColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  colorSelectedName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  accessibilityDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 6,
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
    marginTop: 4,
    gap: 8,
  },
  slideLogoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  addMemberHeaderBtn: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  addMemberHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  floatingAddMemberFab: {
    position: 'absolute',
    right: 16,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 90,
  },
  floatingFabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingFabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // 🔄 ACCOUNT SWITCHER DROPDOWN STYLES
  circleDropdownBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  heroAccountDropdownList: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  accountDropdownSub: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  accountDropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  accountDropdownOptionActive: {
    borderWidth: 1,
  },
  dropdownAvatarBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionName: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  selfPill: {
    fontSize: 12,
    fontWeight: '800',
  },
  dropdownOptionRelation: {
    fontSize: 11.5,
    marginTop: 1,
  },
  activeCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchActionText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // SLIDE MODAL FROM BOTTOM: IN-PATIENT QUICK SERVICES
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetCardContainer: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  sheetHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetPatientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetPatientName: {
    fontSize: 17,
    fontWeight: '800',
  },
  sheetRelationTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0083B0',
    marginLeft: 6,
  },
  sheetPatientSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  // Service Pill Items (Horizontal Scroll - Clean Icon & Name without border or BG)
  servicePillItem: {
    width: 82,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  servicePillIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  servicePillLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Patient Card 2-Row Info Section
  cardInfoContainer: {
    marginTop: 6,
    paddingRight: 4,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfoItem: {
    flex: 1,
  },

  // OP / IP DROPDOWN CARD & MODAL STYLES
  modeDropdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  modeDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  modeDropdownIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeDropdownSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeDropdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  modeChevronCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  modeLockText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modeMenuCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modeMenuHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  modeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeOptionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  modeOptionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  modeOptionDivider: {
    height: 1,
    marginVertical: 8,
  },
  modeCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 60% WIDTH CENTERED OP/IP DROPDOWN BUTTON STYLES
  centeredModeDropdownBtn: {
    width: '60%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 12,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  centeredModeText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardTypeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 6,
  },
  cardTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});

export default PatientListScreen;
