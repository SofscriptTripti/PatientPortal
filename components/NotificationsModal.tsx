import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import AppIcon from './Icons';
import { useTheme } from './ThemeContext';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface NotificationItem {
  id: string;
  category: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  title: string;
  message: string;
  time: string;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'Appointment',
    badgeColor: '#0284C7',
    badgeBg: '#E0F2FE',
    icon: 'calendar',
    title: 'Appointment Confirmed',
    message: 'Confirmed with Dr. Arvind Sharma (Cardiology) for Today at 4:30 PM.',
    time: '10 mins ago',
  },
  {
    id: 'n2',
    category: 'Lab Report',
    badgeColor: '#16A34A',
    badgeBg: '#DCFCE7',
    icon: 'document',
    title: 'Lab Test Reports Ready',
    message: 'Blood Sugar & Complete Hemogram (CBC) test results are available for Rathi Vijay Sharma.',
    time: '45 mins ago',
  },
  {
    id: 'n3',
    category: 'Prescription',
    badgeColor: '#9333EA',
    badgeBg: '#F3E8FF',
    icon: 'pill',
    title: 'New Doctor Prescription',
    message: 'Dr. Meena Chouhan updated medicine dosage for Kavita Chouhan (Tab Pan-40 & Vitamin D3).',
    time: '2 hours ago',
  },
  {
    id: 'n4',
    category: 'OPD Visit',
    badgeColor: '#2563EB',
    badgeBg: '#DBEAFE',
    icon: 'history',
    title: 'OPD Visit Summary Signed',
    message: 'Dr. R. K. Gupta completed OPD consultation and uploaded visit notes.',
    time: 'Today, 09:15 AM',
  },
  {
    id: 'n5',
    category: 'IP Care',
    badgeColor: '#EA580C',
    badgeBg: '#FFEDD5',
    icon: 'bed-outline',
    title: 'In-Patient Vitals Checked',
    message: 'Nurse station recorded SpO2 98%, BP 120/80 mmHg for Chandan Chouhan (Bed 304 Ward 4A).',
    time: 'Yesterday, 06:30 PM',
  },
  {
    id: 'n6',
    category: 'Bill Payment',
    badgeColor: '#059669',
    badgeBg: '#D1FAE5',
    icon: 'wallet',
    title: 'IP Advance Bill Payment Received',
    message: '₹15,000 payment received successfully against IP Hospitalization (Ref #IP-99482).',
    time: 'Yesterday, 02:15 PM',
  },
  {
    id: 'n7',
    category: 'Lab Test',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    icon: 'flask',
    title: 'Pathology Sample Collected',
    message: 'Blood sample successfully drawn for Aarav Chouhan (Serum Electrolytes & Lipid Profile).',
    time: '17 Sep, 11:00 AM',
  },
  {
    id: 'n8',
    category: 'Medicine Refill',
    badgeColor: '#DC2626',
    badgeBg: '#FEE2E2',
    icon: 'pill',
    title: 'Refill Reminder',
    message: 'Atorvastatin 10mg stock is running low. Re-order online to avoid missing dosage.',
    time: '16 Sep, 08:30 PM',
  },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? colors.border : '#E2E8F0',
            },
            isTablet && { maxWidth: 540, maxHeight: '82%' },
          ]}
        >
          {/* Header Row */}
          <View style={[styles.modalHeader, { borderBottomColor: isDark ? colors.border : '#F1F5F9' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.bellHeaderCircle, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="bell" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Notifications
                </Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  8 Recent Updates & Alerts
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeIconBtn, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable List of 8 Non-Clickable Notifications */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {NOTIFICATIONS.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                ]}
              >
                <View style={styles.itemTopRow}>
                  {/* Category Pill */}
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : item.badgeBg },
                    ]}
                  >
                    <Text style={[styles.categoryBadgeText, { color: isDark ? colors.textPrimary : item.badgeColor }]}>
                      {item.category}
                    </Text>
                  </View>

                  {/* Timestamp */}
                  <View style={styles.timeRow}>
                    <AppIcon name="history" size={12} color={colors.textMuted} />
                    <Text style={[styles.timeText, { color: colors.textMuted }]}>
                      {item.time}
                    </Text>
                  </View>
                </View>

                {/* Main Content Row */}
                <View style={styles.itemBodyRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? colors.surface : colors.primaryLight },
                    ]}
                  >
                    <AppIcon name={item.icon as any} size={20} color={colors.primary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.itemMessage, { color: colors.textSecondary }]}>
                      {item.message}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={[styles.modalFooter, { borderTopColor: isDark ? colors.border : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  bellHeaderCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  notificationItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  itemBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  itemMessage: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '400',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  closeBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default NotificationsModal;
