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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { PatientMember, UserSession } from './types';
import { INITIAL_PATIENTS } from './mockData';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface PatientListScreenProps {
  userSession: UserSession;
  initialTab?: 'Home' | 'Visits' | 'Reports' | 'Care';
  autoOpenAddMember?: boolean;
  onOpenAddMember?: () => void;
  onLogout: () => void;
  onChangePin: () => void;
  onBack?: () => void;
  onOpenVisits?: () => void;
  onOpenReports?: () => void;
  onOpenCare?: () => void;
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
  return patient.genderType === 'F'
    ? IMAGES.avatarKavita
    : IMAGES.avatarMale;
};

// Pastel circle background for each avatar
const getAvatarBg = (patient: PatientMember) => {
  if (patient.genderType === 'F' || patient.relation.toLowerCase() === 'wife') {
    return '#FDE1E7'; // Pastel pink
  }
  return '#DEF0FD'; // Pastel icy blue
};

export const PatientListScreen: React.FC<PatientListScreenProps> = ({
  userSession,
  initialTab = 'Home',
  autoOpenAddMember = false,
  onOpenAddMember,
  onLogout,
  onChangePin,
  onBack,
  onOpenVisits,
  onOpenReports,
  onOpenCare,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;

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

  // Family members list - all 4 registered members
  const [patients, setPatients] = useState<PatientMember[]>(INITIAL_PATIENTS);

  // Main owner / user identity from family members (same profile pic as on patient list)
  const mainMember =
    patients.find(
      (p) =>
        p.relation.toLowerCase() === 'self' ||
        p.relation.toLowerCase() === 'you' ||
        p.name.toLowerCase().includes('rathi')
    ) || patients[0];

  const userAvatarSource = mainMember
    ? (userSession.userAvatar || (userSession.customAvatarUri ? { uri: userSession.customAvatarUri } : getAvatarSource(mainMember)))
    : IMAGES.avatarMale;

  const [activeTab, setActiveTab] = useState<'Home' | 'Visits' | 'Reports' | 'Care'>(initialTab);

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
  const [showMemberSelectModal, setShowMemberSelectModal] = useState(false);
  const [actionType, setActionType] = useState<'Book Appointment' | 'Pay Bills' | 'Diet' | null>(null);

  // Profile Slide Bar & Settings State
  const { theme, setTheme, isDark, colors } = useTheme();
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

  // Quick Action Handler: Book Appointment (Opens Member Select Modal)
  const handleQuickBookVisit = () => {
    setActionType('Book Appointment');
    setShowMemberSelectModal(true);
  };

  // Quick Action Handler: Pay Bills (Opens Member Select Modal)
  const handleQuickPayBills = () => {
    setActionType('Pay Bills');
    setShowMemberSelectModal(true);
  };

  // Quick Action Handler: Diet (Opens Member Select Modal)
  const handleQuickDiet = () => {
    setActionType('Diet');
    setShowMemberSelectModal(true);
  };

  // Callback when a family member is chosen in the Quick Action Modal
  const handleSelectMemberForAction = (patient: PatientMember) => {
    setShowMemberSelectModal(false);
    const currentAction = actionType;

    if (currentAction === 'Book Appointment') {
      setLoaderState({
        visible: true,
        message: 'Loading Doctor Schedule...',
        subtitle: `Fetching available time slots for ${patient.name}`,
      });
      setTimeout(() => {
        setLoaderState({ visible: false });
        Alert.alert(
          'Book Appointment',
          `Ready to book an appointment for ${patient.name} (Patient No: ${patient.patientNumber}).`
        );
      }, 600);
    } else if (currentAction === 'Pay Bills') {
      setLoaderState({
        visible: true,
        message: 'Fetching Hospital Invoices...',
        subtitle: `Checking billing & pharmacy dues for ${patient.name}`,
      });
      setTimeout(() => {
        setLoaderState({ visible: false });
        Alert.alert(
          'Pay Bills',
          `All medical bills and pharmacy invoices for ${patient.name} are settled. No pending balance.`
        );
      }, 600);
    } else if (currentAction === 'Diet') {
      setLoaderState({
        visible: true,
        message: 'Opening Clinical Nutrition...',
        subtitle: `Loading personalized diet recommendations for ${patient.name}`,
      });
      setTimeout(() => {
        setLoaderState({ visible: false });
        Alert.alert(
          'Diet & Nutrition',
          `Personalized recovery diet plans and nutritional schedule are ready for ${patient.name}.`
        );
      }, 600);
    }
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
    const avatarBg = isDark ? (item.genderType === 'F' ? '#3B1F2B' : '#1E3A5F') : getAvatarBg(item);

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
          {/* Top Row: Name + Relation Pill + Chevron Arrow */}
          <View style={[styles.cardTopRow, { marginBottom: isTablet ? 12 : 8 }]}>
            <View style={styles.nameAndTagGroup}>
              <Text style={[styles.cardPatientName, { color: colors.textPrimary, fontSize: nameFontSize }]} numberOfLines={1}>
                {item.name}
              </Text>
              {/* Relation: Pure Blue Text inside () without border */}
              <Text
                style={[
                  styles.relationTextOnly,
                  {
                    fontSize: isTablet ? 13 : (isSmallMobile ? 10 : 11),
                    marginLeft: isTablet ? 6 : 4,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.relation.toLowerCase() === 'self' || item.relation.toLowerCase() === 'you'
                  ? '( SELF · MAIN OWNER )'
                  : `( ${item.relation.toUpperCase()} )`}
              </Text>
            </View>

            {/* Circular Right Chevron Button */}
            <View
              style={[
                styles.chevronCircle,
                {
                  width: chevronSize,
                  height: chevronSize,
                  borderRadius: chevronSize / 2,
                  backgroundColor: isDark ? colors.borderLight : '#EDF8FD',
                },
              ]}
            >
              <AppIcon name="chevron-right" size={chevronIconSize} color="#0083B0" />
            </View>
          </View>

          {/* Bottom Row: 3 Columns with thin vertical dividers */}
          <View style={[styles.threeColumnGrid, { marginTop: isTablet ? 4 : 2 }]}>
            {/* Col 1: Gender / Age */}
            <View style={styles.infoCol}>
              <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Gender / Age</Text>
              <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                {item.sex === 'M' ? 'Male' : 'Female'} / {item.age}
              </Text>
            </View>

            <View
              style={[
                styles.colDivider,
                { backgroundColor: colors.divider, height: dividerHeight, marginHorizontal: dividerMargin },
              ]}
            />

            {/* Col 2: Status */}
            <View style={styles.infoCol}>
              <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Status</Text>
              <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                {item.registrationStatus}
              </Text>
            </View>

            <View
              style={[
                styles.colDivider,
                { backgroundColor: colors.divider, height: dividerHeight, marginHorizontal: dividerMargin },
              ]}
            />

            {/* Col 3: Patient No */}
            <View style={styles.infoCol}>
              <Text style={[styles.infoColLabel, { color: colors.textSecondary, fontSize: labelFontSize }]}>Patient No</Text>
              <Text style={[styles.infoColValue, { color: colors.textPrimary, fontSize: valueFontSize }]} numberOfLines={1}>
                {item.patientNumber}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // User initial for top avatar
  const userInitial = (userSession.name && userSession.name.trim().charAt(0).toUpperCase()) || 'D';

  const handleHeaderBack = () => {
    if (showContactModal) {
      setShowContactModal(false);
      return;
    }
    if (showAddMemberModal) {
      setShowAddMemberModal(false);
      return;
    }
    if (showMemberSelectModal) {
      setShowMemberSelectModal(false);
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
      if (showContactModal) {
        setShowContactModal(false);
        return true;
      }
      if (showAddMemberModal) {
        setShowAddMemberModal(false);
        return true;
      }
      if (showMemberSelectModal) {
        setShowMemberSelectModal(false);
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
  }, [showContactModal, showAddMemberModal, showMemberSelectModal, showProfileMenu, onBack]);

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
                <AppIcon name="back" size={isTablet ? 24 : 20} color="#0083B0" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
              Member list
            </Text>
          </View>

          {/* Right spacer for symmetric centering */}
          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 20 : 12,
              paddingTop: isTablet ? 14 : 10,
              paddingBottom: insets.bottom + (isTablet ? 110 : 85),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >

          {/* 3. SECTION TITLE ROW */}
          <View
            style={[
              styles.sectionHeaderRow,
              {
                marginTop: isTablet ? 10 : 6,
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
              Your Family Members ({patients.length})
            </Text>
          </View>

          {/* 4. LIST OF FAMILY PATIENT CARDS */}
          {patients.map((item) => (
            <View key={item.id}>{renderPatientCard({ item })}</View>
          ))}
        </ScrollView>

        {/* FLOATING BOTTOM-RIGHT "ADD MEMBER" ACTION BUTTON */}
        <TouchableOpacity
          style={[
            styles.floatingAddMemberFab,
            { bottom: Math.max(insets.bottom, 10) + 82 },
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
            onPress={() => {
              setActiveTab('Home');
              if (onBack) onBack();
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="home" size={isTablet ? 24 : 20} color={activeTab === 'Home' ? '#0083B0' : colors.textMuted} />
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
            <AppIcon name="calendar" size={isTablet ? 24 : 20} color={activeTab === 'Visits' ? '#0083B0' : colors.textMuted} />
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
            onPress={() => {
              setActiveTab('Reports');
              if (onOpenReports) onOpenReports();
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="document" size={isTablet ? 24 : 20} color={activeTab === 'Reports' ? '#0083B0' : colors.textMuted} />
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
            onPress={() => {
              setActiveTab('Care');
              if (onOpenCare) onOpenCare();
              else setShowContactModal(true);
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="care" size={isTablet ? 24 : 20} color={activeTab === 'Care' ? '#0083B0' : colors.textMuted} />
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
      </View>

      {/* MODAL: SELECT FAMILY MEMBER FOR QUICK ACTION (Book Visit, Pay Bills, Diet) */}
      <Modal
        visible={showMemberSelectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMemberSelectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isTablet && { maxWidth: 520, padding: 24 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.actionIconBg,
                    {
                      backgroundColor: '#E0F2FE',
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      marginRight: 10,
                    },
                  ]}
                >
                  <AppIcon
                    name={
                      actionType === 'Book Appointment'
                        ? 'calendar'
                        : actionType === 'Pay Bills'
                        ? 'wallet-outline'
                        : 'food-apple-outline'
                    }
                    size={20}
                    color="#0083B0"
                  />
                </View>
                <Text style={[styles.modalTitle, isTablet && { fontSize: 20 }]}>
                  {actionType === 'Book Appointment'
                    ? 'Book Doctor Appointment'
                    : actionType === 'Pay Bills'
                    ? 'Pay Medical Bills'
                    : 'Diet & Nutrition'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowMemberSelectModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Select the family member for this {actionType?.toLowerCase() || 'request'}:
            </Text>

            <View style={{ marginTop: 4 }}>
              {patients.map((patient) => {
                const avatarBg = getAvatarBg(patient);
                return (
                  <TouchableOpacity
                    key={patient.id}
                    style={styles.memberSelectItem}
                    onPress={() => handleSelectMemberForAction(patient)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        {
                          backgroundColor: avatarBg,
                          width: 46,
                          height: 46,
                          borderRadius: 23,
                          marginRight: 12,
                        },
                      ]}
                    >
                      <Image
                        source={getAvatarSource(patient)}
                        style={{ width: 46, height: 46 }}
                        resizeMode="cover"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.memberSelectName} numberOfLines={1}>
                          {patient.name}
                        </Text>
                        <Text style={styles.relationTextOnly}>
                          {` ( ${patient.relation.toUpperCase()} )`}
                        </Text>
                      </View>
                      <Text style={styles.memberSelectSub}>
                        Patient No: {patient.patientNumber} • {patient.age}
                      </Text>
                    </View>

                    <View style={styles.memberSelectChevron}>
                      <AppIcon name="chevron-right" size={16} color="#0083B0" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowMemberSelectModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD FAMILY MEMBER */}
      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>

      {/* MODAL: PATIENT CARD OPTIONS */}
      <Modal
        visible={!!selectedPatient}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPatient(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedPatient?.name}</Text>
                <Text style={styles.modalSub}>
                  Patient No: {selectedPatient?.patientNumber} • {selectedPatient?.relation}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPatient(null)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                if (selectedPatient) handleBookAppointmentForPatient(selectedPatient);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
                <AppIcon name="calendar" size={20} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionText}>Book Doctor Appointment</Text>
                <Text style={styles.actionSubtext}>Select specialist & consultation slot</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                if (selectedPatient) handleViewReportsForPatient(selectedPatient);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#DEF0FD' }]}>
                <AppIcon name="document" size={20} color="#0083B0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionText}>View Medical & Lab Reports</Text>
                <Text style={styles.actionSubtext}>Diagnostic tests, prescriptions & bills</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                if (selectedPatient) handleRemoveMember(selectedPatient.id);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#FEF2F2' }]}>
                <AppIcon name="trash" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionText, { color: '#DC2626' }]}>Remove Member</Text>
                <Text style={styles.actionSubtext}>Remove this profile from your family</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: CONTACT US / NOTIFICATIONS */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppIcon name="bell" size={22} color="#0284C7" />
                <Text style={[styles.modalTitle, { marginLeft: 8 }]}>Notifications & Support</Text>
              </View>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              24/7 Patient Care Services & Helpline.
            </Text>

            <View style={styles.contactItem}>
              <View style={[styles.contactIconBg, { backgroundColor: '#FEE2E2' }]}>
                <AppIcon name="phone" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactItemLabel}>Emergency & Ambulance</Text>
                <Text style={styles.contactItemVal}>1066 / +91 22 2172 5100</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={[styles.contactIconBg, { backgroundColor: '#DEF0FD' }]}>
                <AppIcon name="calendar" size={20} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactItemLabel}>Appointment Desk</Text>
                <Text style={styles.contactItemVal}>+91 22 2172 5555</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={[styles.actionIconBg, { backgroundColor: '#DEF0FD' }]}>
                <AppIcon name="shield-check" size={20} color="#0083B0" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactItemLabel}>WhatsApp Assistance</Text>
                <Text style={styles.contactItemVal}>+91 98198 63084</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowContactModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SLIDE BAR DRAWER: PROFILE & SETTINGS */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="none"
        onRequestClose={closeSlideBar}
      >
        <View style={styles.slideBarOverlay}>
          {/* Backdrop dismiss touchable */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeSlideBar}
          />

          <Animated.View
            style={[
              styles.slideBarPanel,
              {
                width: Math.min(width * 0.9, isTablet ? 520 : 380),
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Header: Title + Close Button */}
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slideBarScroll}>
              {/* User Hero Banner with same Profile Pic as on patient list */}
              <View style={[styles.slideBarUserCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <View style={[styles.slideBarAvatar, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD', overflow: 'hidden' }]}>
                  <Image
                    source={userAvatarSource}
                    style={{ width: 60, height: 60, borderRadius: 30 }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.slideBarUserName, { color: colors.textPrimary }]}>
                      {mainMember ? mainMember.name : (userSession.name || 'Rathi Vijay Sharma')}
                    </Text>
                    <View style={[styles.verifiedBadge, { backgroundColor: isDark ? colors.primaryLight : '#E0F2FE' }]}>
                      <AppIcon name="check" size={11} color="#0083B0" />
                    </View>
                  </View>
                  <Text style={styles.slideBarUserUhid}>
                    UHID: {mainMember ? mainMember.patientNumber : '109282827'}
                  </Text>
                  <Text style={[styles.slideBarUserMobile, { color: colors.textSecondary }]}>
                    +91 {mainMember?.mobileNumber || userSession.mobileNumber || '9414023873'}
                  </Text>
                </View>
              </View>

              {/* SECTION: REGISTRATION DETAILS (MRD) */}
              <View style={styles.slideSection}>
                <View style={styles.slideSectionHeaderRow}>
                  <Text style={[styles.slideSectionTitle, { color: colors.textSecondary }]}>HOSPITAL REGISTRATION (MRD)</Text>
                  <View style={[styles.lockedBadge, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}>
                    <AppIcon name="lock" size={11} color={colors.textSecondary} />
                    <Text style={[styles.lockedBadgeText, { color: colors.textSecondary }]}>MRD Verified</Text>
                  </View>
                </View>

                <View style={[styles.mrdDetailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {/* Full Name */}
                  <View style={styles.mrdFieldRow}>
                    <Text style={[styles.mrdFieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
                    <Text style={[styles.mrdFieldValue, { color: colors.textPrimary }]}>
                      {mainMember ? mainMember.name : 'Rathi Vijay Sharma'}
                    </Text>
                  </View>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* Date of Birth */}
                  <View style={styles.mrdFieldRow}>
                    <Text style={[styles.mrdFieldLabel, { color: colors.textSecondary }]}>Date of Birth</Text>
                    <Text style={[styles.mrdFieldValue, { color: colors.textPrimary }]}>1992-05-14</Text>
                  </View>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* Gender */}
                  <View style={styles.mrdFieldRow}>
                    <Text style={[styles.mrdFieldLabel, { color: colors.textSecondary }]}>Gender</Text>
                    <Text style={[styles.mrdFieldValue, { color: colors.textPrimary }]}>Male</Text>
                  </View>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* Primary Mobile */}
                  <View style={styles.mrdFieldRow}>
                    <Text style={[styles.mrdFieldLabel, { color: colors.textSecondary }]}>Primary Mobile</Text>
                    <Text style={[styles.mrdFieldValue, { color: colors.textPrimary }]}>
                      {mainMember?.mobileNumber || userSession.mobileNumber || '9414023873'}
                    </Text>
                  </View>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* UHID */}
                  <View style={styles.mrdFieldRow}>
                    <Text style={[styles.mrdFieldLabel, { color: colors.textSecondary }]}>UHID</Text>
                    <Text style={[styles.mrdFieldValue, { color: '#0083B0' }]}>
                      {mainMember ? mainMember.patientNumber : '109282827'}
                    </Text>
                  </View>
                </View>

                {/* MRD Notice */}
                <View style={styles.mrdNoticeBox}>
                  <AppIcon name="info" size={16} color="#0284C7" style={{ marginTop: 2, marginRight: 8 }} />
                  <Text style={styles.mrdNoticeText}>
                    These fields are set by hospital Registration/MRD staff and can't be edited in the app. Use "Request Profile Correction" below for changes.
                  </Text>
                </View>
              </View>

              {/* SECTION: ACCOUNT */}
              <View style={styles.slideSection}>
                <Text style={[styles.slideSectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
                <View style={[styles.slideMenuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {/* Digital Medical ID */}
                  <TouchableOpacity
                    style={styles.slideMenuItem}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Digital Medical ID', 'Scan your QR code at hospital OPD counters or pharmacy desks.')}
                  >
                    <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#E0F2FE' }]}>
                      <AppIcon name="qrcode" size={20} color="#0083B0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Digital Medical ID</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Tap to flip for your scannable QR</Text>
                    </View>
                    <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* My Family */}
                  <TouchableOpacity
                    style={styles.slideMenuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeSlideBar();
                      setShowAddMemberModal(true);
                    }}
                  >
                    <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                      <AppIcon name="users" size={20} color="#0083B0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>My Family</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>{patients.length} member(s)</Text>
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
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Request Profile Correction</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Name, DOB, gender or mobile number</Text>
                    </View>
                    <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* My Correction Requests */}
                  <TouchableOpacity
                    style={styles.slideMenuItem}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Correction Requests', 'You have 0 submitted requests pending review.')}
                  >
                    <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                      <AppIcon name="document" size={19} color="#0083B0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>My Correction Requests</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>0 submitted</Text>
                    </View>
                    <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* Who Can Access My Records */}
                  <TouchableOpacity
                    style={styles.slideMenuItem}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Access Permissions', '2 active grant(s) for family members & assigned doctors.')}
                  >
                    <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                      <AppIcon name="shield-check" size={20} color="#0083B0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Who Can Access My Records</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>2 active grant(s)</Text>
                    </View>
                    <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* Notifications */}
                  <TouchableOpacity
                    style={styles.slideMenuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeSlideBar();
                      setShowContactModal(true);
                    }}
                  >
                    <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                      <AppIcon name="bell" size={20} color="#0083B0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Notifications</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>5 recent</Text>
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

                  {/* Audit Trail */}
                  <TouchableOpacity
                    style={styles.slideMenuItem}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Audit Trail', 'Showing complete login and record access history.')}
                  >
                    <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                      <AppIcon name="history" size={20} color="#0083B0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Audit Trail</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Full activity history</Text>
                    </View>
                    <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                  {/* Medical Records */}
                  <TouchableOpacity
                    style={styles.slideMenuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      closeSlideBar();
                      if (patients.length > 0) handleViewReportsForPatient(patients[0]);
                    }}
                  >
                    <View style={[styles.slideMenuIconBg, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}>
                      <AppIcon name="hospital" size={20} color="#0083B0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Medical Records</Text>
                      <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Visit history, reports & prescriptions</Text>
                    </View>
                    <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* SECTION: DISPLAY & ACCESSIBILITY */}
              <View style={styles.slideSection}>
                <Text style={[styles.slideSectionTitle, { color: colors.textSecondary }]}>DISPLAY & ACCESSIBILITY</Text>
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

                  {/* Accessibility Mode */}
                  <View style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[styles.displayRowLabel, { color: colors.textPrimary }]}>Accessibility Mode</Text>
                      <Switch
                        value={accessibilityMode}
                        onValueChange={setAccessibilityMode}
                        trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: '#0083B0' }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                    <Text style={[styles.accessibilityDesc, { color: colors.textSecondary }]}>
                      Larger text, higher-contrast borders & bigger touch targets throughout the app.
                    </Text>
                  </View>
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
                onPress={() => {
                  closeSlideBar();
                  Alert.alert('Log Out', 'Are you sure you want to log out?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log Out', style: 'destructive', onPress: onLogout },
                  ]);
                }}
                activeOpacity={0.88}
              >
                <AppIcon name="logout" size={18} color="#EF4444" />
                <Text style={styles.slideLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

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
});

export default PatientListScreen;
