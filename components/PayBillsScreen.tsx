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
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';

export interface BillItem {
  id: string;
  invoiceNo: string;
  patientName: string;
  relation: string;
  department: string;
  doctorName: string;
  dateStr: string;
  timeStr: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  dueDate?: string;
  breakdown: {
    consultation: number;
    diagnostics?: number;
    pharmacy?: number;
    payerDeduction?: number;
    gst: number;
  };
}

const INITIAL_BILLS: BillItem[] = [
  {
    id: 'bill-1',
    invoiceNo: 'INV-2026-0891',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    department: 'Pediatrics OPD',
    doctorName: 'Dr. Ananya Roy',
    dateStr: '15-09-2026',
    timeStr: '10:30 AM',
    amount: 1200,
    status: 'UNPAID',
    dueDate: 'Due Today',
    breakdown: {
      consultation: 500,
      diagnostics: 700,
      gst: 0,
    },
  },
  {
    id: 'bill-2',
    invoiceNo: 'INV-2026-0842',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    department: 'Cardiology Clinic',
    doctorName: 'Dr. Priya Nair',
    dateStr: '12-09-2026',
    timeStr: '11:15 AM',
    amount: 800,
    status: 'UNPAID',
    dueDate: 'Due Soon',
    breakdown: {
      consultation: 500,
      pharmacy: 300,
      gst: 0,
    },
  },
  {
    id: 'bill-3',
    invoiceNo: 'INV-2026-0718',
    patientName: 'Rathi Vijay Sharma',
    relation: 'Self',
    department: 'General Medicine',
    doctorName: 'Dr. Chakravarthi',
    dateStr: '01-09-2026',
    timeStr: '09:45 AM',
    amount: 600,
    status: 'PAID',
    breakdown: {
      consultation: 600,
      gst: 0,
    },
  },
  {
    id: 'bill-4',
    invoiceNo: 'INV-2026-0652',
    patientName: 'Deepak Chouhan',
    relation: 'Brother',
    department: 'Orthopedics Clinic',
    doctorName: 'Dr. S. K. Gupta',
    dateStr: '22-08-2026',
    timeStr: '03:30 PM',
    amount: 1500,
    status: 'PAID',
    breakdown: {
      consultation: 500,
      diagnostics: 1000,
      gst: 0,
    },
  },
  {
    id: 'bill-5',
    invoiceNo: 'INV-2026-0599',
    patientName: 'Kavita Chouhan',
    relation: 'Wife',
    department: 'Diagnostic Lab',
    doctorName: 'Dr. Meenakshi Sundaram',
    dateStr: '10-08-2026',
    timeStr: '08:00 AM',
    amount: 950,
    status: 'PAID',
    breakdown: {
      consultation: 0,
      diagnostics: 950,
      gst: 0,
    },
  },
  {
    id: 'bill-6',
    invoiceNo: 'INV-2026-0412',
    patientName: 'Aarav Chouhan',
    relation: 'Son',
    department: 'Pediatrics Vaccination',
    doctorName: 'Dr. Ananya Roy',
    dateStr: '15-07-2026',
    timeStr: '11:00 AM',
    amount: 450,
    status: 'PAID',
    breakdown: {
      consultation: 300,
      pharmacy: 150,
      gst: 0,
    },
  },
];

interface PayBillsScreenProps {
  userSession: UserSession;
  onBack: () => void;
}

export const PayBillsScreen: React.FC<PayBillsScreenProps> = ({
  userSession,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  // Bills list state
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billToPay, setBillToPay] = useState<BillItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM'>('GPAY');

  // Loader & Success modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paidReceiptInfo, setPaidReceiptInfo] = useState<{
    amount: number;
    invoiceNo: string;
    paidFor: string;
    txnId: string;
  } | null>(null);

  // Compute outstanding dues
  const unpaidBills = bills.filter((b) => b.status === 'UNPAID');
  const totalOutstanding = unpaidBills.reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered bills list by member name search & status filter
  const displayedBills = bills.filter((b) => {
    // 1. Search filter by member name, relation, invoiceNo, or doctorName
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matches =
        b.patientName.toLowerCase().includes(q) ||
        b.relation.toLowerCase().includes(q) ||
        b.invoiceNo.toLowerCase().includes(q) ||
        b.doctorName.toLowerCase().includes(q);
      if (!matches) return false;
    }
    // 2. Status filter
    if (activeFilter === 'UNPAID') return b.status === 'UNPAID';
    if (activeFilter === 'PAID') return b.status === 'PAID';
    return true;
  });

  // Open payment sheet for all unpaid bills or single bill
  const handleOpenPay = (bill?: BillItem) => {
    if (bill) {
      setBillToPay(bill);
    } else {
      setBillToPay(null); // Paying all outstanding bills
    }
    setShowPaymentModal(true);
  };

  // Process payment
  const handleExecutePayment = () => {
    setShowPaymentModal(false);
    setIsProcessing(true);

    const amountToClear = billToPay ? billToPay.amount : totalOutstanding;
    const invoiceLabel = billToPay ? billToPay.invoiceNo : 'Consolidated Invoices';
    const paidForName = billToPay ? billToPay.patientName : 'All Pending Dues';
    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      setIsProcessing(false);

      // Update state: mark bills as PAID
      if (billToPay) {
        setBills((prev) =>
          prev.map((b) => (b.id === billToPay.id ? { ...b, status: 'PAID' } : b))
        );
      } else {
        // Clear all unpaid
        setBills((prev) => prev.map((b) => ({ ...b, status: 'PAID' })));
      }

      setPaidReceiptInfo({
        amount: amountToClear,
        invoiceNo: invoiceLabel,
        paidFor: paidForName,
        txnId,
      });
      setShowSuccessModal(true);
    }, 1200);
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

        {/* TOP HEADER: Centered Blue title, Curvy bottom line, no secondary text */}
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
          {/* Left Back Button */}
          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]}>
            <TouchableOpacity
              onPress={onBack}
              style={[
                styles.headerBackBtn,
                isDark && { backgroundColor: colors.borderLight },
                isTablet && { width: 42, height: 42, borderRadius: 21 },
              ]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon name="back" size={20} color="#0083B0" />
            </TouchableOpacity>
          </View>

          {/* Centered Blue Header Title: Bill Details */}
          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, isTablet && { fontSize: 24 }]}>
              Bill Details
            </Text>
          </View>

          {/* Right spacer for symmetric balance */}
          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        {/* SCROLLABLE BILLS CONTENT */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 24 : 16,
              paddingTop: 14,
              paddingBottom: insets.bottom + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ========================================================
              1. OUTSTANDING BILLS HERO CARD (WITH CLEAR PAYMENT OPTION)
              ======================================================== */}
          <View
            style={[
              styles.outstandingCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isTablet && { padding: 22 },
            ]}
          >
            {/* 1st: Show Header "Outstanding Bill" (Big without any border in Black Text) */}
            <Text
              style={[
                styles.outstandingBigHeader,
                { color: colors.textPrimary },
                isTablet && { fontSize: 26 },
              ]}
            >
              Outstanding Bill
            </Text>

            {/* Amount: little 1 step small font as outstanding Bill but in red color */}
            <Text style={[styles.outstandingAmountRed, isTablet && { fontSize: 22 }]}>
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </Text>

            {/* Pending item details */}
            {totalOutstanding > 0 ? (
              <View style={styles.pendingItemsList}>
                <View style={[styles.pendingListDivider, { backgroundColor: colors.borderLight }]} />
                <Text style={[styles.pendingListTitle, { color: colors.textSecondary }]}>PENDING ITEM DETAILS:</Text>
                {unpaidBills.map((item) => (
                  <View key={item.id} style={[styles.pendingItemRow, { borderBottomColor: colors.borderLight }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pendingItemPatient, { color: colors.textPrimary }]}>
                        {item.patientName} <Text style={[styles.relationTag, { color: isDark ? colors.accent : '#0083B0' }]}>({item.relation})</Text>
                      </Text>
                      <Text style={[styles.pendingItemService, { color: colors.textSecondary }]}>
                        {item.department} • {item.invoiceNo}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      <Text style={styles.pendingItemAmountRed}>₹{item.amount.toLocaleString('en-IN')}</Text>
                    </View>
                  </View>
                ))}

                {/* Then in last of section Show "Clear Payment" option in right side bottom (Small button) */}
                <View style={styles.clearPaymentBottomRow}>
                  <TouchableOpacity
                    style={styles.clearPaymentBtnSmall}
                    onPress={() => handleOpenPay()}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.clearPaymentBtnSmallText}>Clear Payment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.allClearNoticeBox}>
                <AppIcon name="shield-check" size={18} color="#059669" />
                <Text style={styles.allClearNoticeText}>
                  Your account is fully up-to-date with hospital billing.
                </Text>
              </View>
            )}
          </View>

          {/* ========================================================
              MEMBER SEARCH BAR (Just Above All Bills, Unpaid, Paid Toggle)
             ======================================================== */}
          <View style={[styles.searchBoxContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppIcon name="search" size={17} color="#0083B0" />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search Name..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.searchClearBtn}
              >
                <AppIcon name="close" size={15} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* ========================================================
              2. FILTER TABS ROW: ALL | UNPAID | PAID
             ======================================================== */}
          <View style={[styles.filterTabsContainer, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'ALL' && styles.filterTabActive]}
              onPress={() => setActiveFilter('ALL')}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: activeFilter === 'ALL' ? '#0083B0' : colors.textSecondary },
                  activeFilter === 'ALL' && styles.filterTabTextActive,
                ]}
              >
                All Bills ({bills.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'UNPAID' && styles.filterTabActive]}
              onPress={() => setActiveFilter('UNPAID')}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: activeFilter === 'UNPAID' ? '#0083B0' : colors.textSecondary },
                  activeFilter === 'UNPAID' && styles.filterTabTextActive,
                ]}
              >
                Unpaid ({unpaidBills.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'PAID' && styles.filterTabActive]}
              onPress={() => setActiveFilter('PAID')}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: activeFilter === 'PAID' ? '#0083B0' : colors.textSecondary },
                  activeFilter === 'PAID' && styles.filterTabTextActive,
                ]}
              >
                Paid ({bills.length - unpaidBills.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ========================================================
              3. BILLS DETAILS LIST WITH STATUS & BREAKDOWN
             ======================================================== */}
          <View style={styles.billsListSection}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.textSecondary }]}>BILLS & INVOICE HISTORY</Text>

            {displayedBills.map((bill) => {
              const isExpanded = expandedBillId === bill.id;
              const isPaid = bill.status === 'PAID';

              return (
                <View key={bill.id} style={[styles.billCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {/* Card Header: Invoice & Status Badge */}
                  <View style={styles.billCardHeader}>
                    <View style={styles.invoiceNoGroup}>
                      <AppIcon name="document" size={17} color="#0083B0" />
                      <Text style={[styles.invoiceNoText, { color: colors.textPrimary }]}>{bill.invoiceNo}</Text>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        isPaid ? styles.statusBadgePaid : styles.statusBadgeUnpaid,
                      ]}
                    >
                      <AppIcon
                        name={isPaid ? 'check' : 'clock'}
                        size={12}
                        color={isPaid ? '#059669' : '#DC2626'}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isPaid ? styles.statusBadgeTextPaid : styles.statusBadgeTextUnpaid,
                        ]}
                      >
                        {bill.status}
                      </Text>
                    </View>
                  </View>

                  {/* Patient & Service Details */}
                  <View style={styles.billCardBody}>
                    <View style={styles.billInfoRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.billPatientName, { color: colors.textPrimary }]}>
                          {bill.patientName}{' '}
                          <Text style={styles.billRelationText}>({bill.relation})</Text>
                        </Text>
                        <Text style={[styles.billDeptText, { color: colors.textSecondary }]}>{bill.department}</Text>
                        <Text style={[styles.billDoctorText, { color: colors.textSecondary }]}>Doctor: {bill.doctorName}</Text>
                      </View>

                      <View style={styles.billAmountRightCol}>
                        <Text style={[styles.billAmountLabel, { color: colors.textSecondary }]}>Total Due</Text>
                        <Text style={[styles.billAmountVal, isPaid && { color: colors.textPrimary }]}>
                          ₹{bill.amount.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    {/* Date and Time Row */}
                    <View style={styles.billMetaRow}>
                      <View style={styles.metaItem}>
                        <AppIcon name="calendar" size={13} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{bill.dateStr}</Text>
                      </View>
                      <View style={[styles.metaDivider, { backgroundColor: colors.divider }]} />
                      <View style={styles.metaItem}>
                        <AppIcon name="clock" size={13} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{bill.timeStr}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Expandable Breakdown Drawer */}
                  {isExpanded && (
                    <View style={[styles.breakdownDrawer, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                      <Text style={[styles.breakdownHeader, { color: colors.textSecondary }]}>ITEMIZED BILL BREAKDOWN</Text>

                      <View style={styles.breakdownRow}>
                        <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>OPD Consultation Fee</Text>
                        <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>₹{bill.breakdown.consultation}</Text>
                      </View>

                      {bill.breakdown.diagnostics ? (
                        <View style={styles.breakdownRow}>
                          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Diagnostics & Lab Tests</Text>
                          <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>₹{bill.breakdown.diagnostics}</Text>
                        </View>
                      ) : null}

                      {bill.breakdown.pharmacy ? (
                        <View style={styles.breakdownRow}>
                          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Hospital Pharmacy Dispense</Text>
                          <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>₹{bill.breakdown.pharmacy}</Text>
                        </View>
                      ) : null}

                      <View style={[styles.breakdownDivider, { backgroundColor: colors.divider }]} />

                      <View style={styles.breakdownRow}>
                        <Text style={[styles.breakdownTotalLabel, { color: colors.textPrimary }]}>Net Amount</Text>
                        <Text style={[styles.breakdownTotalValue, { color: colors.textPrimary }]}>₹{bill.amount}</Text>
                      </View>
                    </View>
                  )}

                  {/* Card Action Footer */}
                  <View style={[styles.billCardFooter, { borderTopColor: colors.divider }]}>
                    <TouchableOpacity
                      style={styles.toggleBreakdownBtn}
                      onPress={() => setExpandedBillId(isExpanded ? null : bill.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.toggleBreakdownText}>
                        {isExpanded ? 'Hide Details' : 'View Breakdown'}
                      </Text>
                      <AppIcon
                        name={isExpanded ? 'chevron-down' : 'chevron-right'}
                        size={14}
                        color="#0083B0"
                      />
                    </TouchableOpacity>

                    {isPaid ? (
                      <TouchableOpacity
                        style={styles.receiptActionBtn}
                        onPress={() =>
                          Alert.alert(
                            'Receipt Downloaded',
                            `Tax Invoice ${bill.invoiceNo} for ${bill.patientName} (₹${bill.amount}) has been saved to your digital records.`
                          )
                        }
                        activeOpacity={0.75}
                      >
                        <AppIcon name="document" size={14} color="#0083B0" />
                        <Text style={styles.receiptActionText}>Download Receipt</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* ========================================================
            PAYMENT MODAL SHEET (CLEAR OUTSTANDING PAYMENT)
           ======================================================== */}
        <Modal
          visible={showPaymentModal}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                isTablet && { width: 480 },
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>Clear Hospital Bill</Text>
                  <Text style={[styles.modalHeaderSub, { color: colors.textSecondary }]}>Bethany Healthcare Gateway</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPaymentModal(false)}
                  style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceVariant }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AppIcon name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Amount to Pay Summary */}
              <View
                style={[
                  styles.paySummaryBox,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#DEF0FD',
                    borderColor: isDark ? colors.border : '#BAE6FD',
                  },
                ]}
              >
                <Text style={[styles.paySummaryLabel, { color: isDark ? colors.accent : '#0369A1' }]}>
                  {billToPay
                    ? `Payment for ${billToPay.patientName} (${billToPay.invoiceNo})`
                    : `Consolidated Outstanding Balance (${unpaidBills.length} Bills)`}
                </Text>
                <Text style={[styles.paySummaryAmount, { color: isDark ? colors.accent : '#0083B0' }]}>
                  ₹{(billToPay ? billToPay.amount : totalOutstanding).toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Payment Methods Selection */}
              <Text style={[styles.methodSectionHeader, { color: colors.textSecondary }]}>SELECT PAYMENT METHOD</Text>

              {/* Option 1: Instant UPI */}
              <TouchableOpacity
                style={[
                  styles.methodOptionCard,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                  selectedMethod === 'UPI' && (isDark ? { backgroundColor: '#1E3A5F', borderColor: '#38BDF8' } : styles.methodOptionCardSelected),
                ]}
                onPress={() => setSelectedMethod('UPI')}
                activeOpacity={0.8}
              >
                <View style={styles.methodRadioRow}>
                  <View style={[styles.radioCircle, { borderColor: colors.border }, selectedMethod === 'UPI' && styles.radioCircleActive]}>
                    {selectedMethod === 'UPI' && <View style={styles.radioInnerDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.methodTitle, { color: colors.textPrimary }]}>UPI Instant Payment</Text>
                    <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>Google Pay, PhonePe, Paytm, or UPI ID</Text>
                  </View>
                  <AppIcon name="shield-check" size={20} color={isDark ? colors.accent : '#0083B0'} />
                </View>

                {/* Sub UPI apps selection */}
                {selectedMethod === 'UPI' && (
                  <View style={[styles.upiAppsRow, { borderTopColor: colors.border }]}>
                    {(['GPAY', 'PHONEPE', 'PAYTM'] as const).map((app) => (
                      <TouchableOpacity
                        key={app}
                        style={[
                          styles.upiAppPill,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          selectedUpiApp === app && styles.upiAppPillActive,
                        ]}
                        onPress={() => setSelectedUpiApp(app)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.upiAppPillText,
                            { color: colors.textSecondary },
                            selectedUpiApp === app && styles.upiAppPillTextActive,
                          ]}
                        >
                          {app === 'GPAY' ? 'Google Pay' : app === 'PHONEPE' ? 'PhonePe' : 'Paytm'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </TouchableOpacity>

              {/* Option 2: Credit / Debit Card */}
              <TouchableOpacity
                style={[
                  styles.methodOptionCard,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                  selectedMethod === 'CARD' && (isDark ? { backgroundColor: '#1E3A5F', borderColor: '#38BDF8' } : styles.methodOptionCardSelected),
                ]}
                onPress={() => setSelectedMethod('CARD')}
                activeOpacity={0.8}
              >
                <View style={styles.methodRadioRow}>
                  <View style={[styles.radioCircle, { borderColor: colors.border }, selectedMethod === 'CARD' && styles.radioCircleActive]}>
                    {selectedMethod === 'CARD' && <View style={styles.radioInnerDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.methodTitle, { color: colors.textPrimary }]}>Credit / Debit Card</Text>
                    <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>Visa, MasterCard, RuPay, Amex</Text>
                  </View>
                  <AppIcon name="wallet-outline" size={20} color={isDark ? colors.accent : '#0083B0'} />
                </View>
              </TouchableOpacity>

              {/* Option 3: Net Banking */}
              <TouchableOpacity
                style={[
                  styles.methodOptionCard,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                  selectedMethod === 'NETBANKING' && (isDark ? { backgroundColor: '#1E3A5F', borderColor: '#38BDF8' } : styles.methodOptionCardSelected),
                ]}
                onPress={() => setSelectedMethod('NETBANKING')}
                activeOpacity={0.8}
              >
                <View style={styles.methodRadioRow}>
                  <View style={[styles.radioCircle, { borderColor: colors.border }, selectedMethod === 'NETBANKING' && styles.radioCircleActive]}>
                    {selectedMethod === 'NETBANKING' && <View style={styles.radioInnerDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.methodTitle, { color: colors.textPrimary }]}>Net Banking</Text>
                    <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>HDFC, SBI, ICICI, Axis & all major banks</Text>
                  </View>
                  <AppIcon name="hospital" size={20} color={isDark ? colors.accent : '#0083B0'} />
                </View>
              </TouchableOpacity>

              {/* Confirm and Pay Button */}
              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={handleExecutePayment}
                activeOpacity={0.88}
              >
                <Text style={styles.confirmPayBtnText}>
                  Pay ₹{(billToPay ? billToPay.amount : totalOutstanding).toLocaleString('en-IN')} Securely
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            PAYMENT SUCCESS CONFIRMATION MODAL
           ======================================================== */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                isTablet && { width: 440 },
                {
                  alignItems: 'center',
                  paddingVertical: 28,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <View style={styles.successIconCircle}>
                <AppIcon name="check" size={32} color="#059669" />
              </View>

              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Payment Successful!</Text>
              <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                Your payment of ₹{paidReceiptInfo?.amount.toLocaleString('en-IN')} has been received and verified by Bethany Healthcare billing counter.
              </Text>

              {/* Receipt Details Box */}
              <View
                style={[
                  styles.receiptBox,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Transaction ID</Text>
                  <Text style={[styles.receiptVal, { color: colors.textPrimary }]}>{paidReceiptInfo?.txnId}</Text>
                </View>
                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Invoice Covered</Text>
                  <Text style={[styles.receiptVal, { color: colors.textPrimary }]}>{paidReceiptInfo?.invoiceNo}</Text>
                </View>
                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Cleared For</Text>
                  <Text style={[styles.receiptVal, { color: colors.textPrimary }]}>{paidReceiptInfo?.paidFor}</Text>
                </View>
                <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>Status</Text>
                  <Text style={[styles.receiptVal, { color: '#059669', fontWeight: '800' }]}>PAID</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeSuccessBtn}
                onPress={() => setShowSuccessModal(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.closeSuccessBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* UNIVERSAL LOADER */}
        <UniversalLoader
          visible={isProcessing}
          message="Processing Payment..."
          subtitle="Connecting to secure hospital payment gateway"
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

  // AMBIENT BACKGROUND
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

  // 2. OUTSTANDING BILLS HERO CARD
  outstandingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  outstandingBigHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F253E',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  outstandingAmountRed: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  allClearNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  allClearNoticeText: {
    fontSize: 12.5,
    color: '#15803D',
    fontWeight: '600',
  },
  pendingItemsList: {
    marginTop: 4,
  },
  pendingListDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  pendingListTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pendingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pendingItemPatient: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F253E',
  },
  relationTag: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  pendingItemService: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  pendingItemAmountRed: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  clearPaymentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  clearPaymentBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0083B0',
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clearPaymentBtnSmallText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // SEARCH BOX
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    marginLeft: 8,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 3,
    marginLeft: 6,
  },

  // 3. FILTER TABS
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: '#0083B0',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 4. BILLS DETAILS LIST
  billsListSection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  billCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  invoiceNoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invoiceNoText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F253E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusBadgePaid: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeUnpaid: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statusBadgeTextPaid: {
    color: '#059669',
  },
  statusBadgeTextUnpaid: {
    color: '#DC2626',
  },
  billCardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  billInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  billPatientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F253E',
  },
  billRelationText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  billDeptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0083B0',
    marginTop: 2,
  },
  billDoctorText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  billAmountRightCol: {
    alignItems: 'flex-end',
  },
  billAmountLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  billAmountVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
    marginTop: 2,
  },
  billMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
  },

  // BreakDown Drawer
  breakdownDrawer: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  breakdownHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 12.5,
    color: '#475569',
  },
  breakdownValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F253E',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  breakdownTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F253E',
  },
  breakdownTotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0083B0',
  },

  // Card Footer Actions
  billCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleBreakdownText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0083B0',
  },
  receiptActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  receiptActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0083B0',
  },
  payCardBtn: {
    backgroundColor: '#0083B0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  payCardBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // PAYMENT MODAL SHEET
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    padding: 20,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F253E',
  },
  modalHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paySummaryBox: {
    backgroundColor: '#DEF0FD',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  paySummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    textAlign: 'center',
  },
  paySummaryAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0083B0',
    marginTop: 4,
  },
  methodSectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  methodOptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  methodOptionCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0083B0',
  },
  methodRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#0083B0',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0083B0',
  },
  methodTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F253E',
  },
  methodSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  upiAppsRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  upiAppPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  upiAppPillActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  upiAppPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  upiAppPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmPayBtn: {
    backgroundColor: '#0083B0',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmPayBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // SUCCESS CONFIRMATION MODAL
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F253E',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  receiptLabel: {
    fontSize: 12.5,
    color: '#64748B',
  },
  receiptVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F253E',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  closeSuccessBtn: {
    backgroundColor: '#0083B0',
    borderRadius: 14,
    width: '100%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSuccessBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default PayBillsScreen;
