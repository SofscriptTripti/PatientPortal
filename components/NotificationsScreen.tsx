import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface NotificationsScreenProps {
  userSession: UserSession;
  onBack: () => void;
}

export interface NotificationDetail {
  id: string;
  category: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  title: string;
  message: string;
  time: string;
  patientName?: string;
  refNo?: string;
}

const ALL_NOTIFICATIONS: NotificationDetail[] = [
  {
    id: 'n1',
    category: 'Appointment',
    badgeColor: '#0284C7',
    badgeBg: '#E0F2FE',
    icon: 'calendar',
    title: 'Appointment Confirmed',
    message: 'Confirmed with Dr. Arvind Sharma (Cardiology & Vascular OPD) for Today at 4:30 PM at Main Hospital Tower, Room 204.',
    time: '10 mins ago',
    patientName: 'Rathi Vijay Sharma',
    refNo: 'APT-2026-9901',
  },
  {
    id: 'n2',
    category: 'Lab Report',
    badgeColor: '#16A34A',
    badgeBg: '#DCFCE7',
    icon: 'document',
    title: 'Lab Test Reports Ready',
    message: 'Blood Sugar (FBS & PPBS) & Complete Blood Count (CBC) test results are verified by Pathologist and available for download.',
    time: '45 mins ago',
    patientName: 'Rathi Vijay Sharma',
    refNo: 'LAB-2026-8812',
  },
  {
    id: 'n3',
    category: 'Prescription',
    badgeColor: '#9333EA',
    badgeBg: '#F3E8FF',
    icon: 'pill',
    title: 'New Doctor Prescription',
    message: 'Dr. Meena Chouhan updated dosage instructions for Kavita Chouhan (Tab Pan-40 1-0-0 & Vitamin D3 60K weekly).',
    time: '2 hours ago',
    patientName: 'Kavita Chouhan',
    refNo: 'RX-2026-4409',
  },
  {
    id: 'n4',
    category: 'OPD Visit',
    badgeColor: '#2563EB',
    badgeBg: '#DBEAFE',
    icon: 'history',
    title: 'OPD Visit Summary Signed',
    message: 'Dr. R. K. Gupta completed OPD consultation, attached diagnosis notes and follow-up advice for 30 days.',
    time: 'Today, 09:15 AM',
    patientName: 'Rathi Vijay Sharma',
    refNo: 'VIS-2026-1102',
  },
  {
    id: 'n5',
    category: 'IP Care',
    badgeColor: '#EA580C',
    badgeBg: '#FFEDD5',
    icon: 'bed-outline',
    title: 'In-Patient Vitals Checked',
    message: 'Nurse station recorded SpO2 98%, BP 120/80 mmHg, Pulse 74 bpm for Chandan Chouhan (Bed 304 Ward 4A).',
    time: 'Yesterday, 06:30 PM',
    patientName: 'Chandan Chouhan',
    refNo: 'IP-2026-304',
  },
  {
    id: 'n6',
    category: 'Bill Payment',
    badgeColor: '#059669',
    badgeBg: '#D1FAE5',
    icon: 'wallet',
    title: 'IP Advance Bill Payment Received',
    message: '₹15,000 payment received successfully via UPI towards IP Hospitalization advance account.',
    time: 'Yesterday, 02:15 PM',
    patientName: 'Chandan Chouhan',
    refNo: 'INV-2026-1045',
  },
  {
    id: 'n7',
    category: 'Lab Test',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    icon: 'flask',
    title: 'Pathology Sample Collected',
    message: 'Phlebotomist collected blood sample for Aarav Chouhan (Serum Electrolytes & Lipid Profile) at home.',
    time: '17 Sep, 11:00 AM',
    patientName: 'Aarav Chouhan',
    refNo: 'SMP-2026-5521',
  },
  {
    id: 'n8',
    category: 'Medicine Refill',
    badgeColor: '#DC2626',
    badgeBg: '#FEE2E2',
    icon: 'pill',
    title: 'Refill Reminder',
    message: 'Atorvastatin 10mg stock is running low (3 doses remaining). Click re-order online for free home delivery.',
    time: '16 Sep, 08:30 PM',
    patientName: 'Rathi Vijay Sharma',
    refNo: 'MED-2026-0091',
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  userSession,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* Ambient Healthcare Background Layer */}
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

        {/* TOP HEADER BAR */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: isDark ? colors.border : '#E2E8F0',
            },
            isTablet && { paddingHorizontal: 24, paddingVertical: 16 },
          ]}
        >
          {/* Back Button */}
          <View style={styles.headerSideGroup}>
            <TouchableOpacity
              onPress={onBack}
              style={[styles.headerBackBtn, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="back" size={isTablet ? 24 : 20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Centered Page Title */}
          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, { color: colors.textPrimary }, isTablet && { fontSize: 24 }]}>
              Notifications
            </Text>
          </View>

          {/* Right Indicator Badge */}
          <View style={[styles.headerSideGroup, { alignItems: 'flex-end' }]}>
            <View style={[styles.recentCountBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.recentCountText, { color: colors.primary }]}>
                {ALL_NOTIFICATIONS.length} Recent
              </Text>
            </View>
          </View>
        </View>

        {/* FULL PAGE SCROLLABLE NOTIFICATIONS LIST */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + (isTablet ? 40 : 28) },
            isTablet && { paddingHorizontal: 32, paddingTop: 20 },
          ]}
        >
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Stay updated with your appointments, lab reports, prescriptions, and care activities.
          </Text>

          {ALL_NOTIFICATIONS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                },
                isTablet && { padding: 18, borderRadius: 20 },
              ]}
            >
              {/* Top Row: Category Tag & Timestamp */}
              <View style={styles.cardHeaderRow}>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : item.badgeBg },
                  ]}
                >
                  <Text style={[styles.categoryTagText, { color: isDark ? colors.textPrimary : item.badgeColor }]}>
                    {item.category}
                  </Text>
                </View>

                <View style={styles.timeRow}>
                  <AppIcon name="history" size={13} color={colors.textMuted} />
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {item.time}
                  </Text>
                </View>
              </View>

              {/* Body Content Row */}
              <View style={styles.cardBodyRow}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: colors.primaryLight },
                    isTablet && { width: 48, height: 48, borderRadius: 24 },
                  ]}
                >
                  <AppIcon name={item.icon as any} size={isTablet ? 24 : 20} color={colors.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }, isTablet && { fontSize: 16.5 }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.cardMessage, { color: colors.textSecondary }, isTablet && { fontSize: 13.5 }]}>
                    {item.message}
                  </Text>

                  {/* Metadata Row: Patient & Ref No */}
                  <View style={styles.metaRow}>
                    {item.patientName && (
                      <View style={styles.metaItem}>
                        <AppIcon name="user" size={12} color={colors.primary} />
                        <Text style={[styles.metaText, { color: colors.primary }]}>
                          {item.patientName}
                        </Text>
                      </View>
                    )}
                    {item.refNo && (
                      <Text style={[styles.refText, { color: colors.textMuted }]}>
                        Ref: {item.refNo}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
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

  // HEADER BAR STYLES
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  headerSideGroup: {
    width: 80,
  },
  headerCenterGroup: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleCentered: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  recentCountText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  // CONTENT & CARD STYLES
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 12,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  refText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default NotificationsScreen;
