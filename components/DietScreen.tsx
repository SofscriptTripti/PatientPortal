import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useWindowDimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { PatientMember, UserSession } from './types';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface DietScreenProps {
  userSession: UserSession;
  patient?: PatientMember | null;
  onBack: () => void;
  onOpenBookTest?: () => void;
}

interface MenuItemOption {
  id: string;
  name: string;
  category: string;
  price: number;
  calories: string;
  description: string;
}

const MENU_BY_MEAL: Record<string, MenuItemOption[]> = {
  Breakfast: [
    { id: 'b1', name: 'Idli & Sambhar', category: 'Soft Diet', price: 100, calories: '180 kcal', description: '2 Steamed rice-dal idlis served with mild sambhar.' },
    { id: 'b2', name: 'Poha', category: 'Light Snack', price: 90, calories: '160 kcal', description: 'Flattened rice tempered with mustard seeds & curry leaves.' },
    { id: 'b3', name: 'Bread Omelette (Egg)', category: 'High Protein', price: 110, calories: '240 kcal', description: '2 Egg white omelette with 2 multigrain bread slices.' },
    { id: 'b4', name: 'Vegetable Upma', category: 'Diabetic Friendly', price: 95, calories: '170 kcal', description: 'Semolina upma with finely chopped carrots & peas.' },
    { id: 'b5', name: 'Fruit Bowl', category: 'Fresh Fruit', price: 120, calories: '110 kcal', description: 'Freshly cut papaya, apple, and pomegranate.' },
    { id: 'b6', name: 'Milk/Tea', category: 'Beverage', price: 40, calories: '60 kcal', description: 'Warm skimmed milk or sugar-free herbal tea.' },
  ],
  Lunch: [
    { id: 'l1', name: 'Moong Dal Khichdi Bowl', category: 'Soft Diet', price: 140, calories: '310 kcal', description: 'Easily digestible rice & moong dal with cow ghee.' },
    { id: 'l2', name: 'Steamed Rice & Yellow Dal', category: 'Standard Diet', price: 130, calories: '350 kcal', description: 'Plain steamed basmati rice with tempered yellow dal.' },
    { id: 'l3', name: 'Clear Vegetable Soup', category: 'Liquid Diet', price: 90, calories: '65 kcal', description: 'Light, nutrient-rich vegetable broth.' },
    { id: 'l4', name: 'Curd Rice with Pomegranate', category: 'Probiotic', price: 110, calories: '210 kcal', description: 'Cooling curd rice tempered with mustard seeds.' },
    { id: 'l5', name: 'Attendant Special Thali', category: 'Attendant Meal', price: 190, calories: '580 kcal', description: '3 Roti, Sabzi, Dal, Rice, Salad & Sweet.' },
  ],
  'Evening Snack': [
    { id: 'e1', name: 'Herbal Green Tea & Marie', category: 'Sugar Free', price: 50, calories: '45 kcal', description: 'Warm antioxidant green tea with 2 biscuits.' },
    { id: 'e2', name: 'Roasted Makhana Bowl', category: 'Low Fat', price: 80, calories: '90 kcal', description: 'Crunchy fox nuts lightly roasted with black pepper.' },
    { id: 'e3', name: 'Boiled Egg Whites (2 Pcs)', category: 'Protein', price: 60, calories: '70 kcal', description: 'Steamed egg whites seasoned with mild herbs.' },
    { id: 'e4', name: 'Tender Coconut Water', category: 'Hydration', price: 60, calories: '45 kcal', description: 'Fresh natural coconut water.' },
  ],
  Dinner: [
    { id: 'd1', name: 'Soft Vegetable Dalia', category: 'Diabetic Care', price: 130, calories: '290 kcal', description: 'Broken wheat porridge cooked with bottle gourd & spinach.' },
    { id: 'd2', name: 'Soft Khichdi & Stewed Apple', category: 'Post-Op Soft', price: 150, calories: '340 kcal', description: 'Soothing dinner meal for rapid digestion.' },
    { id: 'd3', name: 'Clear Tomato Basil Soup', category: 'Liquid Diet', price: 95, calories: '75 kcal', description: 'Fresh tomato soup prepared without cream.' },
    { id: 'd4', name: 'Warm Turmeric Milk', category: 'Bedtime', price: 50, calories: '80 kcal', description: 'Warm skimmed milk infused with haldi.' },
  ],
};

interface DietOrder {
  orderId: string;
  patientName: string;
  bedNumber: string;
  mealType: string;
  itemsSelected: string[];
  totalAmount: number;
  anythingElse: string;
  orderTime: string;
  status: 'Submitted' | 'Nutritionist Approved' | 'Kitchen Preparing' | 'Delivered';
  stepIndex: number;
  paymentMethod?: string;
}

export const DietScreen: React.FC<DietScreenProps> = ({
  userSession,
  patient,
  onBack,
  onOpenBookTest,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  const modalScrollViewRef = useRef<any>(null);
  const [keyboardExtraPadding, setKeyboardExtraPadding] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardExtraPadding(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardExtraPadding(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Main Tabs: 'doctor_diet' vs 'self_order'
  const [activeTab, setActiveTab] = useState<'doctor_diet' | 'self_order'>('doctor_diet');

  // 80% Slide-Up Order Modal State
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'menu' | 'payment'>('menu');
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'pay_later'>('pay_now');
  const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Evening Snack'>('Breakfast');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(['b1', 'b6']); // Default pre-select Idli & Sambhar + Milk/Tea
  const [anythingElse, setAnythingElse] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Rewards Blast Screen State & Animation for Pay Now
  const [showRewardBlastModal, setShowRewardBlastModal] = useState<boolean>(false);
  const trophyScaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (showRewardBlastModal) {
      trophyScaleAnim.setValue(0.3);
      Animated.spring(trophyScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [showRewardBlastModal, trophyScaleAnim]);

  // Active Orders History Trail for Chandan Chouhan
  const [ordersHistory, setOrdersHistory] = useState<DietOrder[]>([
    {
      orderId: 'ORD-2026-9904',
      patientName: patient?.name || 'Chandan Chouhan',
      bedNumber: patient?.bedNumber || 'Bed 304 (Ward 4A)',
      mealType: 'Breakfast',
      itemsSelected: ['Idli & Sambhar', 'Milk/Tea', 'Warm water (Extra Item)'],
      totalAmount: 140,
      anythingElse: 'Warm water (Extra Item)',
      orderTime: 'Today, 08:15 AM',
      status: 'Delivered',
      stepIndex: 4,
      paymentMethod: 'Paid Online (UPI)',
    },
    {
      orderId: 'ORD-2026-9882',
      patientName: patient?.name || 'Chandan Chouhan',
      bedNumber: patient?.bedNumber || 'Bed 304 (Ward 4A)',
      mealType: 'Lunch',
      itemsSelected: ['Moong Dal Khichdi Bowl', 'Clear Vegetable Soup', 'Less salt khichdi (Extra Item)'],
      totalAmount: 230,
      anythingElse: 'Less salt khichdi (Extra Item)',
      orderTime: 'Yesterday, 01:20 PM',
      status: 'Delivered',
      stepIndex: 4,
      paymentMethod: 'Pay Later upon Bed Delivery',
    },
  ]);

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate selected items total price
  const currentMenu = MENU_BY_MEAL[selectedMealType] || [];
  const selectedItems = currentMenu.filter((m) => selectedItemIds.includes(m.id));
  const currentMealTotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleProceedToPayment = () => {
    if (selectedItemIds.length === 0) {
      Alert.alert('Select Menu Items', 'Please select at least 1 menu item to proceed.');
      return;
    }
    setModalStep('payment');
  };

  const handleFinalSubmitOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const itemsNames = selectedItems.map((m) => m.name);
      if (anythingElse.trim()) {
        itemsNames.push(`${anythingElse.trim()} (Extra Item)`);
      }
      const payMethodLabel = paymentMode === 'pay_now' ? 'Paid Online (UPI/Card)' : 'Pay Later upon Bed Delivery';

      const newOrder: DietOrder = {
        orderId: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: patient?.name || 'Chandan Chouhan',
        bedNumber: patient?.bedNumber || 'Bed 304 (Ward 4A)',
        mealType: selectedMealType,
        itemsSelected: itemsNames,
        totalAmount: currentMealTotal,
        anythingElse: anythingElse.trim() ? `${anythingElse.trim()} (Extra Item)` : 'None',
        orderTime: 'Just now',
        status: 'Submitted',
        stepIndex: 1,
        paymentMethod: payMethodLabel,
      };

      setOrdersHistory((prev) => [newOrder, ...prev]);
      setShowOrderModal(false);
      setModalStep('menu');
      setAnythingElse('');

      if (paymentMode === 'pay_now') {
        setShowRewardBlastModal(true);
      } else {
        setActiveTab('self_order');
        Alert.alert(
          'Request Submitted & Confirmed! 🍲',
          `Your ${selectedMealType} diet request has been placed for ${newOrder.patientName} (${newOrder.bedNumber}).\n\nItems: ${itemsNames.join(', ')}\nPayment: ${payMethodLabel}\nTotal Amount: ₹${currentMealTotal}`
        );
      }
    }, 600);
  };

  const activePatientName = patient?.name || 'Chandan Chouhan';
  const activeBed = patient?.bedNumber || 'Bed 304 (Ward 4A)';

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

        {/* TOP HEADER BAR */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: isDark ? colors.border : '#E2E8F0',
            },
            isTablet && { paddingHorizontal: 24, paddingVertical: 14 },
          ]}
        >
          <View style={styles.headerSideGroup}>
            <TouchableOpacity
              onPress={onBack}
              style={[styles.headerBackBtn, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="back" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, { color: colors.textPrimary }, isTablet && { fontSize: 22 }]}>
              Diet & Nutrition
            </Text>
          </View>

          <View style={[styles.headerSideGroup, { alignItems: 'flex-end' }]}>
            <View style={[styles.ipTagBadge, { backgroundColor: '#FFEDD5' }]}>
              <Text style={styles.ipTagText}>IP PATIENT</Text>
            </View>
          </View>
        </View>

        {/* MAIN TOGGLE TABS: DOCTOR PRESCRIBED DIET vs SELF ORDER */}
        <View style={[styles.tabBarContainer, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'doctor_diet' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('doctor_diet')}
            activeOpacity={0.85}
          >
            <AppIcon name="document" size={16} color={activeTab === 'doctor_diet' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabButtonText, { color: activeTab === 'doctor_diet' ? '#FFFFFF' : colors.textSecondary }]}>
              Doctor Prescribed Diet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'self_order' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('self_order')}
            activeOpacity={0.85}
          >
            <AppIcon name="food-apple-outline" size={16} color={activeTab === 'self_order' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabButtonText, { color: activeTab === 'self_order' ? '#FFFFFF' : colors.textSecondary }]}>
              Self Order Details ({ordersHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: DOCTOR PRESCRIBED DIET DETAILS */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }, isTablet && { paddingHorizontal: 28, paddingTop: 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'doctor_diet' ? (
            <View style={{ gap: 14 }}>
              {/* PATIENT & VISIT SUMMARY CARD */}
              <View style={[styles.patientSummaryCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight }]}>
                  <Image source={IMAGES.avatarMale} style={{ width: 48, height: 48, borderRadius: 24 }} resizeMode="cover" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.patientNameText, { color: colors.textPrimary }]}>
                      {activePatientName}
                    </Text>
                    <Text style={styles.relationBadgeText}>( FATHER • IP )</Text>
                  </View>
                  <Text style={[styles.patientSubText, { color: colors.textSecondary }]}>
                    {activeBed} • UHID: 109282835
                  </Text>
                  <Text style={[styles.visitRefText, { color: colors.primary }]}>
                    Visit Ref: VIS-2026-8841 (Post-ICU Recovery Ward)
                  </Text>
                </View>
              </View>

              {/* DOCTOR PRESCRIBED DIET BANNER */}
              <View style={[styles.doctorPrescribedCard, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: colors.primary }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.docIconBg, { backgroundColor: colors.primaryLight }]}>
                    <AppIcon name="hospital" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.prescribedDoctorTitle, { color: colors.textPrimary }]}>
                      Dr. Meena (Clinical Nutritionist) & Dr. Chakravarthi
                    </Text>
                    <Text style={[styles.prescribedSubText, { color: colors.textSecondary }]}>
                      Prescribed Diet Plan for {activePatientName} • Updated Today
                    </Text>
                  </View>
                </View>

                {/* Calorie Target Pill */}
                <View style={styles.calorieTargetRow}>
                  <View style={[styles.calorieTargetPill, { backgroundColor: colors.primary }]}>
                    <AppIcon name="heart" size={14} color="#FFFFFF" />
                    <Text style={styles.calorieTargetPillText}>DAILY TARGET: 1,800 Kcal / day</Text>
                  </View>
                  <Text style={[styles.sodiumLimitText, { color: colors.textMuted }]}>
                    Sodium: &lt; 2.0g / day
                  </Text>
                </View>

                {/* Clinical Restriction Tags */}
                <View style={styles.restrictionsRow}>
                  <View style={[styles.chipPill, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.chipText, { color: '#DC2626' }]}>Low Sodium</Text>
                  </View>
                  <View style={[styles.chipPill, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[styles.chipText, { color: '#0284C7' }]}>Diabetic Friendly</Text>
                  </View>
                  <View style={[styles.chipPill, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={[styles.chipText, { color: '#16A34A' }]}>Low Fat</Text>
                  </View>
                  <View style={[styles.chipPill, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.chipText, { color: '#D97706' }]}>Soft & Digestible</Text>
                  </View>
                </View>
              </View>

              {/* PRESCRIBED MEAL SCHEDULE */}
              <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                Doctor Prescribed Meal Schedule for {activePatientName}
              </Text>

              {/* Meal 1: Breakfast */}
              <View style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <View style={styles.mealHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppIcon name="sun" size={18} color="#D97706" />
                    <Text style={[styles.mealTitle, { color: colors.textPrimary }]}>1. Breakfast (08:00 AM)</Text>
                  </View>
                  <Text style={[styles.mealCalText, { color: colors.primary }]}>350 Kcal</Text>
                </View>
                <Text style={[styles.mealItemsText, { color: colors.textSecondary }]}>
                  • Oats Porridge in Skimmed Milk (200 ml){'\n'}
                  • 2 Soft Boiled Egg Whites / Moong Sprouts{'\n'}
                  • Fresh Papaya Slices (100g)
                </Text>
              </View>

              {/* Meal 2: Mid-Morning */}
              <View style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <View style={styles.mealHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppIcon name="clock" size={18} color="#0284C7" />
                    <Text style={[styles.mealTitle, { color: colors.textPrimary }]}>2. Mid-Morning Hydration (11:00 AM)</Text>
                  </View>
                  <Text style={[styles.mealCalText, { color: colors.primary }]}>120 Kcal</Text>
                </View>
                <Text style={[styles.mealItemsText, { color: colors.textSecondary }]}>
                  • Fresh Tender Coconut Water (1 Glass){'\n'}
                  • Roasted Makhana / Fox Nuts (mild pepper)
                </Text>
              </View>

              {/* Meal 3: Lunch */}
              <View style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <View style={styles.mealHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppIcon name="food-apple-outline" size={18} color="#16A34A" />
                    <Text style={[styles.mealTitle, { color: colors.textPrimary }]}>3. Lunch (01:00 PM)</Text>
                  </View>
                  <Text style={[styles.mealCalText, { color: colors.primary }]}>550 Kcal</Text>
                </View>
                <Text style={[styles.mealItemsText, { color: colors.textSecondary }]}>
                  • 2 Soft Multigrain Fulka (without ghee){'\n'}
                  • Steamed Lauki / Ridge Gourd Sabzi{'\n'}
                  • Yellow Moong Dal (low salt, 1 bowl){'\n'}
                  • Steamed Brown Rice + Fresh Skimmed Curd
                </Text>
              </View>

              {/* Meal 4: Evening Snack */}
              <View style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <View style={styles.mealHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppIcon name="clock" size={18} color="#9333EA" />
                    <Text style={[styles.mealTitle, { color: colors.textPrimary }]}>4. Evening Snack (05:00 PM)</Text>
                  </View>
                  <Text style={[styles.mealCalText, { color: colors.primary }]}>100 Kcal</Text>
                </View>
                <Text style={[styles.mealItemsText, { color: colors.textSecondary }]}>
                  • Warm Herbal Green Tea (Sugar-free){'\n'}
                  • 2 Marie Biscuits / Roasted Chana
                </Text>
              </View>

              {/* Meal 5: Dinner */}
              <View style={[styles.mealCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                <View style={styles.mealHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppIcon name="moon" size={18} color="#475569" />
                    <Text style={[styles.mealTitle, { color: colors.textPrimary }]}>5. Dinner (08:00 PM)</Text>
                  </View>
                  <Text style={[styles.mealCalText, { color: colors.primary }]}>480 Kcal</Text>
                </View>
                <Text style={[styles.mealItemsText, { color: colors.textSecondary }]}>
                  • Vegetable Dalia / Clear Vegetable Soup{'\n'}
                  • Soft Moong Khichdi (1 bowl){'\n'}
                  • Stewed Apple Slices
                </Text>
              </View>

              {/* CLINICAL NUTRITIONIST ADVICE */}
              <View style={[styles.adviceBox, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="shield-check" size={20} color={colors.primary} />
                <Text style={[styles.adviceText, { color: colors.textPrimary }]}>
                  Note: All therapeutic meals are prepared by the hospital clinical kitchen under strict dietician protocols and delivered directly to {activeBed}.
                </Text>
              </View>
            </View>
          ) : (
            /* TAB 2: SELF ORDER DETAILS & HISTORY TRAIL */
            <View style={{ gap: 16 }}>
              <View style={styles.selfOrderHeaderRow}>
                <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
                  Self Diet Orders & Requests Details
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  Showing active and past food orders placed for {activePatientName} ({activeBed})
                </Text>
              </View>

              {ordersHistory.length > 0 ? (
                ordersHistory.map((order) => (
                  <View
                    key={order.orderId}
                    style={[
                      styles.orderDetailCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isDark ? colors.border : '#E2E8F0',
                      },
                    ]}
                  >
                    {/* Card Header */}
                    <View style={styles.orderCardHeader}>
                      <View>
                        <Text style={[styles.orderIdText, { color: colors.textPrimary }]}>
                          {order.orderId} • {order.mealType}
                        </Text>
                        <Text style={[styles.orderTimeText, { color: colors.textMuted }]}>
                          Order Placed: {order.orderTime}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: order.status === 'Delivered' ? '#DCFCE7' : '#FEF3C7' }]}>
                        <Text style={[styles.statusPillText, { color: order.status === 'Delivered' ? '#16A34A' : '#D97706' }]}>
                          {order.status}
                        </Text>
                      </View>
                    </View>

                    {/* Ordered Items & Extra Custom Items List */}
                    <View style={styles.orderedItemsBox}>
                      <Text style={[styles.itemsTitleText, { color: colors.textPrimary }]}>
                        Items & Extra Items Ordered:
                      </Text>
                      {order.itemsSelected.map((item, idx) => (
                        <Text key={idx} style={[styles.itemLineText, { color: colors.textSecondary }]}>
                          • {item}
                        </Text>
                      ))}
                    </View>

                    {/* Payment Method & Amount */}
                    <View style={styles.orderMetaRow}>
                      <View style={{ flex: 1 }}>
                        {order.paymentMethod && (
                          <Text style={[styles.metaNoteTitle, { color: colors.primary }]}>
                            Payment: {order.paymentMethod}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.amountLabelText, { color: colors.textMuted }]}>Total Bill:</Text>
                        <Text style={[styles.amountValText, { color: colors.primary }]}>₹{order.totalAmount}</Text>
                      </View>
                    </View>

                    {/* 4-Step Audit Trail Progress Line */}
                    <View style={styles.progressLineRow}>
                      {['Submitted', 'Approved', 'Preparing', 'Delivered'].map((step, idx) => {
                        const isDone = idx + 1 <= order.stepIndex;
                        return (
                          <View key={step} style={styles.progressStepCol}>
                            <View
                              style={[
                                styles.stepDot,
                                isDone ? { backgroundColor: colors.primary } : { backgroundColor: '#CBD5E1' },
                              ]}
                            >
                              {isDone && <AppIcon name="check" size={10} color="#FFFFFF" />}
                            </View>
                            <Text style={[styles.stepLabel, isDone ? { color: colors.primary, fontWeight: '700' } : { color: colors.textMuted }]}>
                              {step}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <AppIcon name="food-apple-outline" size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                    No Self Orders Placed Yet
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                    Click "Order Now" on the bottom right to place a self request or order cafeteria food.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* FLOATING BOTTOM RIGHT ACTION BUTTON: "ORDER NOW" */}
        <TouchableOpacity
          style={[styles.floatingBookTestBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setModalStep('menu');
            setShowOrderModal(true);
          }}
          activeOpacity={0.85}
        >
          <AppIcon name="food-apple-outline" size={22} color="#FFFFFF" />
          <Text style={styles.floatingBookTestText}>Order Now</Text>
        </TouchableOpacity>

        {/* 80% HEIGHT SLIDE-UP BOTTOM SHEET MODAL WITH KEYBOARD AVOIDING VIEW & PAYMENT FLOW */}
        <Modal
          visible={showOrderModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowOrderModal(false);
            setModalStep('menu');
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setShowOrderModal(false);
                setModalStep('menu');
              }}
            />

            {/* KeyboardAvoidingView wrapped 80% Height Card */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[
                styles.slideUpCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.sheetHandleBar} />

              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                  {modalStep === 'payment' && (
                    <TouchableOpacity
                      style={[styles.modalCloseBtn, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}
                      onPress={() => setModalStep('menu')}
                      activeOpacity={0.7}
                    >
                      <AppIcon name="back" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalTitleText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {modalStep === 'menu' ? 'Self Request (Optional)' : 'Select Payment Method'}
                    </Text>
                    <Text style={[styles.modalSubText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {modalStep === 'menu'
                        ? `Select meal & menu items for ${activePatientName}`
                        : `Complete order for ${activePatientName} • Total ₹${currentMealTotal}`}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}
                  onPress={() => {
                    setShowOrderModal(false);
                    setModalStep('menu');
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AppIcon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {modalStep === 'menu' ? (
                <>
                  <ScrollView
                    ref={modalScrollViewRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                      styles.modalScrollContent,
                      { paddingBottom: 60 + keyboardExtraPadding },
                    ]}
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* 1. MEAL TYPE SELECTION (Breakfast, Lunch, Dinner, Evening Snack) */}
                    <Text style={[styles.fieldTitle, { color: colors.textPrimary }]}>Select Meal Type:</Text>
                    <View style={styles.mealTypeGrid}>
                      {(['Breakfast', 'Lunch', 'Dinner', 'Evening Snack'] as const).map((meal) => (
                        <TouchableOpacity
                          key={meal}
                          style={[
                            styles.mealChipBtn,
                            selectedMealType === meal && { backgroundColor: colors.primary, borderColor: colors.primary },
                            { borderColor: colors.border },
                          ]}
                          onPress={() => {
                            setSelectedMealType(meal);
                            // Reset selected items to first 2 items of new meal type
                            const menu = MENU_BY_MEAL[meal] || [];
                            setSelectedItemIds(menu.slice(0, 2).map((m) => m.id));
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.mealChipText,
                              selectedMealType === meal ? { color: '#FFFFFF' } : { color: colors.textPrimary },
                            ]}
                          >
                            {meal}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* 2. DYNAMIC TODAY'S MENU SECTION */}
                    <Text style={[styles.fieldTitle, { color: colors.textPrimary, marginTop: 14 }]}>
                      Today's {selectedMealType} Menu
                    </Text>

                    <View style={styles.menuItemsList}>
                      {(MENU_BY_MEAL[selectedMealType] || []).map((item) => {
                        const isChecked = selectedItemIds.includes(item.id);
                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.menuOptionRow,
                              isChecked && { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: colors.primary },
                              { borderColor: colors.border },
                            ]}
                            onPress={() => toggleItemSelection(item.id)}
                            activeOpacity={0.8}
                          >
                            {/* Checkbox Icon */}
                            <View style={[styles.checkboxBox, isChecked && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                              {isChecked && <AppIcon name="check" size={12} color="#FFFFFF" />}
                            </View>

                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[styles.menuOptionName, { color: colors.textPrimary }]}>
                                  {item.name}
                                </Text>
                                <Text style={[styles.menuOptionPrice, { color: colors.primary }]}>
                                  ₹{item.price}
                                </Text>
                              </View>
                              <Text style={[styles.menuOptionDesc, { color: colors.textSecondary }]}>
                                {item.description} • {item.calories}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* 3. ANYTHING ELSE? (OPTIONAL) MULTILINE TEXT INPUT */}
                    <Text style={[styles.fieldTitle, { color: colors.textPrimary, marginTop: 14 }]}>
                      Anything else? (optional extra item)
                    </Text>
                    <TextInput
                      style={[
                        styles.notesInput,
                        {
                          backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC',
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="e.g. Extra Roti, Warm Water, Curd Cup, Salad Portion"
                      placeholderTextColor={colors.textMuted}
                      value={anythingElse}
                      onChangeText={setAnythingElse}
                      multiline
                      numberOfLines={3}
                      onFocus={() => {
                        setTimeout(() => {
                          modalScrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 150);
                      }}
                    />
                  </ScrollView>

                  {/* STEP 1 FOOTER: PROCEED TO PAYMENT */}
                  <View style={[styles.modalFooter, { borderTopColor: isDark ? colors.border : '#F1F5F9' }]}>
                    <TouchableOpacity
                      style={[styles.submitRequestBtn, { backgroundColor: colors.primary }]}
                      onPress={handleProceedToPayment}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.submitRequestBtnText}>
                        Proceed to Payment (₹{currentMealTotal})
                      </Text>
                      <AppIcon name="arrow-right" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* STEP 2: PAYMENT SELECTION (PAY NOW vs PAY LATER) */
                <>
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                    {/* ORDER SUMMARY BANNER */}
                    <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: isDark ? colors.border : '#BAE6FD' }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.summaryCardTitle, { color: colors.textPrimary }]}>Order Summary ({selectedMealType})</Text>
                        <Text style={[styles.summaryCardTotal, { color: colors.primary }]}>Total: ₹{currentMealTotal}</Text>
                      </View>
                      <Text style={[styles.summaryCardPatient, { color: colors.textSecondary }]}>
                        Patient: {activePatientName} ({activeBed})
                      </Text>
                      <View style={{ marginTop: 6, gap: 2 }}>
                        {selectedItems.map((it) => (
                          <Text key={it.id} style={[styles.summaryItemText, { color: colors.textSecondary }]}>
                            • {it.name} — ₹{it.price}
                          </Text>
                        ))}
                        {anythingElse.trim() ? (
                          <Text style={[styles.summaryItemText, { color: colors.primary, fontWeight: '700' }]}>
                            • {anythingElse.trim()} (Extra Custom Item)
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <Text style={[styles.fieldTitle, { color: colors.textPrimary, marginTop: 16 }]}>
                      Select Payment Method
                    </Text>

                    {/* PAYMENT OPTION 1: PAY NOW ONLINE */}
                    <TouchableOpacity
                      style={[
                        styles.payOptionRow,
                        paymentMode === 'pay_now' && { borderColor: colors.primary, borderWidth: 2 },
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      onPress={() => setPaymentMode('pay_now')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.payIconBox, { backgroundColor: colors.primaryLight }]}>
                        <AppIcon name="card" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.payOptionTitle, { color: colors.textPrimary }]}>
                          Pay Now Online (UPI / Cards / NetBanking)
                        </Text>
                        <Text style={[styles.payOptionSub, { color: colors.textSecondary }]}>
                          Instant kitchen confirmation + Bonus Health Points
                        </Text>
                      </View>
                      {paymentMode === 'pay_now' && <AppIcon name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>

                    {/* PAYMENT OPTION 2: PAY LATER AT COUNTER / BED DELIVERY */}
                    <TouchableOpacity
                      style={[
                        styles.payOptionRow,
                        paymentMode === 'pay_later' && { borderColor: colors.primary, borderWidth: 2 },
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      onPress={() => setPaymentMode('pay_later')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.payIconBox, { backgroundColor: colors.primaryLight }]}>
                        <AppIcon name="wallet" size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.payOptionTitle, { color: colors.textPrimary }]}>
                          Pay Later upon Bed Delivery
                        </Text>
                        <Text style={[styles.payOptionSub, { color: colors.textSecondary }]}>
                          Pay cash or UPI directly to cafeteria staff at Bed 304
                        </Text>
                      </View>
                      {paymentMode === 'pay_later' && <AppIcon name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  </ScrollView>

                  {/* STEP 2 FOOTER: SUBMIT & PLACE ORDER */}
                  <View style={[styles.modalFooter, { borderTopColor: isDark ? colors.border : '#F1F5F9' }]}>
                    <TouchableOpacity
                      style={[
                        styles.submitRequestBtn,
                        { backgroundColor: colors.primary },
                        isSubmitting && { opacity: 0.7 },
                      ]}
                      onPress={handleFinalSubmitOrder}
                      activeOpacity={0.85}
                      disabled={isSubmitting}
                    >
                      <AppIcon name="check" size={18} color="#FFFFFF" />
                      <Text style={styles.submitRequestBtnText}>
                        {isSubmitting
                          ? 'Placing Order...'
                          : `Confirm & ${paymentMode === 'pay_now' ? 'Pay Online (₹' + currentMealTotal + ')' : 'Pay Later (₹' + currentMealTotal + ')'}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* CELEBRATION REWARDS BLAST MODAL FOR PAY NOW ONLINE */}
        <Modal
          visible={showRewardBlastModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowRewardBlastModal(false);
            setActiveTab('self_order');
          }}
        >
          <View style={styles.transparentVictoryOverlay}>
            <TouchableOpacity
              style={[styles.victoryTopCloseBtn, { top: Math.max(insets.top + 10, 24) }]}
              onPress={() => {
                setShowRewardBlastModal(false);
                setActiveTab('self_order');
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <AppIcon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.imageRefVictoryScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.imageRefHeaderTitle}>
                Woohoo! You Won +15 Health Points as a Reward! 🎉
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
                Online Diet Payment Successful • Order Ref #{ordersHistory[0]?.orderId || 'ORD-2026-9042'}
              </Text>

              <Animated.View style={[styles.imageRefGraphicContainer, { transform: [{ scale: trophyScaleAnim }] }]}>
                <Image
                  source={IMAGES.rewardBlastGif}
                  fadeDuration={0}
                  style={styles.imageRefGiftBoxArt}
                  resizeMode="contain"
                />
              </Animated.View>

              <View style={styles.imageRefDetailsCard}>
                <View style={styles.victoryCardHeaderRow}>
                  <AppIcon name="check" size={18} color="#22C55E" />
                  <Text style={styles.imageRefRefText}>Order Confirmed & Sent to Kitchen</Text>
                </View>
                <View style={{ height: 1, backgroundColor: '#334155', marginVertical: 10 }} />
                <Text style={styles.imageRefMetaText}>Patient: {activePatientName} ({activeBed})</Text>
                <Text style={styles.imageRefMetaText}>Meal: {selectedMealType} ({selectedItems.map((m) => m.name).join(', ')})</Text>
                <Text style={styles.imageRefMetaText}>Amount Paid: ₹{currentMealTotal} (Paid via UPI / Card)</Text>

                <TouchableOpacity
                  style={styles.imageRefOrangeCloseBtn}
                  onPress={() => {
                    setShowRewardBlastModal(false);
                    setActiveTab('self_order');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.imageRefOrangeCloseBtnText}>View Order & Track Status</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
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

  // HEADER BAR
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
    fontSize: 18,
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
  ipTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ipTagText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // SWITCHER TAB BAR
  tabBarContainer: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // MAIN SCROLL CONTENT
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 14,
  },

  // PATIENT SUMMARY CARD
  patientSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientNameText: {
    fontSize: 16,
    fontWeight: '800',
  },
  relationBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0083B0',
  },
  patientSubText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  visitRefText: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },

  // DOCTOR PRESCRIBED BANNER
  doctorPrescribedCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  docIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescribedDoctorTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  prescribedSubText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calorieTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  calorieTargetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  calorieTargetPillText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  sodiumLimitText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  restrictionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  chipPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // MEAL SCHEDULE CARDS
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  mealCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  mealCalText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  mealItemsText: {
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '400',
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  // SELF ORDER TAB CARDS
  selfOrderHeaderRow: {
    marginBottom: 4,
  },
  orderDetailCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  orderTimeText: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  orderedItemsBox: {
    backgroundColor: 'rgba(241, 245, 249, 0.6)',
    padding: 10,
    borderRadius: 12,
    gap: 4,
  },
  itemsTitleText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  itemLineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaNoteTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaNoteVal: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountLabelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountValText: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // 4-STEP AUDIT TRAIL
  progressLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  progressStepCol: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 9.5,
    textAlign: 'center',
  },

  // FLOATING "ORDER NOW" FAB
  floatingBookTestBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  floatingBookTestText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },

  // 80% HEIGHT SLIDE-UP MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  slideUpCard: {
    height: '80%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 12,
  },
  sheetHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingBottom: 24,
  },
  fieldTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mealChipBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealChipText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  menuItemsList: {
    gap: 10,
  },
  menuOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOptionName: {
    fontSize: 14,
    fontWeight: '800',
  },
  menuOptionPrice: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  menuOptionDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  notesInput: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalFooter: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  submitRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    elevation: 3,
  },
  submitRequestBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // PAYMENT STEP STYLES
  summaryCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  summaryCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  summaryCardTotal: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  summaryCardPatient: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  payOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 12,
  },
  payIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payOptionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  payOptionSub: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },

  // CELEBRATION REWARDS BLAST OVERLAY STYLES
  transparentVictoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.95)',
    justifyContent: 'center',
    paddingTop: 40,
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  imageRefHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  imageRefGraphicContainer: {
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  imageRefGiftBoxArt: {
    width: '100%',
    height: '100%',
  },
  imageRefDetailsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    width: '100%',
    marginTop: 10,
  },
  victoryCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageRefRefText: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '700',
  },
  imageRefMetaText: {
    fontSize: 12.5,
    color: '#CBD5E1',
    marginBottom: 6,
  },
  imageRefOrangeCloseBtn: {
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    marginTop: 10,
    elevation: 4,
  },
  imageRefOrangeCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default DietScreen;
