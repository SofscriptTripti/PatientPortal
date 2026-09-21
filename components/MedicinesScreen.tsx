import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  Dimensions,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession, PatientMember } from './types';
import { useTheme } from './ThemeContext';
import UniversalLoader from './UniversalLoader';
import IMAGES from './imageAssets';
import { INITIAL_PATIENTS } from './mockData';
import { switchActiveAccount, getActiveMember } from './accountManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MedicinesScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onAddHealthPoints?: (points: number) => void;
}

// Data models
export interface PrescribedMedicine {
  id: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  date: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    qty: number;
    price: number;
  }[];
  status: string;
  orderStatus: 'pending' | 'booked';
  pharmacyNote: string;
}

export interface SelfOrderedMedicine {
  id: string;
  patientId: string;
  orderId: string;
  orderDate: string;
  items: {
    name: string;
    qty: number;
    price: number;
    category: string;
  }[];
  totalAmount: number;
  paymentMethod: 'Pay at Counter' | 'Paid Online';
  status: 'Package Ready for Pickup' | 'Completed';
  pickupLocation: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: 'First Aid and Supplies' | 'Personal care and products' | 'Medical Devices' | 'Vitamins and Supplements' | 'Medicines';
  price: number;
  unit: string;
  inStock?: boolean;
  requiresPrescription?: boolean;
}

// Initial Mock Data
const INITIAL_PRESCRIBED: PrescribedMedicine[] = [
  {
    id: 'pm-1',
    patientId: '1',
    doctorName: 'Dr. Ananya Sharma',
    specialty: 'Cardiologist',
    date: '14 Sep 2026',
    medicines: [
      { name: 'Telmisartan 40mg Tablet', dosage: '40mg', frequency: '1-0-0 (Morning After Breakfast)', duration: '30 Days', qty: 30, price: 180 },
      { name: 'Atorvastatin 10mg Tablet', dosage: '10mg', frequency: '0-0-1 (Night After Dinner)', duration: '30 Days', qty: 30, price: 210 },
    ],
    status: 'Pending Order',
    orderStatus: 'pending',
    pharmacyNote: 'Prescription issued. Click Order Prescription to book for pharmacy pickup.',
  },
  {
    id: 'pm-2',
    patientId: '1',
    doctorName: 'Dr. Rajesh Kumar',
    specialty: 'General Physician',
    date: '02 Sep 2026',
    medicines: [
      { name: 'Amoxicillin 500mg Capsule', dosage: '500mg', frequency: '1-0-1 (After Food)', duration: '5 Days', qty: 10, price: 95 },
      { name: 'Paracetamol 650mg Tablet', dosage: '650mg', frequency: '1-1-1 (As Needed)', duration: '5 Days', qty: 15, price: 45 },
    ],
    status: 'Booked & Ready for Pickup',
    orderStatus: 'booked',
    pharmacyNote: 'Package prepared at Hospital Main Pharmacy Counter 2',
  },
  {
    id: 'pm-3',
    patientId: '2',
    doctorName: 'Dr. Sunita Rao',
    specialty: 'Gynecologist',
    date: '10 Sep 2026',
    medicines: [
      { name: 'Calcium + Vitamin D3 Tablets', dosage: '500mg', frequency: '1-0-0 (After Breakfast)', duration: '30 Days', qty: 30, price: 290 },
      { name: 'Iron & Folic Acid Capsules', dosage: '100mg', frequency: '0-0-1 (Night)', duration: '30 Days', qty: 30, price: 230 },
    ],
    status: 'Pending Order',
    orderStatus: 'pending',
    pharmacyNote: 'Prescription issued. Click Order Prescription to book for pharmacy pickup.',
  },
  {
    id: 'pm-4',
    patientId: '5',
    doctorName: 'Dr. Chakravarthi PIS',
    specialty: 'Cardiologist (ICU / Ward 4A)',
    date: '17 Sep 2026',
    medicines: [
      { name: 'Clopidogrel 75mg Tablet', dosage: '75mg', frequency: '1-0-0 (Morning After Breakfast)', duration: '30 Days', qty: 30, price: 310 },
      { name: 'Atorvastatin 40mg Tablet', dosage: '40mg', frequency: '0-0-1 (Night After Dinner)', duration: '30 Days', qty: 30, price: 340 },
      { name: 'Pantoprazole 40mg Injection / Tab', dosage: '40mg', frequency: '1-0-0 (Before Breakfast)', duration: '14 Days', qty: 14, price: 140 },
    ],
    status: 'Pending Order',
    orderStatus: 'pending',
    pharmacyNote: 'In-Patient ICU round prescription for Chandan Chouhan (Bed 304).',
  },
];

const INITIAL_SELF_ORDERS: SelfOrderedMedicine[] = [
  {
    id: 'so-101',
    patientId: '1',
    orderId: 'MED-94821',
    orderDate: '16 Sep 2026',
    items: [
      { name: 'Multivitamin Complex Capsules', qty: 1, price: 340, category: 'Vitamins and Supplements' },
      { name: 'Digital Blood Pressure Monitor', qty: 1, price: 1450, category: 'Medical Devices' },
    ],
    totalAmount: 1790,
    paymentMethod: 'Pay at Counter',
    status: 'Package Ready for Pickup',
    pickupLocation: 'Hospital Pharmacy, Ground Floor (Main Block)',
  },
];

const CATALOG_ITEMS: CatalogItem[] = [
  // First Aid and Supplies
  { id: 'cat-1', name: 'Waterproof Bandages (Pack of 20)', category: 'First Aid and Supplies', price: 85, unit: 'Pack of 20' },
  { id: 'cat-2', name: 'Antiseptic Solution 100ml', category: 'First Aid and Supplies', price: 65, unit: '100ml Bottle' },
  { id: 'cat-3', name: 'Sterile Cotton Roll 100g', category: 'First Aid and Supplies', price: 50, unit: '100g Roll' },

  // Personal care and products
  { id: 'cat-4', name: 'Gentle Hand Sanitizer 500ml', category: 'Personal care and products', price: 150, unit: '500ml Pump' },
  { id: 'cat-5', name: 'Moisturizing Skin Lotion 200ml', category: 'Personal care and products', price: 220, unit: '200ml Bottle' },
  { id: 'cat-6', name: 'Antibacterial Body Wash', category: 'Personal care and products', price: 195, unit: '250ml' },

  // Medical Devices
  { id: 'cat-7', name: 'Digital Blood Pressure Monitor', category: 'Medical Devices', price: 1450, unit: '1 Unit' },
  { id: 'cat-8', name: 'Infrared Forehead Thermometer', category: 'Medical Devices', price: 890, unit: '1 Unit' },
  { id: 'cat-9', name: 'Pulse Oximeter Fingertip', category: 'Medical Devices', price: 650, unit: '1 Unit' },

  // Vitamins and Supplements
  { id: 'cat-10', name: 'Vitamin C 1000mg Chewable (30 Tabs)', category: 'Vitamins and Supplements', price: 180, unit: '30 Tablets' },
  { id: 'cat-11', name: 'Calcium + Vitamin D3 Tablets (60s)', category: 'Vitamins and Supplements', price: 290, unit: '60 Tablets' },
  { id: 'cat-12', name: 'Omega 3 Fish Oil 1000mg Softgels', category: 'Vitamins and Supplements', price: 450, unit: '60 Softgels' },

  // Medicines
  { id: 'cat-13', name: 'Paracetamol 650mg Tablets', category: 'Medicines', price: 35, unit: 'Strip of 15' },
  { id: 'cat-14', name: 'Cough & Throat Syrup 100ml', category: 'Medicines', price: 110, unit: '100ml Bottle' },
  { id: 'cat-15', name: 'Antacid Relief Chewable Tablets', category: 'Medicines', price: 75, unit: 'Strip of 10' },
  { id: 'cat-16', name: 'Pain Relief Gel Spray 50g', category: 'Medicines', price: 140, unit: '50g Spray' },
  { id: 'cat-17', name: 'Telmisartan 40mg Tablet', category: 'Medicines', price: 180, unit: '30 Tablets' },
  { id: 'cat-18', name: 'Atorvastatin 10mg Tablet', category: 'Medicines', price: 210, unit: '30 Tablets' },
  { id: 'cat-19', name: 'Amoxicillin 500mg Capsule', category: 'Medicines', price: 95, unit: '10 Capsules' },
  { id: 'cat-20', name: 'Iron & Folic Acid Capsules', category: 'Medicines', price: 230, unit: '30 Capsules' },
];

export default function MedicinesScreen({
  userSession,
  onBack,
  onAddHealthPoints,
}: MedicinesScreenProps) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  // Active Member & Switch Member State
  const [members] = useState<PatientMember[]>(INITIAL_PATIENTS);
  const [selectedMember, setSelectedMember] = useState<PatientMember>(getActiveMember());
  const [showMemberSwitchSheet, setShowMemberSwitchSheet] = useState<boolean>(false);

  useEffect(() => {
    setSelectedMember(getActiveMember());
  }, [userSession]);

  // Screen Tab State
  const [activeTab, setActiveTab] = useState<'doctor_prescribed' | 'self_ordered'>('doctor_prescribed');
  const [prescribedSubTab, setPrescribedSubTab] = useState<'pending' | 'booked'>('pending');

  // Orders State
  const [prescribedList, setPrescribedList] = useState<PrescribedMedicine[]>(INITIAL_PRESCRIBED);
  const [selfOrders, setSelfOrders] = useState<SelfOrderedMedicine[]>(INITIAL_SELF_ORDERS);
  const [currentPrescriptionToBook, setCurrentPrescriptionToBook] = useState<PrescribedMedicine | null>(null);

  // Modals & Payment State
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CatalogItem['category'] | 'All'>('All');
  const [showItemSelectModal, setShowItemSelectModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Search & Cart Quantities State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemQuantities, setItemQuantities] = useState<{ [itemId: string]: number }>({});
  const [paymentMode, setPaymentMode] = useState<'Pay at Counter' | 'Paid Online'>('Pay at Counter');

  // Payment Options State (UPI, Card, NetBanking)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM'>('GPAY');

  // Trophy Scale Animation for Victory Overlay
  const trophyScaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (showVictoryModal) {
      trophyScaleAnim.setValue(0.7);
      Animated.spring(trophyScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [showVictoryModal]);

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

  // Filtered prescribed list for current active member
  const filteredPrescribed = useMemo(() => {
    return prescribedList.filter((item) => item.patientId === selectedMember.id && item.orderStatus === prescribedSubTab);
  }, [prescribedList, selectedMember, prescribedSubTab]);

  // Filtered self orders for current active member
  const filteredSelfOrders = useMemo(() => {
    return selfOrders.filter((item) => item.patientId === selectedMember.id);
  }, [selfOrders, selectedMember]);

  // Filtered catalog items
  const filteredCatalog = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Selected cart items
  const selectedCartItems = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => (itemQuantities[item.id] || 0) > 0).map((item) => ({
      ...item,
      qty: itemQuantities[item.id] || 0,
    }));
  }, [itemQuantities]);

  const cartTotalAmount = useMemo(() => {
    return selectedCartItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  }, [selectedCartItems]);

  const cartTotalItemsCount = useMemo(() => {
    return selectedCartItems.reduce((acc, curr) => acc + curr.qty, 0);
  }, [selectedCartItems]);

  // Handlers
  const handleSwitchMember = (memberId: string) => {
    switchActiveAccount(memberId);
    const target = members.find((m) => m.id === memberId) || members[0];
    setSelectedMember(target);
    setShowMemberSwitchSheet(false);
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [itemId]: updated };
    });
  };

  const handleSelectCategory = (categoryName: CatalogItem['category']) => {
    setSelectedCategory(categoryName);
    setShowCategoryModal(false);
    setShowItemSelectModal(true);
  };

  // ORDER PRESCRIPTION WITH SEPARATE ITEMIZED MEDICINES LIST AND EDITABLE QUANTITIES
  const handleOrderPrescription = (prescribedItem: PrescribedMedicine) => {
    setCurrentPrescriptionToBook(prescribedItem);
    const newQuantities: { [key: string]: number } = {};

    prescribedItem.medicines.forEach((med) => {
      // Search or match catalog item
      const match = CATALOG_ITEMS.find((ci) => ci.name.toLowerCase().includes(med.name.toLowerCase().split(' ')[0]));
      if (match) {
        newQuantities[match.id] = med.qty;
      } else {
        newQuantities['cat-13'] = med.qty;
      }
    });

    setItemQuantities(newQuantities);
    setShowConfirmModal(true);
  };

  const handleInitiateOrder = () => {
    if (selectedCartItems.length === 0) return;
    if (paymentMode === 'Paid Online') {
      setShowConfirmModal(false);
      setShowPaymentModal(true);
    } else {
      finalizeOrder('Pay at Counter');
    }
  };

  const handleExecuteOnlinePayment = () => {
    setShowPaymentModal(false);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      finalizeOrder('Paid Online');
      setShowVictoryModal(true);
      if (onAddHealthPoints) onAddHealthPoints(4);
    }, 1500);
  };

  const finalizeOrder = (method: 'Pay at Counter' | 'Paid Online') => {
    const newOrder: SelfOrderedMedicine = {
      id: `so-${Date.now()}`,
      patientId: selectedMember.id,
      orderId: `MED-${Math.floor(10000 + Math.random() * 90000)}`,
      orderDate: 'Today, 18 Sep 2026',
      items: selectedCartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        category: item.category,
      })),
      totalAmount: cartTotalAmount,
      paymentMethod: method,
      status: 'Package Ready for Pickup',
      pickupLocation: 'Hospital Pharmacy, Ground Floor (Main Block)',
    };

    setSelfOrders([newOrder, ...selfOrders]);

    // If booking a doctor prescription, update its status to booked
    if (currentPrescriptionToBook) {
      setPrescribedList((prev) =>
        prev.map((item) =>
          item.id === currentPrescriptionToBook.id
            ? { ...item, orderStatus: 'booked', status: 'Booked & Ready for Pickup' }
            : item
        )
      );
      setCurrentPrescriptionToBook(null);
    }

    setShowConfirmModal(false);
    setShowItemSelectModal(false);
    if (method === 'Pay at Counter') {
      setShowOrderSuccessModal(true);
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

        {/* 1. TOP HEADER BAR: Blue title "Medicines" centered (EXACT SAME AS VISITS & MEDICAL REPORTS) */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 12,
            },
          ]}
        >
          <View style={styles.headerSideGroup}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.headerBackBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="back" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={styles.headerTitleCentered}>
              Medicines
            </Text>
          </View>

          <View style={styles.headerSideGroup} />
        </View>

        {/* MAIN CONTENT AREA */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* SWITCH MEMBER DROPDOWN BAR (EXACT SAME AS VISIT DETAILS & MEDICAL REPORTS) */}
          <View style={[styles.switchMemberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.switchMemberLeft}>
              <Image
                source={getMemberAvatar(selectedMember.id)}
                style={styles.switchMemberAvatar}
                resizeMode="cover"
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.switchMemberLabel, { color: colors.textSecondary }]}>
                  CURRENTLY VIEWING
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.switchMemberName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {selectedMember.name}{' '}
                    <Text style={[styles.switchMemberRelation, { color: colors.primary }]}>
                      ({selectedMember.relation})
                    </Text>
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
              style={[styles.switchMemberDropdownBtn, { backgroundColor: isDark ? colors.primaryLight : '#DEF0FD' }]}
              onPress={() => setShowMemberSwitchSheet(true)}
              activeOpacity={0.75}
            >
              <Text style={[styles.switchMemberDropdownText, { color: colors.primary }]}>Switch</Text>
              <AppIcon name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* TWO MAIN TOGGLE TABS (DOCTOR PRESCRIBED vs SELF ORDER MEDICINE) */}
          <View style={styles.mainTabSegmentWrap}>
            <TouchableOpacity
              style={[
                styles.mainTabSegment,
                activeTab === 'doctor_prescribed'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
              onPress={() => setActiveTab('doctor_prescribed')}
              activeOpacity={0.85}
            >
              <AppIcon
                name="document"
                size={16}
                color={activeTab === 'doctor_prescribed' ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.mainTabText,
                  activeTab === 'doctor_prescribed' ? { color: '#FFFFFF', fontWeight: '800' } : { color: colors.textPrimary },
                ]}
              >
                Doctor Prescribed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mainTabSegment,
                activeTab === 'self_ordered'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
              onPress={() => setActiveTab('self_ordered')}
              activeOpacity={0.85}
            >
              <AppIcon
                name="medkit"
                size={16}
                color={activeTab === 'self_ordered' ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.mainTabText,
                  activeTab === 'self_ordered' ? { color: '#FFFFFF', fontWeight: '800' } : { color: colors.textPrimary },
                ]}
              >
                Self Order Medicine
              </Text>
            </TouchableOpacity>
          </View>

        {activeTab === 'doctor_prescribed' ? (
          /* TAB 1: DOCTOR PRESCRIBED MEDICINES */
          <View style={styles.sectionWrap}>
            {/* SUB-FILTER PILLS: PENDING TO ORDER vs BOOKED */}
            <View style={styles.subFilterRow}>
              <TouchableOpacity
                style={[styles.subFilterPill, prescribedSubTab === 'pending' && styles.subFilterPillActive]}
                onPress={() => setPrescribedSubTab('pending')}
                activeOpacity={0.8}
              >
                <Text style={[styles.subFilterText, prescribedSubTab === 'pending' && styles.subFilterTextActive]}>
                  Pending to Order ({prescribedList.filter((p) => p.patientId === selectedMember.id && p.orderStatus === 'pending').length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subFilterPill, prescribedSubTab === 'booked' && styles.subFilterPillActive]}
                onPress={() => setPrescribedSubTab('booked')}
                activeOpacity={0.8}
              >
                <Text style={[styles.subFilterText, prescribedSubTab === 'booked' && styles.subFilterTextActive]}>
                  Booked & Ready ({prescribedList.filter((p) => p.patientId === selectedMember.id && p.orderStatus === 'booked').length})
                </Text>
              </TouchableOpacity>
            </View>

            {filteredPrescribed.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                <AppIcon name="document" size={38} color="#94A3B8" />
                <Text style={[styles.emptyText, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>
                  No {prescribedSubTab === 'pending' ? 'Pending Prescriptions' : 'Booked Prescriptions'}
                </Text>
                <Text style={styles.emptySub}>
                  {prescribedSubTab === 'pending'
                    ? `All prescribed doctor medicines for ${selectedMember.name} have been ordered.`
                    : `Ordered prescriptions for ${selectedMember.name} ready for pickup will appear here.`}
                </Text>
              </View>
            ) : (
              filteredPrescribed.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.cardContainer,
                    { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' },
                  ]}
                >
                  {/* Doctor Header */}
                  <View style={styles.doctorHeaderRow}>
                    <View style={styles.doctorAvatarCircle}>
                      <Image source={IMAGES.avatarDoctor} style={styles.doctorAvatarImg} resizeMode="cover" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.doctorName, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>{item.doctorName}</Text>
                      <Text style={styles.specialtyText}>{item.specialty} • {item.date}</Text>
                    </View>
                    <View style={[styles.statusBadge, item.orderStatus === 'pending' ? styles.statusBadgePending : styles.statusBadgeReady]}>
                      <Text style={[styles.statusBadgeText, item.orderStatus === 'pending' ? styles.statusTextPending : styles.statusTextReady]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Medicines List */}
                  <View style={styles.medListWrap}>
                    {item.medicines.map((med, idx) => (
                      <View key={idx} style={[styles.medItemRow, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
                        <View style={styles.medPillIcon}>
                          <AppIcon name="pill" size={18} color="#0083B0" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.medName, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>{med.name}</Text>
                          <Text style={styles.medDosageText}>Freq: {med.frequency} | Duration: {med.duration}</Text>
                        </View>
                        <Text style={[styles.medQtyText, { color: isDark ? '#38BDF8' : '#0083B0' }]}>Qty: {med.qty}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Pharmacy Note / Pickup Instructions */}
                  <View style={[styles.pickupNoteCard, { backgroundColor: isDark ? '#0F172A' : '#F0F9FF' }]}>
                    <AppIcon name="hospital" size={18} color="#0083B0" />
                    <Text style={[styles.pickupNoteText, { color: isDark ? '#93C5FD' : '#0369A1' }]}>
                      {item.pharmacyNote}
                    </Text>
                  </View>

                  {/* ORDER PRESCRIPTION BUTTON (ONLY FOR PENDING STATUS) */}
                  {item.orderStatus === 'pending' && (
                    <TouchableOpacity
                      style={styles.orderPrescriptionBtn}
                      onPress={() => handleOrderPrescription(item)}
                      activeOpacity={0.85}
                    >
                      <AppIcon name="medkit" size={16} color="#FFFFFF" />
                      <Text style={styles.orderPrescriptionBtnText}>Order Prescription</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          /* TAB 2: SELF ORDER MEDICINES */
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>
              Customer Booked Orders ({filteredSelfOrders.length})
            </Text>

            {filteredSelfOrders.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                <AppIcon name="medkit" size={40} color="#94A3B8" />
                <Text style={[styles.emptyText, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>No Self-Ordered Medicines Yet</Text>
                <Text style={styles.emptySub}>
                  Click 'Book Your Medicine' below to search and order medicines directly for {selectedMember.name}.
                </Text>
              </View>
            ) : (
              filteredSelfOrders.map((order) => (
                <View
                  key={order.id}
                  style={[
                    styles.cardContainer,
                    { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' },
                  ]}
                >
                  {/* Order Header */}
                  <View style={styles.orderHeaderRow}>
                    <View>
                      <Text style={[styles.orderIdText, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Order #{order.orderId}</Text>
                      <Text style={styles.orderDateText}>{order.orderDate} • {order.paymentMethod}</Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusBadgeReady]}>
                      <Text style={[styles.statusBadgeText, styles.statusTextReady]}>{order.status}</Text>
                    </View>
                  </View>

                  {/* PROMINENT PICKUP INSTRUCTION BANNER (USER REQUIRED SPECIFICATION) */}
                  <View style={styles.prominentPickupBanner}>
                    <View style={styles.pickupBannerIconCircle}>
                      <AppIcon name="location" size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickupBannerTitle}>Will go on shop and collect your package</Text>
                      <Text style={styles.pickupBannerSub}>{order.pickupLocation}</Text>
                    </View>
                  </View>

                  {/* Items Ordered List */}
                  <View style={styles.medListWrap}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={[styles.medItemRow, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#F1F5F9' }]}>
                        <AppIcon name="pill" size={16} color="#0083B0" style={{ marginRight: 8 }} />
                        <Text style={[styles.medName, { color: isDark ? '#F1F5F9' : '#0F253E', flex: 1 }]}>{item.name}</Text>
                        <Text style={styles.orderQtyBadge}>x{item.qty}</Text>
                        <Text style={[styles.itemPriceText, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>₹{item.price * item.qty}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Total Bar */}
                  <View style={[styles.totalBarRow, { borderTopColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <Text style={[styles.totalBarLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Total Amount</Text>
                    <Text style={[styles.totalBarValue, { color: isDark ? '#38BDF8' : '#0083B0' }]}>₹{order.totalAmount}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* RIGHT FLOATING BUTTON: "BOOK YOUR MEDICINE" (MATCHING BOOK YOUR TEST FAB) */}
      <TouchableOpacity
        style={styles.floatingOrderBtnRight}
        onPress={() => {
          setSelectedCategory('All');
          setSearchQuery('');
          setShowItemSelectModal(true);
        }}
        activeOpacity={0.88}
      >
        <AppIcon name="plus" size={18} color="#FFFFFF" />
        <Text style={styles.floatingOrderBtnRightText}>Book Your Medicine</Text>
      </TouchableOpacity>

      {/* SWITCH MEMBER BOTTOM SHEET MODAL (EXACT SAME AS VISITS DETAILS PAGE) */}
      <Modal visible={showMemberSwitchSheet} transparent animationType="slide" onRequestClose={() => setShowMemberSwitchSheet(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowMemberSwitchSheet(false)} activeOpacity={1} />
          <View style={[styles.memberSheetContainer, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.sheetHandleBar} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.confirmHeaderTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Switch Family Member</Text>
              <TouchableOpacity onPress={() => setShowMemberSwitchSheet(false)} activeOpacity={0.7}>
                <AppIcon name="close" size={22} color={isDark ? '#F1F5F9' : '#0F253E'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, gap: 10 }}>
              {members.map((member) => {
                const isSelected = selectedMember.id === member.id;
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberOptionCard,
                      { backgroundColor: isDark ? '#0F172A' : '#FAFAFA', borderColor: isDark ? '#334155' : '#E2E8F0' },
                      isSelected && { borderColor: '#0083B0', backgroundColor: 'rgba(0, 131, 176, 0.08)' },
                    ]}
                    onPress={() => handleSwitchMember(member.id)}
                    activeOpacity={0.8}
                  >
                    <Image source={getMemberAvatar(member.id)} style={styles.memberAvatarImg} resizeMode="cover" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.memberOptionName, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>{member.name}</Text>
                        <View style={[styles.typeBadge, member.patientType === 'IP' ? styles.ipBadgeBg : styles.opBadgeBg]}>
                          <Text style={[styles.typeBadgeText, member.patientType === 'IP' ? styles.ipBadgeText : styles.opBadgeText]}>
                            {member.patientType || 'OP'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.memberOptionRelation}>{member.relation} • UHID: {member.patientNumber}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.memberCheckCircle}>
                        <AppIcon name="check" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* STEP 1: MODAL - SELECT FROM CATEGORIES (MATCHING ATTACHED SCREENSHOT) */}
      <Modal visible={showCategoryModal} animationType="slide" transparent={true} onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.categoryModalCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={styles.categoryHeaderRow}>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <AppIcon name="back" size={22} color={isDark ? '#F1F5F9' : '#0F253E'} />
              </TouchableOpacity>
              <Text style={[styles.categoryHeaderTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Select from Categories</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryModal(false);
                  setSelectedCategory('All');
                  setShowItemSelectModal(true);
                }}
                activeOpacity={0.7}
              >
                <AppIcon name="search" size={20} color={isDark ? '#38BDF8' : '#0083B0'} />
              </TouchableOpacity>
            </View>

            {/* Category Items List (Design Screenshot Reference) */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
              {/* Category 1: First Aid and Supplies */}
              <TouchableOpacity
                style={[styles.categoryCardRow, { backgroundColor: isDark ? '#0F172A' : '#FAFAFA', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => handleSelectCategory('First Aid and Supplies')}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconCircle}>
                  <AppIcon name="medkit" size={22} color="#0083B0" />
                </View>
                <Text style={[styles.categoryCardTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>First Aid and Supplies</Text>
                <AppIcon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Category 2: Personal care and products */}
              <TouchableOpacity
                style={[styles.categoryCardRow, { backgroundColor: isDark ? '#0F172A' : '#FAFAFA', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => handleSelectCategory('Personal care and products')}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconCircle}>
                  <AppIcon name="pulse" size={22} color="#0083B0" />
                </View>
                <Text style={[styles.categoryCardTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>Personal care and products</Text>
                <AppIcon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Category 3: Medical Devices */}
              <TouchableOpacity
                style={[styles.categoryCardRow, { backgroundColor: isDark ? '#0F172A' : '#FAFAFA', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => handleSelectCategory('Medical Devices')}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconCircle}>
                  <AppIcon name="pulse" size={22} color="#0083B0" />
                </View>
                <Text style={[styles.categoryCardTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>Medical Devices</Text>
                <AppIcon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Category 4: Vitamins and Supplements */}
              <TouchableOpacity
                style={[styles.categoryCardRow, { backgroundColor: isDark ? '#0F172A' : '#FAFAFA', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => handleSelectCategory('Vitamins and Supplements')}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconCircle}>
                  <AppIcon name="sun" size={22} color="#0083B0" />
                </View>
                <Text style={[styles.categoryCardTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>Vitamins and Supplements</Text>
                <AppIcon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Category 5: Medicines */}
              <TouchableOpacity
                style={[styles.categoryCardRow, { backgroundColor: isDark ? '#0F172A' : '#FAFAFA', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => handleSelectCategory('Medicines')}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconCircle}>
                  <AppIcon name="pill" size={22} color="#0083B0" />
                </View>
                <Text style={[styles.categoryCardTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>Medicines</Text>
                <AppIcon name="chevron-right" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* STEP 2: MODAL - BOOK YOUR MEDICINE (AUTO SEARCH & ADDED MEDICINES LIST) */}
      <Modal visible={showItemSelectModal} animationType="slide" transparent={false} onRequestClose={() => setShowItemSelectModal(false)}>
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
          {/* Header */}
          <View style={[styles.modalHeaderBar, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowItemSelectModal(false)} activeOpacity={0.7}>
              <AppIcon name="back" size={22} color={isDark ? '#F1F5F9' : '#0F253E'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>
              Book Your Medicines
            </Text>
          </View>

          {/* Search Bar Input & Live Auto-Search Suggestions Overlay */}
          <View style={{ zIndex: 100, position: 'relative' }}>
            <View style={[styles.searchBarWrap, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <AppIcon name="search" size={20} color="#0083B0" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? '#F1F5F9' : '#0F253E' }]}
                placeholder="Search medicine name to add (e.g. Paracetamol)..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <AppIcon name="close" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* LIVE AUTO SEARCH DROPDOWN SUGGESTIONS OVERLAY */}
            {searchQuery.trim().length > 0 && (
              <View
                style={[
                  styles.autoSearchDropdown,
                  { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#CBD5E1' },
                ]}
              >
                {filteredCatalog.length === 0 ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', fontWeight: '600' }}>
                      No matching medicines found for "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 250 }} keyboardShouldPersistTaps="handled">
                    {filteredCatalog.map((item) => {
                      const qty = itemQuantities[item.id] || 0;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.autoSearchRow,
                            { borderBottomColor: isDark ? '#334155' : '#F1F5F9' },
                          ]}
                          onPress={() => {
                            handleQuantityChange(item.id, 1);
                            setSearchQuery('');
                          }}
                          activeOpacity={0.75}
                        >
                          <View style={styles.catalogItemIconWrap}>
                            <AppIcon name="pill" size={18} color="#0083B0" />
                          </View>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={[styles.catalogItemName, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>{item.name}</Text>
                            <Text style={styles.catalogItemUnit}>{item.unit} • ₹{item.price}</Text>
                          </View>
                          <View style={styles.addBtnSmall}>
                            <Text style={styles.addBtnSmallText}>{qty > 0 ? `+ ADD (${qty})` : '+ ADD'}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* MAIN BODY: NO LIST DEFAULT — SHOWS EITHER EMPTY CART CARD OR ADDED MEDICINES WITH NAME, UNIT, QUANTITY (+/-), AND PRICE */}
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#F1F5F9' : '#0F253E', marginBottom: 12 }]}>
              Added Medicines ({selectedCartItems.length})
            </Text>

            {selectedCartItems.length === 0 ? (
              /* EMPTY CART STATE */
              <View style={[styles.emptyCartBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <View style={styles.emptyCartIconCircle}>
                  <AppIcon name="medkit" size={32} color="#0083B0" />
                </View>
                <Text style={[styles.emptyCartTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>
                  No Medicines Added
                </Text>
                <Text style={styles.emptyCartSub}>
                  Search medicine name in the search box above to add items to your order.
                </Text>
              </View>
            ) : (
              /* LIST OF ADDED MEDICINES ONLY */
              selectedCartItems.map((item) => {
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.addedMedCard,
                      { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' },
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.catalogItemName, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>{item.name}</Text>
                      <Text style={styles.catalogItemUnit}>{item.unit} • ₹{item.price} each</Text>
                      <Text style={[styles.catalogItemPrice, { color: isDark ? '#38BDF8' : '#0083B0', marginTop: 4 }]}>
                        Line Total: ₹{item.price * item.qty}
                      </Text>
                    </View>

                    {/* Quantity Controls (+ / -) */}
                    <View style={styles.counterRowLarge}>
                      <TouchableOpacity
                        style={styles.counterBtnLarge}
                        onPress={() => handleQuantityChange(item.id, -1)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.counterBtnTextLarge}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.counterValLarge, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>
                        {item.qty}
                      </Text>
                      <TouchableOpacity
                        style={styles.counterBtnLarge}
                        onPress={() => handleQuantityChange(item.id, 1)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.counterBtnTextLarge}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* BOTTOM BAR: TOTAL IN LAST & PROCEED / PAY NOW BUTTON */}
          <View style={[styles.stickyCartBar, { backgroundColor: isDark ? '#0F172A' : '#0F253E' }]}>
            <View>
              <Text style={styles.cartCountText}>{cartTotalItemsCount} Item{cartTotalItemsCount !== 1 ? 's' : ''} Selected</Text>
              <Text style={styles.cartTotalText}>Total: ₹{cartTotalAmount}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.proceedBookBtn,
                selectedCartItems.length === 0 && { backgroundColor: '#64748B', opacity: 0.6 },
              ]}
              disabled={selectedCartItems.length === 0}
              onPress={() => setShowConfirmModal(true)}
              activeOpacity={0.88}
            >
              <Text style={styles.proceedBookBtnText}>Proceed & Book</Text>
              <AppIcon name="chevron-right" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* STEP 3: MODAL - PACKAGE PICKUP, ITEMIZED MEDICINES LIST WITH EDITABLE QUANTITIES */}
      <Modal visible={showConfirmModal} animationType="slide" transparent={true} onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmModalCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.confirmHeaderTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Confirm Medicine Order</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)} activeOpacity={0.7}>
                <AppIcon name="close" size={22} color={isDark ? '#F1F5F9' : '#0F253E'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* MANDATORY PICKUP NOTICE (USER SPECIFICATION: "Will go on shop and collect package") */}
              <View style={styles.pickupNoticeCard}>
                <View style={styles.pickupNoticeIconBox}>
                  <AppIcon name="hospital" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickupNoticeHeading}>Package Pickup Notice</Text>
                  <Text style={styles.pickupNoticeSub}>
                    Will go on shop and collect your package at:
                  </Text>
                  <Text style={styles.pickupLocationText}>
                    📍 Hospital Pharmacy (Ground Floor, Main Block) • Open 24/7
                  </Text>
                </View>
              </View>

              {/* ITEMIZED MEDICINES LIST WITH EDITABLE QUANTITIES */}
              <Text style={[styles.summaryTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>
                Itemized Medicine List ({cartTotalItemsCount} Items)
              </Text>
              <Text style={styles.editQtyInstruction}>Edit quantities below if you wish to adjust your order:</Text>
              
              <View style={[styles.summaryBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                {selectedCartItems.map((item, idx) => (
                  <View key={item.id} style={[styles.summaryItemRow, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[styles.summaryItemName, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>{item.name}</Text>
                      <Text style={styles.summaryItemPriceTag}>₹{item.price} / unit</Text>
                    </View>

                    {/* Interactive Quantity Counter (+ / -) inside Order Modal */}
                    <View style={styles.counterRow}>
                      <TouchableOpacity style={styles.counterBtn} onPress={() => handleQuantityChange(item.id, -1)} activeOpacity={0.7}>
                        <Text style={styles.counterBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.counterVal, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>{item.qty}</Text>
                      <TouchableOpacity style={styles.counterBtn} onPress={() => handleQuantityChange(item.id, 1)} activeOpacity={0.7}>
                        <Text style={styles.counterBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.summaryItemPrice, { color: isDark ? '#F1F5F9' : '#1E293B', minWidth: 60, textAlign: 'right' }]}>
                      ₹{item.price * item.qty}
                    </Text>
                  </View>
                ))}
                
                <View style={[styles.summaryTotalRow, { borderTopColor: isDark ? '#334155' : '#CBD5E1' }]}>
                  <Text style={[styles.summaryTotalLabel, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Total Payable</Text>
                  <Text style={[styles.summaryTotalVal, { color: isDark ? '#38BDF8' : '#0083B0' }]}>₹{cartTotalAmount}</Text>
                </View>
              </View>

              {/* Payment Mode Selector */}
              <Text style={[styles.summaryTitle, { color: isDark ? '#F1F5F9' : '#0F253E', marginTop: 14 }]}>Payment Option</Text>
              <TouchableOpacity
                style={[styles.payOptionRow, paymentMode === 'Pay at Counter' && styles.payOptionActive]}
                onPress={() => setPaymentMode('Pay at Counter')}
                activeOpacity={0.8}
              >
                <View style={[styles.radioCircle, paymentMode === 'Pay at Counter' && styles.radioCircleActive]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payOptionTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Pay at Pharmacy Counter</Text>
                  <Text style={styles.payOptionSub}>Pay cash/UPI when collecting your package</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.payOptionRow, paymentMode === 'Paid Online' && styles.payOptionActive]}
                onPress={() => setPaymentMode('Paid Online')}
                activeOpacity={0.8}
              >
                <View style={[styles.radioCircle, paymentMode === 'Paid Online' && styles.radioCircleActive]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payOptionTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Pay Online Now (UPI / Card / NetBanking)</Text>
                  <Text style={styles.payOptionSub}>Earn +4 Reward Points on online payment</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Confirm Action Button */}
            <TouchableOpacity style={styles.confirmPlaceBtn} onPress={handleInitiateOrder} activeOpacity={0.88}>
              <Text style={styles.confirmPlaceBtnText}>
                {paymentMode === 'Paid Online' ? 'Proceed to Pay Now' : 'Confirm & Place Order'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* STEP 4: PAYMENT OPTIONS SHEET MODAL (EXACT SAME AS BOOK TEST & PAY BILLS) */}
      <Modal visible={showPaymentModal} animationType="slide" transparent={true} onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmModalCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.confirmHeaderTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)} activeOpacity={0.7}>
                <AppIcon name="close" size={22} color={isDark ? '#F1F5F9' : '#0F253E'} />
              </TouchableOpacity>
            </View>

            {/* Option 1: UPI */}
            <TouchableOpacity
              style={[styles.payOptionRow, selectedPaymentMethod === 'UPI' && styles.payOptionActive]}
              onPress={() => setSelectedPaymentMethod('UPI')}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, selectedPaymentMethod === 'UPI' && styles.radioCircleActive]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.payOptionTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>UPI Payment (Instant)</Text>
                <Text style={styles.payOptionSub}>Google Pay, PhonePe, Paytm</Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Credit / Debit Card */}
            <TouchableOpacity
              style={[styles.payOptionRow, selectedPaymentMethod === 'CARD' && styles.payOptionActive]}
              onPress={() => setSelectedPaymentMethod('CARD')}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, selectedPaymentMethod === 'CARD' && styles.radioCircleActive]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.payOptionTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Credit / Debit Card</Text>
                <Text style={styles.payOptionSub}>Visa, MasterCard, RuPay</Text>
              </View>
            </TouchableOpacity>

            {/* Option 3: Net Banking */}
            <TouchableOpacity
              style={[styles.payOptionRow, selectedPaymentMethod === 'NETBANKING' && styles.payOptionActive]}
              onPress={() => setSelectedPaymentMethod('NETBANKING')}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, selectedPaymentMethod === 'NETBANKING' && styles.radioCircleActive]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.payOptionTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Net Banking</Text>
                <Text style={styles.payOptionSub}>All Indian Major Banks</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmPlaceBtn} onPress={handleExecuteOnlinePayment} activeOpacity={0.88}>
              <Text style={styles.confirmPlaceBtnText}>Pay ₹{cartTotalAmount} Securely</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* STEP 5: TRANSPARENT FULL SCREEN VICTORY REWARD BLAST OVERLAY */}
      <Modal visible={showVictoryModal} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setShowVictoryModal(false)}>
        <View style={styles.transparentVictoryOverlay}>
          {/* TOP RIGHT CLOSE CROSS ICON */}
          <TouchableOpacity
            style={styles.victoryTopCloseBtn}
            onPress={() => {
              setShowVictoryModal(false);
              setActiveTab('self_ordered');
              setItemQuantities({});
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <AppIcon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.imageRefVictoryScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.imageRefHeaderTitle}>
              Woohoo! You Won +4 Health Points as a Reward! 🎉
            </Text>

            <Animated.View style={[styles.imageRefGraphicContainer, { transform: [{ scale: trophyScaleAnim }] }]}>
              <Image
                source={IMAGES.rewardBlastGif}
                fadeDuration={0}
                style={styles.imageRefGiftBoxArt}
                resizeMode="contain"
              />
            </Animated.View>
          </ScrollView>
        </View>
      </Modal>

      {/* ORDER SUCCESS MODAL FOR PAY AT COUNTER */}
      <Modal visible={showOrderSuccessModal} animationType="fade" transparent={true} onRequestClose={() => setShowOrderSuccessModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.successCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={styles.successCheckCircle}>
              <AppIcon name="check" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.successTitle, { color: isDark ? '#F1F5F9' : '#0F253E' }]}>Medicine Order Placed!</Text>
            <Text style={styles.successSub}>
              Your package is being prepared. Please visit Hospital Pharmacy shop to collect your package.
            </Text>

            <TouchableOpacity
              style={styles.successOkBtn}
              onPress={() => {
                setShowOrderSuccessModal(false);
                setActiveTab('self_ordered');
                setItemQuantities({});
              }}
              activeOpacity={0.88}
            >
              <Text style={styles.successOkBtnText}>View My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UNIVERSAL LOADER */}
      <UniversalLoader
        visible={isProcessing}
        message="Processing Payment..."
        subtitle="Connecting to secure pharmacy payment gateway"
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },

  // APP-THEMED AMBIENT PARENT BACKGROUND LAYER
  ambientBgContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E0F2FE',
    opacity: 0.5,
  },
  ambientMidGlow: {
    position: 'absolute',
    top: 320,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#F0F9FF',
    opacity: 0.6,
  },
  ambientWaveImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    width: '100%',
    opacity: 0.12,
  },

  // 1. TOP HEADER BAR: Blue title "Medicines" centered (SAME AS VISITS & REPORTS)
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

  // SWITCH MEMBER DROPDOWN BAR (SAME AS VISIT DETAILS & MEDICAL REPORTS)
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

  // MAIN TOGGLE TABS
  mainTabSegmentWrap: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  mainTabSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    gap: 8,
  },
  mainTabText: {
    fontSize: 13.5,
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionWrap: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Doctor Prescribed Sub-filter Row
  subFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  subFilterPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
  },
  subFilterPillActive: {
    backgroundColor: '#0083B0',
  },
  subFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  subFilterTextActive: {
    color: '#FFFFFF',
  },

  cardContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },

  // Doctor Card
  doctorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#E2E8F0',
  },
  doctorAvatarImg: {
    width: '100%',
    height: '100%',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '800',
  },
  specialtyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  statusBadgeReady: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextReady: {
    color: '#16A34A',
  },

  medListWrap: {
    marginVertical: 6,
  },
  medItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  medPillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 131, 176, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
  },
  medDosageText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  medQtyText: {
    fontSize: 13,
    fontWeight: '800',
  },

  pickupNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  pickupNoteText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  orderPrescriptionBtn: {
    backgroundColor: '#0083B0',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 6,
  },
  orderPrescriptionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Self Order Card
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '800',
  },
  orderDateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  prominentPickupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0083B0',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    gap: 10,
  },
  pickupBannerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupBannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  pickupBannerSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 1,
  },
  orderQtyBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 10,
  },
  itemPriceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  totalBarLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalBarValue: {
    fontSize: 16,
    fontWeight: '900',
  },

  emptyCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 18,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  // Floating Action Button (FAB) on Bottom Right
  floatingOrderBtnRight: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    gap: 8,
    zIndex: 99,
  },
  floatingOrderBtnRightText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Member Switch Sheet Modal
  memberSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  memberOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  memberAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberOptionName: {
    fontSize: 15,
    fontWeight: '800',
  },
  memberOptionRelation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  memberCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  categoryModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '82%',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  categoryCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 131, 176, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  categoryCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },

  // Search & Item Selector
  modalHeaderBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginLeft: 8,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Auto Search Dropdown Suggestions
  autoSearchDropdown: {
    position: 'absolute',
    top: 58,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 999,
  },
  autoSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  addBtnSmall: {
    backgroundColor: '#0083B0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addBtnSmallText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Empty Cart Box in Book Your Medicine
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1.5,
    marginTop: 10,
  },
  emptyCartIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 131, 176, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyCartTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptyCartSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },

  // Added Medicine Cards
  addedMedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  counterRowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 131, 176, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  counterBtnLarge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnTextLarge: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0083B0',
  },
  counterValLarge: {
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 10,
  },
  catalogItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  catalogItemIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 131, 176, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catalogItemName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  catalogItemUnit: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  catalogItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  qtyControlContainer: {
    alignItems: 'flex-end',
  },
  addBtn: {
    backgroundColor: '#0083B0',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 131, 176, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  counterBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0083B0',
  },
  counterVal: {
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 8,
  },

  // Sticky Cart Bar
  stickyCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F253E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  cartCountText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  cartTotalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  proceedBookBtn: {
    backgroundColor: '#0083B0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proceedBookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Confirm Modal
  confirmModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  pickupNoticeCard: {
    flexDirection: 'row',
    backgroundColor: '#0083B0',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  pickupNoticeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupNoticeHeading: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pickupNoticeSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  pickupLocationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  editQtyInstruction: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  summaryBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryItemPriceTag: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  summaryItemQty: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 10,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  summaryTotalVal: {
    fontSize: 17,
    fontWeight: '900',
  },

  payOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 8,
    gap: 12,
  },
  payOptionActive: {
    borderColor: '#0083B0',
    backgroundColor: 'rgba(0, 131, 176, 0.08)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  radioCircleActive: {
    borderColor: '#0083B0',
    backgroundColor: '#0083B0',
  },
  payOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  payOptionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },

  confirmPlaceBtn: {
    height: 48,
    backgroundColor: '#0083B0',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  confirmPlaceBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // Transparent Victory Overlay
  transparentVictoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.94)',
    justifyContent: 'center',
  },
  victoryTopCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  imageRefVictoryScrollContent: {
    paddingHorizontal: 0,
    paddingTop: 70,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  imageRefHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 16,
    letterSpacing: -0.3,
  },
  imageRefGraphicContainer: {
    width: '100%',
    height: 540,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 0,
  },
  imageRefGiftBoxArt: {
    width: '100%',
    height: '100%',
  },

  // Success Modal
  successCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  successCheckCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  successOkBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#0083B0',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successOkBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
});
