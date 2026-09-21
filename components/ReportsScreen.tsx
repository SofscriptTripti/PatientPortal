import React, { useState, useEffect } from 'react';
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
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession, PatientMember } from './types';
import { INITIAL_PATIENTS } from './mockData';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';
import { getActiveMember } from './accountManager';

export interface MedicalReportItem {
  id: string;
  reportNo: string;
  patientId: string;
  patientName: string;
  relation: string;
  title: string;
  category: 'Lab Report' | 'Radiology' | 'Prescription';
  date: string;
  doctorName: string;
  department: string;
  status: 'Ready' | 'Processing';
  fileSize: string;
  summary: string;
}

const INITIAL_REPORTS: MedicalReportItem[] = [
  // ==========================================
  // MEMBER 1: RATHI VIJAY SHARMA (SELF)
  // ==========================================
  {
    id: 'rep-rathi-1',
    reportNo: 'LAB-2026-88912',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    title: 'Complete Blood Count (CBC) & HbA1c',
    category: 'Lab Report',
    date: '25 Jun, 2026',
    doctorName: 'Dr. Ananya Sharma',
    department: 'Cardiology',
    status: 'Ready',
    fileSize: '1.2 MB PDF',
    summary: 'Hemoglobin: 14.2 g/dL, HbA1c: 5.6% (Normal glycemic control)',
  },
  {
    id: 'rep-rathi-2',
    reportNo: 'RAD-2026-90410',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    title: '12-Lead ECG & Echo Doppler Screening',
    category: 'Radiology',
    date: '12 Jun, 2026',
    doctorName: 'Dr. Chakravarthi',
    department: 'Cardiology',
    status: 'Ready',
    fileSize: '2.4 MB PDF',
    summary: 'Sinus rhythm, normal axis, LVEF 64%, no ischemic ECG changes',
  },
  {
    id: 'rep-rathi-3',
    reportNo: 'LAB-2026-74120',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    title: 'Lipid Profile & Renal Function Panel',
    category: 'Lab Report',
    date: '10 Apr, 2026',
    doctorName: 'Dr. Rajesh Iyer',
    department: 'Orthopedics',
    status: 'Ready',
    fileSize: '850 KB PDF',
    summary: 'Total Cholesterol: 185 mg/dL, Serum Creatinine: 0.9 mg/dL',
  },
  {
    id: 'rep-rathi-4',
    reportNo: 'RX-2026-61004',
    patientId: '1',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    title: 'Digital Prescription - Recovery Protocol',
    category: 'Prescription',
    date: '18 Feb, 2026',
    doctorName: 'Dr. Priya Nair',
    department: 'General Medicine',
    status: 'Ready',
    fileSize: '420 KB PDF',
    summary: 'Paracetamol 650mg TDS, Vitamin C 500mg, Hydration advice',
  },

  // ==========================================
  // MEMBER 2: KAVITA CHOUHAN (WIFE)
  // ==========================================
  {
    id: 'rep-kavita-1',
    reportNo: 'LAB-2026-10022',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    title: 'Thyroid Panel (T3, T4, TSH) & Vit D3',
    category: 'Lab Report',
    date: '07 Sep, 2026',
    doctorName: 'Dr. Priya Nair',
    department: 'General Medicine',
    status: 'Ready',
    fileSize: '1.1 MB PDF',
    summary: 'TSH: 2.4 uIU/mL (Normal), Vitamin D3: 32 ng/mL (Sufficient)',
  },
  {
    id: 'rep-kavita-2',
    reportNo: 'RAD-2026-09780',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    title: 'Obstetric & Pelvic Ultrasound Scan',
    category: 'Radiology',
    date: '22 Jul, 2026',
    doctorName: 'Dr. Sunita Rao',
    department: 'Gynaecology',
    status: 'Ready',
    fileSize: '3.8 MB PDF',
    summary: 'Single live fetus in cephalic presentation, liquor adequate',
  },
  {
    id: 'rep-kavita-3',
    reportNo: 'LAB-2026-08340',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    title: 'Allergy Screening & Total IgE Count',
    category: 'Lab Report',
    date: '18 May, 2026',
    doctorName: 'Dr. Meenakshi Sundaram',
    department: 'Dermatology',
    status: 'Ready',
    fileSize: '980 KB PDF',
    summary: 'Total IgE: 140 IU/mL, mild sensitivity to dust allergens',
  },
  {
    id: 'rep-kavita-4',
    reportNo: 'RX-2026-55410',
    patientId: '2',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    title: 'Antenatal Vitamin & Mineral Protocol',
    category: 'Prescription',
    date: '10 May, 2026',
    doctorName: 'Dr. Sunita Rao',
    department: 'Gynaecology',
    status: 'Ready',
    fileSize: '390 KB PDF',
    summary: 'Folic Acid 5mg OD, Calcium Carbonate 500mg BD, Iron Syrup 10ml',
  },

  // ==========================================
  // MEMBER 3: AARAV CHOUHAN (SON)
  // ==========================================
  {
    id: 'rep-aarav-1',
    reportNo: 'PED-2026-09890',
    patientId: '3',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    title: 'Pediatric Growth & Immunization Card',
    category: 'Prescription',
    date: '15 Sep, 2026',
    doctorName: 'Dr. Ananya Roy',
    department: 'Pediatrics',
    status: 'Ready',
    fileSize: '1.5 MB PDF',
    summary: 'Height: 128cm (75th percentile), Weight: 26kg, MMR booster done',
  },
  {
    id: 'rep-aarav-2',
    reportNo: 'LAB-2026-06910',
    patientId: '3',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    title: 'Routine Blood Routine & Urine Routine',
    category: 'Lab Report',
    date: '18 Jun, 2026',
    doctorName: 'Dr. Chakravarthi',
    department: 'Pediatrics',
    status: 'Ready',
    fileSize: '640 KB PDF',
    summary: 'Hemoglobin: 12.8 g/dL, urine routine clear without protein',
  },
  {
    id: 'rep-aarav-3',
    reportNo: 'RAD-2026-04120',
    patientId: '3',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    title: 'Chest X-Ray PA View (Pediatric)',
    category: 'Radiology',
    date: '02 Jun, 2026',
    doctorName: 'Dr. Ananya Roy',
    department: 'Pediatrics',
    status: 'Ready',
    fileSize: '2.9 MB PDF',
    summary: 'Lungs clear bilaterally, normal bronchovascular markings, no infiltrate',
  },

  // ==========================================
  // MEMBER 4: DEEPAK CHOUHAN (BROTHER)
  // ==========================================
  {
    id: 'rep-deepak-1',
    reportNo: 'RAD-2026-10330',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    title: 'Right Wrist Digital X-Ray (AP/Lat)',
    category: 'Radiology',
    date: '20 Sep, 2026',
    doctorName: 'Dr. Rajesh Iyer',
    department: 'Orthopedics',
    status: 'Ready',
    fileSize: '4.2 MB PDF',
    summary: 'Intact bony architecture, no fracture or articular incongruity',
  },
  {
    id: 'rep-deepak-2',
    reportNo: 'RAD-2026-09570',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    title: 'Abdominal & Pelvic Ultrasound Scan',
    category: 'Radiology',
    date: '02 Jul, 2026',
    doctorName: 'Dr. Amit Bhatnagar',
    department: 'General Surgery',
    status: 'Ready',
    fileSize: '3.1 MB PDF',
    summary: 'Liver normal size & echotexture, gall bladder & kidneys clear',
  },
  {
    id: 'rep-deepak-3',
    reportNo: 'LAB-2026-03120',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    title: 'Comprehensive Metabolic & Liver Panel',
    category: 'Lab Report',
    date: '14 May, 2026',
    doctorName: 'Dr. Rajesh Iyer',
    department: 'Orthopedics',
    status: 'Ready',
    fileSize: '1.0 MB PDF',
    summary: 'SGOT: 24 U/L, SGPT: 28 U/L, Alkaline Phosphatase normal',
  },
  {
    id: 'rep-deepak-4',
    reportNo: 'RX-2026-01890',
    patientId: '4',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    title: 'Orthopedic Post-Sprain Recovery Rx',
    category: 'Prescription',
    date: '01 May, 2026',
    doctorName: 'Dr. Rajesh Iyer',
    department: 'Orthopedics',
    status: 'Ready',
    fileSize: '410 KB PDF',
    summary: 'Aceclofenac 100mg BD, Gel application twice daily, Wrist splint',
  },

  // ==========================================
  // MEMBER 5: CHANDAN CHOUHAN (FATHER · IP PATIENT)
  // ==========================================
  {
    id: 'rep-chandan-1',
    reportNo: 'RAD-2026-10495',
    patientId: '5',
    patientName: 'Chandan Chouhan',
    relation: 'Father',
    title: 'In-Patient High Resolution CT Chest & ECG',
    category: 'Radiology',
    date: '17 Sep, 2026',
    doctorName: 'Dr. Chakravarthi PIS',
    department: 'Cardiology (ICU)',
    status: 'Ready',
    fileSize: '5.4 MB PDF',
    summary: 'Bed 304 - Bilateral lung parenchyma clear, Sinus rhythm, no acute ischemia',
  },
  {
    id: 'rep-chandan-2',
    reportNo: 'LAB-2026-10215',
    patientId: '5',
    patientName: 'Chandan Chouhan',
    relation: 'Father',
    title: 'In-Patient Arterial Blood Gas (ABG) & Cardiac Trop-I',
    category: 'Lab Report',
    date: '14 Sep, 2026',
    doctorName: 'Dr. Ananya Sharma',
    department: 'Pulmonology',
    status: 'Ready',
    fileSize: '1.4 MB PDF',
    summary: 'pO2: 92 mmHg, Troponin-I: < 0.01 ng/mL (Negative for myocardial infarction)',
  },
];

interface ReportsScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onOpenHome?: () => void;
  onOpenVisits?: () => void;
  onOpenPatientList?: (tab?: 'Home' | 'Visits' | 'Reports' | 'Care' | 'IP') => void;
  onOpenCare?: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  userSession,
  onBack,
  onOpenHome,
  onOpenVisits,
  onOpenPatientList,
  onOpenCare,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  // Family members list
  const [members] = useState<PatientMember[]>(INITIAL_PATIENTS);

  // Active Self member dynamically from account manager
  const activeSelfMember = getActiveMember();
  const [selectedMember, setSelectedMember] = useState<PatientMember>(activeSelfMember);

  useEffect(() => {
    setSelectedMember(getActiveMember());
  }, [userSession]);
  const [showMemberSwitchSheet, setShowMemberSwitchSheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Lab Report' | 'Radiology' | 'Prescription'>('All');
  const [reports] = useState<MedicalReportItem[]>(INITIAL_REPORTS);

  // Modal state for View Details bottom slider sheet
  const [selectedReportForDetails, setSelectedReportForDetails] = useState<MedicalReportItem | null>(null);
  const [showReportDetailsSheet, setShowReportDetailsSheet] = useState<boolean>(false);

  // Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Filtered reports for currently selected member & active category filter
  const currentMemberReports = reports
    .filter((rep) => rep.patientId === selectedMember.id)
    .filter((rep) => (activeCategory === 'All' ? true : rep.category === activeCategory));

  // Helper avatar for members
  const getMemberAvatar = (patientId: string) => {
    switch (patientId) {
      case '1':
        return IMAGES.avatarMale;
      case '2':
        return IMAGES.avatarKavita;
      case '3':
        return IMAGES.avatarAarav;
      case '4':
        return IMAGES.avatarDeepak;
      default:
        return IMAGES.avatarMale;
    }
  };

  const handleDownloadReport = (rep: MedicalReportItem) => {
    setLoaderState({
      visible: true,
      message: 'Downloading Medical Report...',
      subtitle: `${rep.reportNo} (${rep.fileSize})`,
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      Alert.alert(
        'Report Downloaded',
        `File ${rep.reportNo}.pdf (${rep.fileSize}) saved to downloads.`
      );
    }, 700);
  };

  const handleViewReport = (rep: MedicalReportItem) => {
    setLoaderState({
      visible: true,
      message: 'Opening Digital Report...',
      subtitle: `Decrypting health record for ${rep.patientName}`,
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      setSelectedReportForDetails(rep);
      setShowReportDetailsSheet(true);
    }, 400);
  };

  const handleHeaderBack = () => {
    if (showReportDetailsSheet) {
      setShowReportDetailsSheet(false);
      return;
    }
    if (showMemberSwitchSheet) {
      setShowMemberSwitchSheet(false);
      return;
    }
    onBack();
  };

  useEffect(() => {
    const onBackPress = () => {
      if (showReportDetailsSheet) {
        setShowReportDetailsSheet(false);
        return true;
      }
      if (showMemberSwitchSheet) {
        setShowMemberSwitchSheet(false);
        return true;
      }
      onBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showReportDetailsSheet, showMemberSwitchSheet, onBack]);

  // Dynamic header section title
  const getSectionTitle = () => {
    switch (activeCategory) {
      case 'Lab Report':
        return `LABORATORY & BLOOD REPORTS (${currentMemberReports.length})`;
      case 'Radiology':
        return `RADIOLOGY & IMAGING SCANS (${currentMemberReports.length})`;
      case 'Prescription':
        return `DOCTOR PRESCRIPTIONS & RX (${currentMemberReports.length})`;
      default:
        return `ALL MEDICAL & DIAGNOSTIC REPORTS (${currentMemberReports.length})`;
    }
  };

  // Category badge style generator
  const getCategoryBadgeStyle = (category: string) => {
    if (isDark) {
      switch (category) {
        case 'Lab Report':
          return { bg: colors.primaryLight, text: colors.accent, border: colors.primary };
        case 'Radiology':
          return { bg: 'rgba(147, 51, 234, 0.25)', text: '#C084FC', border: '#9333EA' };
        case 'Prescription':
          return { bg: 'rgba(16, 185, 129, 0.25)', text: '#34D399', border: '#10B981' };
        default:
          return { bg: colors.primaryLight, text: colors.accent, border: colors.primary };
      }
    }
    switch (category) {
      case 'Lab Report':
        return { bg: colors.primaryLight, text: colors.primary, border: colors.primaryLight };
      case 'Radiology':
        return { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' };
      case 'Prescription':
        return { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' };
      default:
        return { bg: colors.primaryLight, text: colors.primary, border: '#BAE6FD' };
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* APP-THEMED AMBIENT PARENT BACKGROUND LAYER */}
        <View style={styles.ambientBgContainer} pointerEvents="none">
          <View style={[styles.ambientTopGlow, isDark && { backgroundColor: '#1E3A5F', opacity: 0.3 }]} />
          <View style={[styles.ambientMidGlow, isDark && { backgroundColor: '#162032', opacity: 0.2 }]} />
          <Image
            source={IMAGES.leavesWaveBg}
            fadeDuration={0}
            style={[styles.ambientWaveImage, isDark && { opacity: 0.07 }]}
            resizeMode="cover"
          />
        </View>

        {/* 1. TOP HEADER BAR: Blue title "Medical Reports" centered */}
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
              onPress={handleHeaderBack}
              style={[styles.headerBackBtn, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="back" size={isTablet ? 24 : 20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
              Medical Reports
            </Text>
          </View>

          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        {/* MAIN CONTENT AREA */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 20 : 16,
              paddingTop: isTablet ? 16 : 14,
              paddingBottom: insets.bottom + (isTablet ? 135 : 110),
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
              <View style={styles.switchMemberTextCol}>
                <Text style={[styles.switchMemberLabel, { color: colors.textSecondary }]}>
                  CURRENTLY VIEWING
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.switchMemberName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {selectedMember.name}{' '}
                    <Text style={styles.switchMemberRelation}>({selectedMember.relation})</Text>
                  </Text>
                  <View style={[styles.typeBadge, selectedMember.patientType === 'IP' ? styles.ipBadgeBg : styles.opBadgeBg]}>
                    <Text style={[styles.typeBadgeText, selectedMember.patientType === 'IP' ? styles.ipBadgeText : styles.opBadgeText]}>
                      {selectedMember.patientType || 'OP'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Dropdown Button to Switch Member */}
            <TouchableOpacity
              style={styles.switchMemberDropdownBtn}
              onPress={() => setShowMemberSwitchSheet(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.switchMemberDropdownText}>Switch Member</Text>
              <AppIcon name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* CATEGORY FILTER CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {(
              [
                { id: 'All', label: 'All Reports', icon: 'document' },
                { id: 'Lab Report', label: 'Lab Reports', icon: 'flask' },
                { id: 'Radiology', label: 'Radiology Scans', icon: 'pulse' },
                { id: 'Prescription', label: 'Prescriptions', icon: 'pill' },
              ] as const
            ).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    isActive
                      ? styles.filterChipActive
                      : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <AppIcon
                    name={cat.icon}
                    size={14}
                    color={isActive ? '#FFFFFF' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive ? styles.filterChipTextActive : { color: colors.textSecondary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SECTION HEADER */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {getSectionTitle()}
            </Text>
          </View>

          {/* REPORTS LIST FOR THIS MEMBER */}
          {currentMemberReports.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.emptyIconCircle}>
                <AppIcon name="document" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Reports Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No {activeCategory === 'All' ? 'medical' : activeCategory} records found for {selectedMember.name}.
              </Text>
            </View>
          ) : (
            currentMemberReports.map((rep) => {
              const badgeStyle = getCategoryBadgeStyle(rep.category);
              return (
                <View
                  key={rep.id}
                  style={[
                    styles.reportCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  {/* Top Row: Report ID & Category Pill */}
                  <View style={styles.reportCardTopRow}>
                    <View style={styles.reportNoBadge}>
                      <AppIcon name="document" size={14} color={colors.primary} />
                      <Text style={[styles.reportNoText, { color: colors.textPrimary }]} numberOfLines={1}>
                        {rep.reportNo}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.categoryPill,
                        { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
                      ]}
                    >
                      <Text style={[styles.categoryText, { color: badgeStyle.text }]}>{rep.category}</Text>
                    </View>
                  </View>

                  {/* Report Title */}
                  <Text style={[styles.reportTitleText, { color: colors.textPrimary }]}>
                    {rep.title}
                  </Text>

                  {/* Subtitle Meta Strip */}
                  <View style={[styles.metaStripContainer, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF' }]}>
                    <AppIcon name="calendar" size={13} color={colors.primary} />
                    <Text style={[styles.metaSubtitleText, { color: colors.textPrimary }]}>
                      <Text style={styles.metaHighlightName}>{rep.patientName}</Text> · {rep.department} · {rep.date}
                    </Text>
                  </View>

                  {/* Report Findings Summary (AI Generated) */}
                  {rep.summary ? (
                    <View style={[styles.summaryBox, { backgroundColor: isDark ? '#11221D' : '#F0FDF4', borderColor: isDark ? '#059669' : '#BBF7D0' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <AppIcon name="sparkles" size={13} color="#059669" />
                          <Text style={[styles.summaryLabel, { color: '#059669', fontWeight: '800' }]}>SUMMARY</Text>
                        </View>
                        <View style={styles.aiBadgeTag}>
                          <Text style={styles.aiBadgeTagText}>AI Extracted</Text>
                        </View>
                      </View>
                      <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                        {rep.summary}
                      </Text>
                    </View>
                  ) : null}

                  {/* Doctor & File Meta */}
                  <View style={styles.doctorFileRow}>
                    <Text style={[styles.doctorText, { color: colors.textSecondary }]} numberOfLines={1}>
                      Prescribed by: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{rep.doctorName}</Text>
                    </Text>
                    <Text style={styles.fileSizeText}>{rep.fileSize}</Text>
                  </View>

                  {/* Action Buttons: View Report & Download PDF */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={[styles.viewReportBtn, { backgroundColor: isDark ? colors.surfaceVariant : colors.primaryLight, borderColor: '#BAE6FD' }]}
                      onPress={() => handleViewReport(rep)}
                      activeOpacity={0.75}
                    >
                      <AppIcon name="eye" size={14} color={colors.primary} />
                      <Text style={styles.viewReportBtnText} numberOfLines={1}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.downloadPdfBtn}
                      onPress={() => handleDownloadReport(rep)}
                      activeOpacity={0.88}
                    >
                      <AppIcon name="document" size={14} color="#FFFFFF" />
                      <Text style={styles.downloadPdfBtnText} numberOfLines={1}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* FLOATING CURVY BOTTOM NAVIGATION BAR */}
        <View
          style={[
            styles.bottomNavBar,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? colors.border : '#E2E8F0',
              bottom: Math.max(insets.bottom + (isTablet ? 14 : 0), isTablet ? 22 : 10),
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
            <AppIcon name="home" size={isTablet ? 24 : 20} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 12.5 }]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* Tab 2: IP (In-Patients) */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => {
              if (onOpenPatientList) onOpenPatientList();
              else onBack();
            }}
          >
            <AppIcon name="bed-pulse" size={isTablet ? 24 : 20} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 12.5 }]}>
              IP
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Visits */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => {
              if (onOpenVisits) onOpenVisits();
              else onBack();
            }}
          >
            <AppIcon name="calendar" size={isTablet ? 24 : 20} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 12.5 }]}>
              Visits
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Reports (ACTIVE) */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <AppIcon name="document" size={isTablet ? 24 : 20} color={colors.primary} />
            <Text style={[styles.navLabel, { color: colors.primary }, styles.navLabelActive, isTablet && { fontSize: 12.5 }]}>
              Reports
            </Text>
          </TouchableOpacity>

          {/* Tab 5: Care */}
          <TouchableOpacity
            style={styles.navTab}
            activeOpacity={0.7}
            onPress={() => {
              if (onOpenCare) onOpenCare();
            }}
          >
            <AppIcon name="care" size={isTablet ? 24 : 20} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 12.5 }]}>
              Care
            </Text>
          </TouchableOpacity>
        </View>

        {/* SWITCH MEMBER BOTTOM SHEET MODAL */}
        <Modal
          visible={showMemberSwitchSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMemberSwitchSheet(false)}
        >
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={() => setShowMemberSwitchSheet(false)}
          >
            <View
              style={[
                styles.sheetPanel,
                {
                  backgroundColor: colors.surface,
                  paddingBottom: Math.max(insets.bottom + (isTablet ? 28 : 14), isTablet ? 48 : 28),
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.sheetHeader}>
                <View style={styles.sheetDragPill} />
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                  Select Family Member
                </Text>
                <Text style={[styles.sheetSubTitle, { color: colors.textSecondary }]}>
                  Switch member to view their diagnostic reports & prescriptions
                </Text>
              </View>

              <ScrollView style={styles.sheetMemberList} showsVerticalScrollIndicator={false}>
                {members.map((member) => {
                  const isSelected = member.id === selectedMember.id;
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberOptionCard,
                        {
                          backgroundColor: isSelected ? (isDark ? colors.surfaceVariant : '#F0F9FF') : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedMember(member);
                        setShowMemberSwitchSheet(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={getMemberAvatar(member.id)}
                        style={styles.memberOptionAvatar}
                        resizeMode="cover"
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[styles.memberOptionName, { color: colors.textPrimary }]}>
                            {member.name}
                          </Text>
                          <View style={[styles.typeBadge, member.patientType === 'IP' ? styles.ipBadgeBg : styles.opBadgeBg]}>
                            <Text style={[styles.typeBadgeText, member.patientType === 'IP' ? styles.ipBadgeText : styles.opBadgeText]}>
                              {member.patientType || 'OP'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.memberOptionMeta, { color: colors.textSecondary }]}>
                          {member.relation} · UHID: {member.patientNumber}
                        </Text>
                      </View>
                      {isSelected ? (
                        <View style={styles.selectedCheckCircle}>
                          <AppIcon name="check" size={12} color="#FFFFFF" />
                        </View>
                      ) : (
                        <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MEDICAL REPORT DETAILS SLIDER MODAL (SLIDES FROM BOTTOM) */}
        <Modal
          visible={showReportDetailsSheet && !!selectedReportForDetails}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReportDetailsSheet(false)}
        >
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={() => setShowReportDetailsSheet(false)}
          >
            <View
              style={[
                styles.detailsSheetPanel,
                {
                  backgroundColor: colors.surface,
                  paddingBottom: Math.max(insets.bottom + (isTablet ? 28 : 14), isTablet ? 48 : 28),
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {/* Drag Handle */}
              <View style={styles.sheetDragHeader}>
                <View style={styles.sheetDragPill} />
              </View>

              {selectedReportForDetails && (
                <>
                  {/* Top Header Row: Badges & Close X Button */}
                  <View style={styles.detailsHeaderRow}>
                    <View style={styles.detailsBadgeGroup}>
                      <View style={styles.reportNoBadge}>
                        <AppIcon name="document" size={15} color={colors.primary} />
                        <Text style={[styles.reportNoText, { color: colors.textPrimary }]}>
                          {selectedReportForDetails.reportNo}
                        </Text>
                      </View>
                      {(() => {
                        const bStyle = getCategoryBadgeStyle(selectedReportForDetails.category);
                        return (
                          <View
                            style={[
                              styles.categoryPill,
                              { backgroundColor: bStyle.bg, borderColor: bStyle.border },
                            ]}
                          >
                            <Text style={[styles.categoryText, { color: bStyle.text }]}>
                              {selectedReportForDetails.category}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>

                    <TouchableOpacity
                      style={[styles.closeIconBtn, { backgroundColor: isDark ? colors.surfaceVariant : '#EDF5F8' }]}
                      onPress={() => setShowReportDetailsSheet(false)}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="close" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Large Report Title */}
                  <Text style={[styles.detailsTitleText, { color: colors.textPrimary }]}>
                    {selectedReportForDetails.title}
                  </Text>

                  <ScrollView style={styles.detailsScrollView} showsVerticalScrollIndicator={false}>
                    {/* 1. Patient Member Card */}
                    <View style={[styles.detailsSectionBox, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: '#BAE6FD' }]}>
                      <View style={styles.detailsBoxHeader}>
                        <AppIcon name="user" size={15} color={colors.primary} />
                        <Text style={styles.detailsBoxHeaderTitle}>PATIENT INFORMATION</Text>
                      </View>
                      <View style={styles.detailsPatientRow}>
                        <Image
                          source={getMemberAvatar(selectedReportForDetails.patientId)}
                          style={styles.detailsPatientAvatar}
                          resizeMode="cover"
                        />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={[styles.detailsPatientName, { color: colors.textPrimary }]}>
                            {selectedReportForDetails.patientName}
                          </Text>
                          <Text style={[styles.detailsPatientMeta, { color: colors.textSecondary }]}>
                            Relation: <Text style={{ color: colors.primary, fontWeight: '700' }}>{selectedReportForDetails.relation}</Text> · UHID: {selectedMember.patientNumber || 'PAT-2026-8802'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 2. Doctor & Department Info Grid */}
                    <View style={[styles.detailsSectionBox, { backgroundColor: isDark ? '#182435' : '#F8FAFC', borderColor: colors.border }]}>
                      <View style={styles.detailsGridRow}>
                        <View style={styles.detailsGridItem}>
                          <Text style={[styles.detailsMetaLabel, { color: colors.textSecondary }]}>PRESCRIBING DOCTOR</Text>
                          <Text style={[styles.detailsMetaVal, { color: colors.textPrimary }]}>
                            {selectedReportForDetails.doctorName}
                          </Text>
                        </View>
                        <View style={styles.detailsGridItem}>
                          <Text style={[styles.detailsMetaLabel, { color: colors.textSecondary }]}>DEPARTMENT</Text>
                          <Text style={[styles.detailsMetaVal, { color: colors.textPrimary }]}>
                            {selectedReportForDetails.department}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.detailsGridDivider, { backgroundColor: colors.border }]} />

                      <View style={styles.detailsGridRow}>
                        <View style={styles.detailsGridItem}>
                          <Text style={[styles.detailsMetaLabel, { color: colors.textSecondary }]}>REPORT DATE</Text>
                          <Text style={[styles.detailsMetaVal, { color: colors.textPrimary }]}>
                            {selectedReportForDetails.date}
                          </Text>
                        </View>
                        <View style={styles.detailsGridItem}>
                          <Text style={[styles.detailsMetaLabel, { color: colors.textSecondary }]}>REPORT STATUS</Text>
                          <View style={styles.readyStatusBadge}>
                            <AppIcon name="check" size={12} color="#059669" />
                            <Text style={styles.readyStatusText}>Ready & Verified</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* 3. Summary Box (AI Extracted) */}
                    <View style={[styles.detailsSectionBox, { backgroundColor: isDark ? '#11221D' : '#F0FDF4', borderColor: isDark ? '#059669' : '#BBF7D0' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <View style={styles.detailsBoxHeader}>
                          <AppIcon name="sparkles" size={16} color="#059669" />
                          <Text style={[styles.detailsBoxHeaderTitle, { color: '#059669', fontWeight: '800' }]}>SUMMARY</Text>
                        </View>
                        <View style={styles.aiBadgeTagDetails}>
                          <AppIcon name="sparkles" size={12} color="#047857" />
                          <Text style={styles.aiBadgeTagDetailsText}>AI Extracted</Text>
                        </View>
                      </View>
                      <Text style={[styles.detailsSummaryBody, { color: colors.textPrimary }]}>
                        {selectedReportForDetails.summary}
                      </Text>
                    </View>

                    {/* 4. Digital Security Certification Banner */}
                    <View style={styles.securityCertBox}>
                      <AppIcon name="shield-check" size={16} color={colors.primary} />
                      <Text style={styles.securityCertText}>
                        Digitally authenticated record · 256-Bit Encrypted Lab Signature
                      </Text>
                    </View>
                  </ScrollView>

                  {/* Action Buttons Row */}
                  <View style={styles.detailsActionRow}>
                    <TouchableOpacity
                      style={styles.detailsDownloadBtn}
                      onPress={() => {
                        setShowReportDetailsSheet(false);
                        handleDownloadReport(selectedReportForDetails);
                      }}
                      activeOpacity={0.88}
                    >
                      <AppIcon name="document" size={16} color="#FFFFFF" />
                      <Text style={styles.detailsDownloadBtnText}>
                        Download PDF ({selectedReportForDetails.fileSize})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
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
    backgroundColor: '#DEF0FD',
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

  // TOP HEADER BAR
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
    alignItems: 'flex-start',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
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
  },

  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // SWITCH MEMBER CARD
  switchMemberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  switchMemberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  switchMemberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  switchMemberTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  switchMemberLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchMemberName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  switchMemberRelation: {
    color: '#0083B0',
    fontSize: 12,
    fontWeight: '700',
  },
  switchMemberDropdownBtn: {
    backgroundColor: '#DEF0FD',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  switchMemberDropdownText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0083B0',
  },

  // CATEGORY FILTER CHIPS
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  categoryScrollContent: {
    paddingHorizontal: 2,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
  },
  filterChipActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // REPORT CARD
  reportCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  reportCardTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportNoBadge: {
    flex: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  reportNoText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reportTitleText: {
    fontSize: 15.5,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 21,
  },
  metaStripContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    marginBottom: 8,
  },
  metaSubtitleText: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 12,
    fontWeight: '500',
  },
  metaHighlightName: {
    fontWeight: '700',
    color: '#0083B0',
  },
  summaryBox: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  doctorFileRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  doctorText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 12,
    marginRight: 8,
  },
  fileSizeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    flexShrink: 0,
  },
  cardActionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewReportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 8,
  },
  viewReportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0083B0',
  },
  downloadPdfBtn: {
    flex: 1,
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 19,
    gap: 6,
    paddingHorizontal: 8,
  },
  downloadPdfBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  emptyBox: {
    minHeight: 180,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginVertical: 10,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
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

  // BOTTOM SHEET MODAL
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetPanel: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '75%',
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetDragPill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubTitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  sheetMemberList: {
    marginBottom: 10,
  },
  memberOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  memberOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberOptionName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  memberOptionMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  selectedCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // DETAILS SLIDER MODAL STYLES
  detailsSheetPanel: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetDragHeader: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  detailsBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTitleText: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 14,
  },
  detailsScrollView: {
    maxHeight: 380,
  },
  detailsSectionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  detailsBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  detailsBoxHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0083B0',
    letterSpacing: 0.6,
  },
  detailsPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsPatientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  detailsPatientName: {
    fontSize: 15,
    fontWeight: '800',
  },
  detailsPatientMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  detailsGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsGridItem: {
    flex: 1,
  },
  detailsGridDivider: {
    height: 1,
    marginVertical: 10,
  },
  detailsMetaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailsMetaVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  readyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  readyStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  detailsSummaryBody: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  securityCertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 131, 176, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    marginBottom: 14,
  },
  securityCertText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0083B0',
  },
  detailsActionRow: {
    marginTop: 10,
  },
  detailsDownloadBtn: {
    backgroundColor: '#0083B0',
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailsDownloadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 6,
  },
  opBadgeBg: {
    backgroundColor: '#E0F2FE',
  },
  opBadgeText: {
    color: '#0284C7',
  },
  ipBadgeBg: {
    backgroundColor: '#FEF3C7',
  },
  ipBadgeText: {
    color: '#D97706',
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  aiBadgeTagDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  aiBadgeTagDetailsText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.3,
  },
  aiBadgeTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  aiBadgeTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },
});

export default ReportsScreen;
