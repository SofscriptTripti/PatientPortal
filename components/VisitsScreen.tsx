import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession, PatientMember } from './types';
import { INITIAL_PATIENTS } from './mockData';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';

export interface AppointmentItem {
  id: string;
  aptNo: string;
  patientId: string;
  patientName: string;
  relation: string;
  department: string;
  doctorName: string;
  qualification: string;
  doctorAvatar: any;
  patientAvatar: any;
  dateTime: string;
  status: 'Appointment Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  chiefComplaint?: string;
  fee: string;
}

const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  // ==========================================
  // MEMBER 1: RATHI VIJAY SHARMA (SELF · 4 VISITS)
  // ==========================================
  {
    id: 'apt-rathi-1',
    aptNo: 'APT-2026-09412',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    department: 'Cardiology',
    doctorName: 'Dr. Ananya Sharma',
    qualification: 'MBBS, MD, DM - Interventional Cardiologist',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_male.png'),
    dateTime: '2026-06-25 09:15 AM',
    status: 'Confirmed',
    chiefComplaint: 'Routine blood pressure & ECG check',
    fee: '₹800',
  },
  {
    id: 'apt-rathi-2',
    aptNo: 'APT-2026-10245',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    department: 'General Medicine',
    doctorName: 'Dr. Chakravarthi',
    qualification: 'MBBS, MD, FRCP - Chief Consultant Physician',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_male.png'),
    dateTime: '2026-09-12 11:00 AM',
    status: 'Appointment Requested',
    chiefComplaint: 'Annual executive health & wellness consultation',
    fee: '₹600',
  },
  {
    id: 'apt-rathi-3',
    aptNo: 'APT-2026-07820',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    department: 'Orthopedics',
    doctorName: 'Dr. Rajesh Iyer',
    qualification: 'MS (Ortho), DNB - Consultant Orthopedic Surgeon',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_male.png'),
    dateTime: '2026-04-10 03:30 PM',
    status: 'Completed',
    chiefComplaint: 'Lower back muscle soreness after workout',
    fee: '₹600',
  },
  {
    id: 'apt-rathi-4',
    aptNo: 'APT-2026-06104',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    department: 'General Medicine',
    doctorName: 'Dr. Priya Nair',
    qualification: 'MBBS, MD - Senior Physician',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_male.png'),
    dateTime: '2026-02-18 10:00 AM',
    status: 'Completed',
    chiefComplaint: 'Seasonal viral fever recovery and blood test review',
    fee: '₹500',
  },

  // ==========================================
  // MEMBER 2: KAVITA CHOUHAN (WIFE · 4 VISITS)
  // ==========================================
  {
    id: 'apt-kavita-1',
    aptNo: 'APT-2026-10006',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    department: 'General Medicine',
    doctorName: 'Dr. Priya Nair',
    qualification: 'MBBS, MD - Senior Physician',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_kavita.png'),
    dateTime: '2026-09-07 10:30 AM',
    status: 'Appointment Requested',
    chiefComplaint: 'Fever & Persistent Cough (3 days)',
    fee: '₹500',
  },
  {
    id: 'apt-kavita-2',
    aptNo: 'APT-2026-09750',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    department: 'Gynaecology',
    doctorName: 'Dr. Sunita Rao',
    qualification: 'MBBS, MS (OBG) - Senior Gynaecologist',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_kavita.png'),
    dateTime: '2026-07-22 04:30 PM',
    status: 'Confirmed',
    chiefComplaint: 'Routine antenatal wellness and iron profiling',
    fee: '₹750',
  },
  {
    id: 'apt-kavita-3',
    aptNo: 'APT-2026-08312',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    department: 'Dermatology',
    doctorName: 'Dr. Meenakshi Sundaram',
    qualification: 'MD (Dermatology), DVD - Consultant Dermatologist',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_kavita.png'),
    dateTime: '2026-05-18 11:15 AM',
    status: 'Completed',
    chiefComplaint: 'Skin allergic rash and contact dermatitis consultation',
    fee: '₹600',
  },
  {
    id: 'apt-kavita-4',
    aptNo: 'APT-2026-07198',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    department: 'General Medicine',
    doctorName: 'Dr. Priya Nair',
    qualification: 'MBBS, MD - Senior Physician',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_kavita.png'),
    dateTime: '2026-03-05 02:00 PM',
    status: 'Completed',
    chiefComplaint: 'Vitamin D3 & thyroid profiling follow-up',
    fee: '₹500',
  },

  // ==========================================
  // MEMBER 3: AARAV CHOUHAN (SON · 4 VISITS)
  // ==========================================
  {
    id: 'apt-aarav-1',
    aptNo: 'APT-2026-09884',
    patientId: '3',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    department: 'Pediatrics',
    doctorName: 'Dr. Chakravarthi PIS',
    qualification: 'MBBS, MD - Chief Pediatrician',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_aarav.png'),
    dateTime: '2026-06-18 11:30 AM',
    status: 'Confirmed',
    chiefComplaint: 'Seasonal cough & allergic rhinitis follow-up',
    fee: '₹650',
  },
  {
    id: 'apt-aarav-2',
    aptNo: 'APT-2026-10118',
    patientId: '3',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    department: 'Pediatrics',
    doctorName: 'Dr. Ananya Roy',
    qualification: 'MBBS, DNB - Child Specialist',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_aarav.png'),
    dateTime: '2026-09-15 05:00 PM',
    status: 'Appointment Requested',
    chiefComplaint: 'Pediatric booster immunization and physical growth review',
    fee: '₹450',
  },
  {
    id: 'apt-aarav-3',
    aptNo: 'APT-2026-08650',
    patientId: '3',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    department: 'ENT',
    doctorName: 'Dr. Alok Verma',
    qualification: 'MS (ENT), DLO - Senior ENT Consultant',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_aarav.png'),
    dateTime: '2026-05-28 10:45 AM',
    status: 'Completed',
    chiefComplaint: 'Mild ear ache after swimming and throat review',
    fee: '₹550',
  },
  {
    id: 'apt-aarav-4',
    aptNo: 'APT-2026-06900',
    patientId: '3',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    department: 'Pediatrics',
    doctorName: 'Dr. Chakravarthi PIS',
    qualification: 'MBBS, MD - Chief Pediatrician',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_aarav.png'),
    dateTime: '2026-02-22 03:15 PM',
    status: 'Completed',
    chiefComplaint: 'Annual school health fitness certificate & vision check',
    fee: '₹650',
  },

  // ==========================================
  // MEMBER 4: DEEPAK CHOUHAN (BROTHER · 4 VISITS)
  // ==========================================
  {
    id: 'apt-deepak-1',
    aptNo: 'APT-2026-08190',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    department: 'Orthopedics',
    doctorName: 'Dr. Rajesh Iyer',
    qualification: 'MS (Ortho), DNB - Consultant Orthopedic Surgeon',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_deepak.png'),
    dateTime: '2026-05-12 04:00 PM',
    status: 'Completed',
    chiefComplaint: 'Right wrist sprain & rehabilitation review',
    fee: '₹600',
  },
  {
    id: 'apt-deepak-2',
    aptNo: 'APT-2026-10310',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    department: 'Orthopedics',
    doctorName: 'Dr. Rajesh Iyer',
    qualification: 'MS (Ortho), DNB - Consultant Orthopedic Surgeon',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_deepak.png'),
    dateTime: '2026-09-20 09:30 AM',
    status: 'Appointment Requested',
    chiefComplaint: 'Physiotherapy progress check for wrist mobility',
    fee: '₹600',
  },
  {
    id: 'apt-deepak-3',
    aptNo: 'APT-2026-09550',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    department: 'General Surgery',
    doctorName: 'Dr. Amit Bhatnagar',
    qualification: 'MBBS, MS - Senior General Surgeon',
    doctorAvatar: require('../assets/images/avatar_doctor.png'),
    patientAvatar: require('../assets/images/avatar_deepak.png'),
    dateTime: '2026-07-02 02:30 PM',
    status: 'Confirmed',
    chiefComplaint: 'Abdominal ultrasound review & gastroenterology consult',
    fee: '₹700',
  },
  {
    id: 'apt-deepak-4',
    aptNo: 'APT-2026-07440',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    department: 'General Medicine',
    doctorName: 'Dr. Priya Nair',
    qualification: 'MBBS, MD - Senior Physician',
    doctorAvatar: require('../assets/images/avatar_doctor_female.png'),
    patientAvatar: require('../assets/images/avatar_deepak.png'),
    dateTime: '2026-03-29 11:30 AM',
    status: 'Completed',
    chiefComplaint: 'Seasonal flu symptoms and post-recovery check',
    fee: '₹500',
  },
];

interface VisitsScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onBookNewVisit: () => void;
  onOpenHome?: () => void;
  onOpenPatientList?: () => void;
}

export const VisitsScreen: React.FC<VisitsScreenProps> = ({
  userSession,
  onBack,
  onBookNewVisit,
  onOpenHome,
  onOpenPatientList,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  // Family members list
  const [members] = useState<PatientMember[]>(INITIAL_PATIENTS);

  // Self member by default (Rathi Vijay Sharma)
  const defaultSelfMember =
    members.find(
      (m) =>
        m.relation.toLowerCase() === 'self' ||
        m.relation.toLowerCase() === 'you' ||
        m.name.toLowerCase().includes('rathi')
    ) || members[0];

  // 1. Initial State: Directly show Visits & Appointments with "Self" pre-selected by default
  const [selectedMember, setSelectedMember] = useState<PatientMember>(defaultSelfMember);

  // Switch Member Bottom Sheet State
  const [showMemberSwitchSheet, setShowMemberSwitchSheet] = useState(false);

  // Appointments state
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);

  // 2. Reschedule / Cancel Bottom Sheet State (Slide from bottom, covers screen width, curvy top)
  const [showRescheduleSheet, setShowRescheduleSheet] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState<AppointmentItem | null>(null);
  const [selectedNewDate, setSelectedNewDate] = useState('Tomorrow, 10:30 AM');

  // Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Filtered appointments for the currently selected member only
  const currentMemberAppointments = appointments.filter(
    (apt) => apt.patientId === selectedMember.id
  );

  // Helper avatar for members
  const getMemberAvatar = (patientId: string) => {
    switch (patientId) {
      case '1':
        return require('../assets/images/avatar_male.png');
      case '2':
        return require('../assets/images/avatar_kavita.png');
      case '3':
        return require('../assets/images/avatar_aarav.png');
      case '4':
        return require('../assets/images/avatar_deepak.png');
      default:
        return require('../assets/images/avatar_male.png');
    }
  };

  // Helper avatar background
  const getMemberAvatarBg = (member: PatientMember) => {
    if (member.genderType === 'F' || member.relation.toLowerCase() === 'wife') {
      return '#FDE1E7';
    }
    return '#DEF0FD';
  };

  // Helper to get status colors
  const getStatusBadgeStyle = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'Appointment Requested':
        return {
          bg: isDark ? '#1E3A5F' : '#DEF0FD',
          text: '#0083B0',
          icon: 'clock' as const,
        };
      case 'Confirmed':
        return {
          bg: isDark ? '#14382B' : '#ECFDF5',
          text: '#059669',
          icon: 'check' as const,
        };
      case 'Completed':
        return {
          bg: isDark ? '#1E293B' : '#F1F5F9',
          text: '#64748B',
          icon: 'shield-check' as const,
        };
      case 'Cancelled':
        return {
          bg: isDark ? '#3B1A1A' : '#FEF2F2',
          text: '#DC2626',
          icon: 'close' as const,
        };
    }
  };

  // Open Reschedule/Cancel Bottom Sheet
  const handleOpenReschedule = (apt: AppointmentItem) => {
    setRescheduleApt(apt);
    setShowRescheduleSheet(true);
  };

  // Execute Reschedule
  const handleConfirmReschedule = () => {
    if (!rescheduleApt) return;
    setShowRescheduleSheet(false);
    setLoaderState({
      visible: true,
      message: 'Rescheduling Appointment...',
      subtitle: `Booking ${selectedNewDate} with ${rescheduleApt.doctorName}`,
    });

    setTimeout(() => {
      setLoaderState({ visible: false });
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === rescheduleApt.id
            ? { ...item, dateTime: selectedNewDate, status: 'Confirmed' }
            : item
        )
      );
      Alert.alert(
        'Appointment Rescheduled',
        `Your visit for ${rescheduleApt.patientName} is now confirmed for ${selectedNewDate}.`
      );
    }, 700);
  };

  // Execute Cancel
  const handleConfirmCancel = () => {
    if (!rescheduleApt) return;
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel appointment ${rescheduleApt.aptNo} for ${rescheduleApt.patientName}?`,
      [
        { text: 'Keep Appointment', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setShowRescheduleSheet(false);
            setLoaderState({
              visible: true,
              message: 'Cancelling Appointment...',
              subtitle: 'Updating hospital schedule',
            });
            setTimeout(() => {
              setLoaderState({ visible: false });
              setAppointments((prev) =>
                prev.map((item) =>
                  item.id === rescheduleApt.id
                    ? { ...item, status: 'Cancelled' }
                    : item
                )
              );
              Alert.alert('Appointment Cancelled', `Appointment ${rescheduleApt.aptNo} has been cancelled.`);
            }, 600);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* APP-THEMED AMBIENT PARENT BACKGROUND LAYER */}
        <View style={styles.ambientBgContainer} pointerEvents="none">
          <View style={[styles.ambientTopGlow, isDark && { backgroundColor: '#1E3A5F', opacity: 0.3 }]} />
          <View style={[styles.ambientMidGlow, isDark && { backgroundColor: '#162032', opacity: 0.2 }]} />
          <Image
            source={require('../assets/images/leaves_wave_bg.png')}
            style={[styles.ambientWaveImage, isDark && { opacity: 0.07 }]}
            resizeMode="cover"
          />
        </View>

        {/* 1. TOP HEADER BAR: Blue title "Visit Details" centered, Curvy bottom line */}
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
            <TouchableOpacity
              onPress={onBack}
              style={[styles.headerBackBtn, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="back" size={isTablet ? 24 : 20} color="#0083B0" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
              Visit Details
            </Text>
          </View>

          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        {/* ========================================================
            DIRECT VISITS & APPOINTMENTS (DEFAULT: SELF USER)
            WITH SWITCH MEMBER DROPDOWN AT TOP
           ======================================================== */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 20 : 16,
              paddingTop: isTablet ? 16 : 14,
              paddingBottom: 120, // ample room for right floating button above bottom bar
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
            {/* SWITCH MEMBER DROPDOWN BAR */}
            <View style={[styles.switchMemberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.switchMemberLeft}>
                <Image
                  source={getMemberAvatar(selectedMember.id)}
                  style={styles.switchMemberAvatar}
                  resizeMode="cover"
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.switchMemberLabel, { color: colors.textSecondary }]}>
                    CURRENTLY VIEWING
                  </Text>
                  <Text style={[styles.switchMemberName, { color: colors.textPrimary }]}>
                    {selectedMember.name}{' '}
                    <Text style={styles.switchMemberRelation}>({selectedMember.relation})</Text>
                  </Text>
                </View>
              </View>

              {/* Dropdown Button to Switch Member */}
              <TouchableOpacity
                style={styles.switchMemberDropdownBtn}
                onPress={() => setShowMemberSwitchSheet(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.switchMemberDropdownText}>Switch Member</Text>
                <AppIcon name="chevron-down" size={15} color="#0083B0" />
              </TouchableOpacity>
            </View>

            {/* SECTION HEADER */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                VISITS & APPOINTMENTS ({currentMemberAppointments.length})
              </Text>
            </View>

            {/* APPOINTMENTS LIST FOR THIS MEMBER */}
            {currentMemberAppointments.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AppIcon name="calendar" size={40} color="#0083B0" />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Visits Found</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  {selectedMember.name} does not have any scheduled or past appointments.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBookBtn}
                  onPress={onBookNewVisit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyBookBtnText}>Book Visit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              currentMemberAppointments.map((apt) => {
                const badge = getStatusBadgeStyle(apt.status);

                return (
                  <View
                    key={apt.id}
                    style={[
                      styles.visitCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    {/* Card Top Row: Appointment ID & Status Badge */}
                    <View style={styles.visitCardTopRow}>
                      <View style={styles.aptNoBadge}>
                        <AppIcon name="document" size={15} color="#0083B0" />
                        <Text style={[styles.aptNoText, { color: colors.textPrimary }]}>{apt.aptNo}</Text>
                      </View>

                      <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
                        <AppIcon name={badge.icon} size={11} color={badge.text} />
                        <Text style={[styles.statusText, { color: badge.text }]}>{apt.status}</Text>
                      </View>
                    </View>

                    {/* Doctor Info Row */}
                    <View style={styles.doctorInfoRow}>
                      <View style={[styles.doctorAvatarBox, { backgroundColor: '#DEF0FD' }]}>
                        <Image
                          source={apt.doctorAvatar}
                          style={styles.doctorAvatarImg}
                          resizeMode="cover"
                        />
                      </View>

                      <View style={styles.doctorDetailsCol}>
                        <Text style={[styles.doctorNameText, { color: colors.textPrimary }]}>
                          {apt.doctorName}
                        </Text>
                        <Text style={[styles.doctorQualText, { color: colors.textSecondary }]}>
                          {apt.qualification}
                        </Text>
                      </View>

                      <View style={styles.feeBadge}>
                        <Text style={styles.feeBadgeLabel}>Tariff</Text>
                        <Text style={styles.feeBadgeAmount}>{apt.fee}</Text>
                      </View>
                    </View>

                    {/* Subtitle Line: Member Name · Department · Date/Time */}
                    <View style={[styles.metaStripContainer, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF' }]}>
                      <AppIcon name="calendar" size={13} color="#0083B0" />
                      <Text style={[styles.metaSubtitleText, { color: colors.textPrimary }]} numberOfLines={2}>
                        <Text style={styles.metaHighlightName}>{apt.patientName}</Text>
                        {' '}· {apt.department} · {apt.dateTime}
                      </Text>
                    </View>

                    {/* Chief Complaint: Clean display without edit button */}
                    {apt.chiefComplaint ? (
                      <View style={[styles.complaintBox, { backgroundColor: isDark ? '#182435' : '#F8FAFC', borderColor: colors.border }]}>
                        <Text style={[styles.complaintLabel, { color: colors.textSecondary }]}>CHIEF COMPLAINT</Text>
                        <Text style={[styles.complaintValue, { color: colors.textPrimary }]}>
                          "{apt.chiefComplaint}"
                        </Text>
                      </View>
                    ) : null}

                    {/* Action: Reschedule / Cancel Button */}
                    <View style={styles.cardActionsRow}>
                      {apt.status === 'Completed' ? (
                        <TouchableOpacity
                          style={styles.completedStatusBtn}
                          disabled
                        >
                          <AppIcon name="check" size={14} color="#059669" />
                          <Text style={styles.completedStatusBtnText}>Visit Completed</Text>
                        </TouchableOpacity>
                      ) : apt.status === 'Cancelled' ? (
                        <TouchableOpacity
                          style={styles.cancelledStatusBtn}
                          disabled
                        >
                          <AppIcon name="close" size={14} color="#DC2626" />
                          <Text style={styles.cancelledStatusBtnText}>Cancelled</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.rescheduleActionBtn,
                            { backgroundColor: isDark ? colors.surfaceVariant : '#FFF7ED', borderColor: '#FED7AA' },
                          ]}
                          onPress={() => handleOpenReschedule(apt)}
                          activeOpacity={0.75}
                        >
                          <AppIcon name="calendar" size={14} color="#EA580C" />
                          <Text style={styles.rescheduleActionBtnText}>Reschedule / Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

        {/* ========================================================
            3. "BOOK NEW VISIT" FLOATING BUTTON ON RIGHT SIDE
            (No icon before text, placed right side above bottom bar)
           ======================================================== */}
        <TouchableOpacity
          style={[
            styles.floatingBookBtnRight,
            { bottom: Math.max(insets.bottom, 10) + 88 },
          ]}
          onPress={onBookNewVisit}
          activeOpacity={0.88}
        >
          <Text style={styles.floatingBookBtnRightText}>Book New Visit</Text>
        </TouchableOpacity>

        {/* ========================================================
            4. FIXED BOTTOM NAVIGATION BAR (Visits Active)
           ======================================================== */}
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
            onPress={() => {
              if (onOpenHome) onOpenHome();
              else onBack();
            }}
          >
            <View style={styles.inactiveIndicatorPlaceholder} />
            <AppIcon name="home" size={isTablet ? 26 : 22} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 13 }]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Visits (ACTIVE) */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.8}
            onPress={() => setShowMemberSwitchSheet(true)}
          >
            <View style={styles.activeIndicatorBar} />
            <AppIcon name="calendar" size={isTablet ? 26 : 22} color="#0083B0" />
            <Text style={[styles.navLabel, { color: '#0083B0' }, styles.navLabelActive, isTablet && { fontSize: 13 }]}>
              Visits
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Reports */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => {
              if (onOpenPatientList) onOpenPatientList();
              else onBack();
            }}
          >
            <View style={styles.inactiveIndicatorPlaceholder} />
            <AppIcon name="document" size={isTablet ? 26 : 22} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 13 }]}>
              Reports
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Care */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Patient Care', 'Hospital 24/7 Helpline: 1800-123-4567')}
          >
            <View style={styles.inactiveIndicatorPlaceholder} />
            <AppIcon name="care" size={isTablet ? 26 : 22} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 13 }]}>
              Care
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            MODAL A: SWITCH MEMBER BOTTOM SHEET MODAL
            (Slide from bottom, covers screen width, curvy top)
           ======================================================== */}
        <Modal
          visible={showMemberSwitchSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMemberSwitchSheet(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity
              style={styles.sheetBackdropDismiss}
              activeOpacity={1}
              onPress={() => setShowMemberSwitchSheet(false)}
            />

            <View
              style={[
                styles.bottomSheetContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  paddingBottom: Math.max(insets.bottom + 20, 40),
                },
              ]}
            >
              {/* Handle Bar */}
              <View style={styles.sheetHandleBar} />

              <View style={styles.sheetHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                    Switch Family Member
                  </Text>
                  <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>
                    Select a member to switch and view their visit history
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowMemberSwitchSheet(false)}
                  style={[styles.sheetCloseBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                >
                  <AppIcon name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: Math.min(height * 0.6, 420) }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {members.map((member) => {
                  const isSelected = selectedMember?.id === member.id;
                  const memberAptCount = appointments.filter((a) => a.patientId === member.id).length;

                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.sheetMemberItem,
                        { borderColor: isSelected ? '#0083B0' : colors.border },
                        isSelected && { backgroundColor: isDark ? '#1E3A5F' : '#F0F9FF' },
                      ]}
                      onPress={() => {
                        setSelectedMember(member);
                        setShowMemberSwitchSheet(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Image
                        source={getMemberAvatar(member.id)}
                        style={styles.sheetMemberAvatar}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.sheetMemberName, { color: colors.textPrimary }]}>
                          {member.name}
                        </Text>
                        <Text style={[styles.sheetMemberSub, { color: colors.textSecondary }]}>
                          {member.relation} · UHID: {member.patientNumber}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={styles.sheetSelectedCheck}>
                          <AppIcon name="check" size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <Text style={[styles.sheetVisitCountPill, { color: '#0083B0' }]}>
                          {memberAptCount} visit(s)
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            MODAL B: RESCHEDULE / CANCEL BOTTOM SHEET MODAL
            (Slide from bottom, covers screen width, curvy top)
           ======================================================== */}
        <Modal
          visible={showRescheduleSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRescheduleSheet(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity
              style={styles.sheetBackdropDismiss}
              activeOpacity={1}
              onPress={() => setShowRescheduleSheet(false)}
            />

            <View
              style={[
                styles.bottomSheetContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  paddingBottom: Math.max(insets.bottom + 20, 40),
                },
              ]}
            >
              {/* Top Handle Bar */}
              <View style={styles.sheetHandleBar} />

              <View style={styles.sheetHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                    Reschedule or Cancel Visit
                  </Text>
                  <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>
                    {rescheduleApt?.aptNo} · {rescheduleApt?.patientName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowRescheduleSheet(false)}
                  style={[styles.sheetCloseBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                >
                  <AppIcon name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Current Appointment Snapshot */}
              <View style={[styles.sheetCurrentBox, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: '#BAE6FD' }]}>
                <Text style={[styles.sheetCurrentBoxTitle, { color: '#0083B0' }]}>CURRENT APPOINTMENT</Text>
                <Text style={[styles.sheetCurrentDoc, { color: colors.textPrimary }]}>
                  {rescheduleApt?.doctorName} · {rescheduleApt?.department}
                </Text>
                <Text style={[styles.sheetCurrentSlot, { color: colors.textSecondary }]}>
                  Current Slot: {rescheduleApt?.dateTime}
                </Text>
              </View>

              <Text style={[styles.sheetSectionLabel, { color: colors.textSecondary }]}>
                SELECT NEW TIME SLOT:
              </Text>

              {/* Slot Choices */}
              <View style={{ gap: 8, marginBottom: 18 }}>
                {[
                  'Tomorrow, 10:30 AM',
                  'Tomorrow, 04:15 PM',
                  'In 2 Days, 11:00 AM',
                ].map((slot) => {
                  const isSelected = selectedNewDate === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.sheetSlotOptionPill,
                        isSelected
                          ? { backgroundColor: '#0083B0', borderColor: '#0083B0' }
                          : { backgroundColor: isDark ? '#162032' : '#F8FAFC', borderColor: colors.border },
                      ]}
                      onPress={() => setSelectedNewDate(slot)}
                      activeOpacity={0.8}
                    >
                      <AppIcon
                        name="clock"
                        size={14}
                        color={isSelected ? '#FFFFFF' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.sheetSlotOptionText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  style={styles.sheetConfirmRescheduleBtn}
                  onPress={handleConfirmReschedule}
                  activeOpacity={0.85}
                >
                  <AppIcon name="calendar" size={16} color="#FFFFFF" />
                  <Text style={styles.sheetConfirmRescheduleText}>Confirm New Time Slot</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetCancelDestructiveBtn}
                  onPress={handleConfirmCancel}
                  activeOpacity={0.8}
                >
                  <AppIcon name="close" size={15} color="#DC2626" />
                  <Text style={styles.sheetCancelDestructiveText}>Cancel This Appointment</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    backgroundColor: '#FFFFFF',
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

  // 1. TOP HEADER BAR
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

  scrollContent: {
    flexGrow: 1,
  },

  // CASE A: MEMBER SELECTION PROMPT
  selectMemberPromptCard: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  selectPromptTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  selectPromptSub: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  memberSelectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  memberAvatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  memberAvatarImage: {
    width: 54,
    height: 54,
  },
  memberSelectionInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  memberSelectionName: {
    fontSize: 16,
    fontWeight: '800',
  },
  memberRelationTag: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0083B0',
    marginLeft: 6,
  },
  memberUhidText: {
    fontSize: 12,
    marginTop: 2,
  },
  aptCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 5,
  },
  aptCountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0083B0',
  },
  memberChevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDF8FD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CASE B: SWITCH MEMBER DROPDOWN BAR
  switchMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  switchMemberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  switchMemberLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchMemberName: {
    fontSize: 14.5,
    fontWeight: '800',
    marginTop: 1,
  },
  switchMemberRelation: {
    fontWeight: '600',
    color: '#0083B0',
  },
  switchMemberDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF0FD',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  switchMemberDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0083B0',
  },

  // SECTION TITLE
  sectionHeaderRow: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // APPOINTMENT CARDS
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  visitCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aptNoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aptNoText: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    gap: 5,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Doctor Info Row
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  doctorAvatarImg: {
    width: 48,
    height: 48,
  },
  doctorDetailsCol: {
    flex: 1,
    marginLeft: 12,
  },
  doctorNameText: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  doctorQualText: {
    fontSize: 12,
    marginTop: 2,
  },
  feeBadge: {
    alignItems: 'flex-end',
  },
  feeBadgeLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  feeBadgeAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0083B0',
  },

  // Meta Strip (Member · Dept · Date/Time)
  metaStripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
  },
  metaSubtitleText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  metaHighlightName: {
    fontWeight: '800',
    color: '#0083B0',
  },

  // Chief Complaint Display (No edit button)
  complaintBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  complaintLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  complaintValue: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 3,
    fontStyle: 'italic',
  },

  // Card Actions Row
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rescheduleActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  rescheduleActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  completedStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    gap: 6,
  },
  completedStatusBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669',
  },
  cancelledStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  cancelledStatusBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Empty Box
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 18,
    borderWidth: 1.5,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyBookBtn: {
    backgroundColor: '#0083B0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyBookBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  mainScrollView: {
    flex: 1,
  },

  // 3. "BOOK NEW VISIT" FLOATING BUTTON ON RIGHT SIDE
  floatingBookBtnRight: {
    position: 'absolute',
    right: 16,  // right side
    backgroundColor: '#0083B0',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  floatingBookBtnRightText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // 4. BOTTOM NAVIGATION BAR
  bottomNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
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

  // BOTTOM SHEET MODAL STYLES (Slide from bottom, covers screen width, curvy top)
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end', // flush to bottom
  },
  sheetBackdropDismiss: {
    flex: 1,
  },
  bottomSheetContainer: {
    width: '100%', // covers screen width
    borderTopLeftRadius: 26, // curvy top left
    borderTopRightRadius: 26, // curvy top right
    borderWidth: 1.5,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
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
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sheetSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sheet Member Switch Items
  sheetMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  sheetMemberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sheetMemberName: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  sheetMemberSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetSelectedCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetVisitCountPill: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Sheet Reschedule Details
  sheetCurrentBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  sheetCurrentBoxTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  sheetCurrentDoc: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  sheetCurrentSlot: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sheetSlotOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  sheetSlotOptionText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  sheetConfirmRescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0083B0',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  sheetConfirmRescheduleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetCancelDestructiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  sheetCancelDestructiveText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default VisitsScreen;
