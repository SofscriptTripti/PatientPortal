import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Alert,
  useWindowDimensions,
  BackHandler,
  Modal,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import UniversalLoader from './UniversalLoader';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface CareTicket {
  id: string;
  type: 'Complaint' | 'Feedback';
  department: string;
  subject: string;
  description: string;
  date: string;
  status: 'Registered' | 'In Progress' | 'Resolved';
  resolutionTime: string;
}

const INITIAL_TICKETS: CareTicket[] = [
  {
    id: 'CARE-892104',
    type: 'Complaint',
    department: 'Lab & Diagnostics',
    subject: 'Delay in blood test report download',
    description: 'Sample was collected yesterday morning but report is not reflected in reports tab.',
    date: 'Yesterday',
    status: 'In Progress',
    resolutionTime: 'Est. 4 hours',
  },
  {
    id: 'CARE-741029',
    type: 'Feedback',
    department: 'Doctor Consultation',
    subject: 'Excellent assistance by OPD nursing staff',
    description: 'Dr. Chakravarthi and OPD team were extremely patient and supportive.',
    date: '12 Sep 2026',
    status: 'Resolved',
    resolutionTime: 'Resolved',
  },
];

const DEPARTMENTS = [
  'Doctor Consultation',
  'Billing & Accounts',
  'Pharmacy',
  'Lab & Diagnostics',
  'Nursing & Ward Care',
  'App & Portal Support',
  'Hospital Cleanliness',
  'Other',
];

interface CareScreenProps {
  userSession: UserSession;
  onBack: () => void;
  onOpenHome: () => void;
  onOpenVisits: () => void;
  onOpenReports: () => void;
  onOpenPatientList?: () => void;
}

export const CareScreen: React.FC<CareScreenProps> = ({
  userSession,
  onBack,
  onOpenHome,
  onOpenVisits,
  onOpenReports,
  onOpenPatientList,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { isDark, colors } = useTheme();

  const scrollViewRef = React.useRef<any>(null);

  // Form State
  const [ticketType, setTicketType] = useState<'Complaint' | 'Feedback' | ''>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [customDept, setCustomDept] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [contactNo, setContactNo] = useState(userSession.mobileNumber || '');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Attachment Modal State
  const [showAttachModal, setShowAttachModal] = useState(false);

  // Helper to trigger real file / camera picker in Web/Browser DOM environments
  const triggerBrowserPicker = (acceptType: string, isCamera?: boolean): boolean => {
    const doc = (globalThis as any).document;
    if (doc && doc.createElement) {
      try {
        const input = doc.createElement('input');
        input.type = 'file';
        input.accept = acceptType;
        if (isCamera) {
          input.setAttribute('capture', 'environment');
        }
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            setAttachedFile(file.name);
          }
        };
        doc.body.appendChild(input);
        input.click();
        doc.body.removeChild(input);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  // 1. EXECUTE CAMERA WITH ANDROID SYSTEM PERMISSION
  const executeCameraWithPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Patient Portal Camera Permission',
            message: 'Patient Portal requires camera access to take photos of receipts and proof documents.',
            buttonPositive: 'Allow Access',
            buttonNegative: 'Deny',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
          return;
        }
      }

      const g = globalThis as any;
      if (Platform.OS === 'web' || (g.document && g.window)) {
        triggerBrowserPicker('image/*', true);
        return;
      }

      const ImagePicker = require('react-native-image-picker');
      const launch = ImagePicker.launchCamera || ImagePicker.default?.launchCamera;
      if (launch) {
        const result = await launch({
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: true,
        });

        if (result && !result.didCancel && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          const name = file.fileName || file.uri?.split('/').pop() || 'Camera_Photo.jpg';
          setAttachedFile(name);
        }
      } else {
        triggerBrowserPicker('image/*', true);
      }
    } catch (err: any) {
      triggerBrowserPicker('image/*', true);
    }
  };

  // 2. EXECUTE GALLERY WITH ANDROID SYSTEM PERMISSION
  const executeGalleryWithPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission, {
          title: 'Patient Portal Gallery Permission',
          message: 'Patient Portal requires access to your photo library to attach proof photos.',
          buttonPositive: 'Allow Access',
          buttonNegative: 'Deny',
        });
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Storage permission is required to select photos from gallery.');
          return;
        }
      }

      const g = globalThis as any;
      if (Platform.OS === 'web' || (g.document && g.window)) {
        triggerBrowserPicker('image/*');
        return;
      }

      const ImagePicker = require('react-native-image-picker');
      const launch = ImagePicker.launchImageLibrary || ImagePicker.default?.launchImageLibrary;
      if (launch) {
        const result = await launch({
          mediaType: 'photo',
          quality: 0.8,
        });

        if (result && !result.didCancel && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          const name = file.fileName || file.uri?.split('/').pop() || 'Gallery_Photo.jpg';
          setAttachedFile(name);
        }
      } else {
        triggerBrowserPicker('image/*');
      }
    } catch (err: any) {
      triggerBrowserPicker('image/*');
    }
  };

  // 3. EXECUTE FILE EXPLORER WITH ANDROID SYSTEM PERMISSION
  const executeDocumentWithPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Patient Portal Storage Permission',
            message: 'Patient Portal requires storage access to pick documents and receipts.',
            buttonPositive: 'Allow Access',
            buttonNegative: 'Deny',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Storage permission is required to pick documents.');
          return;
        }
      }

      const g = globalThis as any;
      if (Platform.OS === 'web' || (g.document && g.window)) {
        triggerBrowserPicker('.pdf,.doc,.docx,.jpg,.png');
        return;
      }

      const { pick, types } = require('@react-native-documents/picker');
      const results = await pick({
        type: [types.pdf, types.images, types.doc, types.docx, types.allFiles],
      });
      const res = results && results[0];
      if (res) {
        setAttachedFile(res.name || res.uri.split('/').pop() || 'Selected_Document.pdf');
      }
    } catch (err: any) {
      const { isErrorWithCode, errorCodes } = require('@react-native-documents/picker');
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      triggerBrowserPicker('.pdf,.doc,.docx,.jpg,.png');
    }
  };

  // Tickets List State
  const [tickets, setTickets] = useState<CareTicket[]>(INITIAL_TICKETS);

  // Validation Errors state
  const [errors, setErrors] = useState<{
    ticketType?: string;
    selectedDept?: string;
    customDept?: string;
    subject?: string;
    description?: string;
    contactNo?: string;
  }>({});

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Ticket Created Success Modal
  const [submittedTicket, setSubmittedTicket] = useState<CareTicket | null>(null);

  const handleSubmitCareForm = () => {
    // 1. Request Type (Complaint or Feedback)
    if (!ticketType) {
      setErrors({ ticketType: 'Please select a request type (Complaint or Feedback).' });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // 2. Concerned Department
    if (!selectedDept) {
      setErrors({ selectedDept: 'Please select a concerned department.' });
      scrollViewRef.current?.scrollTo({ y: 80, animated: true });
      return;
    } else if (selectedDept === 'Other' && !customDept.trim()) {
      setErrors({ customDept: 'Please specify the custom department name.' });
      scrollViewRef.current?.scrollTo({ y: 140, animated: true });
      return;
    }

    // 3. Subject Title
    if (!subject.trim()) {
      setErrors({ subject: 'Please enter a subject or short title.' });
      scrollViewRef.current?.scrollTo({ y: 220, animated: true });
      return;
    }

    // 4. Description
    if (!description.trim()) {
      setErrors({ description: 'Please provide detailed complaint or feedback.' });
      scrollViewRef.current?.scrollTo({ y: 320, animated: true });
      return;
    }

    // 5. Contact Mobile Number
    const cleanContact = contactNo.trim();
    if (!cleanContact) {
      setErrors({ contactNo: 'Contact Mobile Number is required.' });
      scrollViewRef.current?.scrollTo({ y: 440, animated: true });
      return;
    } else if (cleanContact.length < 10) {
      setErrors({ contactNo: 'Please enter a valid 10-digit mobile number.' });
      scrollViewRef.current?.scrollTo({ y: 440, animated: true });
      return;
    }

    setErrors({});

    const finalDepartment = selectedDept === 'Other' ? (customDept.trim() || 'Other') : selectedDept;

    setLoaderState({
      visible: true,
      message: `Submitting ${ticketType}...`,
      subtitle: 'Linking request with Patient Support Helpdesk',
    });

    setTimeout(() => {
      setLoaderState({ visible: false });

      const newTicket: CareTicket = {
        id: `CARE-${Math.floor(100000 + Math.random() * 900000)}`,
        type: ticketType as 'Complaint' | 'Feedback',
        department: finalDepartment,
        subject: subject.trim(),
        description: description.trim(),
        date: 'Today',
        status: 'Registered',
        resolutionTime: 'Within 24 hours',
      };

      setTickets((prev) => [newTicket, ...prev]);
      setSubmittedTicket(newTicket);

      // Reset Form
      setTicketType('');
      setSelectedDept('');
      setCustomDept('');
      setSubject('');
      setDescription('');
      setAttachedFile(null);
    }, 750);
  };

  useEffect(() => {
    const onBackPress = () => {
      onBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onBack]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* AMBIENT BACKGROUND GRAPHICS */}
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

        {/* TOP HEADER BAR: TITLE CARE */}
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
              Care
            </Text>
          </View>

          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        {/* MAIN SCROLLABLE CONTENT AREA */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.mainScrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: isTablet ? 20 : 16,
              paddingTop: isTablet ? 16 : 14,
              paddingBottom: insets.bottom + 110,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* HELPDESK EMERGENCY CALL BANNER */}
          <View style={[styles.helpBannerCard, { backgroundColor: isDark ? colors.surfaceVariant : '#F0F9FF', borderColor: '#BAE6FD' }]}>
            <View style={styles.helpBannerHeaderRow}>
              <View style={styles.helpBannerIconWrap}>
                <AppIcon name="care" size={22} color="#0083B0" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.helpBannerTitle, { color: colors.textPrimary }]}>
                  Patient Care & Helpdesk
                </Text>
                <Text style={[styles.helpBannerSub, { color: colors.textSecondary }]}>
                  We are available 24/7 to resolve your complaints and assist your hospital needs.
                </Text>
              </View>
            </View>

            <View style={styles.emergencyPillsRow}>
              <TouchableOpacity
                style={styles.emergencyPill}
                onPress={() => Alert.alert('Helpline Call', 'Dialing Toll-Free Help Desk: 1800-108-9999')}
                activeOpacity={0.8}
              >
                <AppIcon name="phone" size={13} color="#FFFFFF" />
                <Text style={styles.emergencyPillText}>Toll Free: 1800-108-9999</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.emergencyPill, { backgroundColor: '#DC2626' }]}
                onPress={() => Alert.alert('Emergency Care', 'Dialing Emergency Response Team: 108')}
                activeOpacity={0.8}
              >
                <AppIcon name="pulse" size={13} color="#FFFFFF" />
                <Text style={styles.emergencyPillText}>Emergency: 108</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FORM CARD CONTAINER: REGISTER COMPLAINT / FEEDBACK */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formCardTitle, { color: colors.textPrimary }]}>
              Submit Complaint or Feedback
            </Text>

            {/* 1. TYPE SELECTOR: COMPLAINT vs FEEDBACK (NO ICONS, ONLY TEXT) */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Select Request Type <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.typePillRow,
                  errors.ticketType
                    ? { borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 14, padding: 4, backgroundColor: '#FEF2F2' }
                    : undefined,
                ]}
              >
                {(
                  [
                    { id: 'Complaint', label: 'Complaint', activeColor: '#0083B0' },
                    { id: 'Feedback', label: 'Feedback', activeColor: '#0083B0' },
                  ] as const
                ).map((item) => {
                  const isSelected = ticketType === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.typePillBtn,
                        isSelected
                          ? { backgroundColor: item.activeColor, borderColor: item.activeColor }
                          : { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9', borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setTicketType(item.id);
                        clearError('ticketType');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typePillText,
                          isSelected ? styles.typePillTextActive : { color: colors.textSecondary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.ticketType ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.ticketType}</Text>
                </View>
              ) : null}
            </View>

            {/* 2. DEPARTMENT CHIP SELECTOR */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Concerned Department <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={
                  errors.selectedDept
                    ? { borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 14, padding: 6, backgroundColor: '#FEF2F2' }
                    : undefined
                }
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.deptChipScroll}
                >
                  {DEPARTMENTS.map((deptItem) => {
                    const isSelected = selectedDept === deptItem;
                    return (
                      <TouchableOpacity
                        key={deptItem}
                        style={[
                          styles.deptChip,
                          isSelected
                            ? styles.deptChipActive
                            : { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9', borderColor: colors.border },
                        ]}
                        onPress={() => {
                          setSelectedDept(deptItem);
                          clearError('selectedDept');
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.deptChipText,
                            isSelected ? styles.deptChipTextActive : { color: colors.textSecondary },
                          ]}
                        >
                          {deptItem}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              {errors.selectedDept ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.selectedDept}</Text>
                </View>
              ) : null}

              {/* CUSTOM DEPARTMENT INPUT IF 'OTHER' IS SELECTED */}
              {selectedDept === 'Other' ? (
                <View style={{ marginTop: 10 }}>
                  <View
                    style={[
                      styles.inputContainer,
                      { backgroundColor: errors.customDept ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                      { borderColor: errors.customDept ? '#EF4444' : colors.border },
                      errors.customDept ? { borderWidth: 1.8 } : undefined,
                    ]}
                  >
                    <AppIcon name="edit" size={18} color={errors.customDept ? '#EF4444' : '#0083B0'} />
                    <TextInput
                      style={[styles.textInput, { color: colors.textPrimary }]}
                      placeholder="Specify department name (e.g. ICU, Pediatrics, OPD Desk)"
                      placeholderTextColor={colors.textMuted}
                      value={customDept}
                      onChangeText={(text) => {
                        setCustomDept(text);
                        clearError('customDept');
                      }}
                    />
                  </View>
                  {errors.customDept ? (
                    <View style={styles.errorInlineRow}>
                      <AppIcon name="alert-circle" size={13} color="#EF4444" />
                      <Text style={styles.errorInlineText}>{errors.customDept}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* 3. SUBJECT / ISSUE TITLE */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Subject / Short Title <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: errors.subject ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.subject ? '#EF4444' : colors.border },
                  errors.subject ? { borderWidth: 1.8 } : undefined,
                ]}
              >
                <AppIcon name="edit" size={18} color={errors.subject ? '#EF4444' : '#0083B0'} />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder={
                    ticketType === 'Complaint'
                      ? 'e.g. Delay in report download / billing issue'
                      : 'e.g. Great experience with OPD staff'
                  }
                  placeholderTextColor={colors.textMuted}
                  value={subject}
                  onChangeText={(text) => {
                    setSubject(text);
                    clearError('subject');
                  }}
                />
              </View>
              {errors.subject ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.subject}</Text>
                </View>
              ) : null}
            </View>

            {/* 4. DETAILED COMPLAINT / FEEDBACK DESCRIPTION */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Description / Detailed Message <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainerMultiline,
                  { backgroundColor: errors.description ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.description ? '#EF4444' : colors.border },
                  errors.description ? { borderWidth: 1.8 } : undefined,
                ]}
              >
                <AppIcon name="document" size={18} color={errors.description ? '#EF4444' : '#0083B0'} style={{ marginTop: 2 }} />
                <TextInput
                  style={[styles.textInputMultiline, { color: colors.textPrimary }]}
                  placeholder="Please describe your complaint or feedback in detail..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    clearError('description');
                  }}
                />
              </View>
              {errors.description ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.description}</Text>
                </View>
              ) : null}
            </View>

            {/* 5. CONTACT MOBILE NUMBER */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Contact Mobile Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: errors.contactNo ? '#FEF2F2' : (isDark ? colors.surfaceVariant : '#F8FAFC') },
                  { borderColor: errors.contactNo ? '#EF4444' : colors.border },
                ]}
              >
                <View style={styles.countryPrefixBadge}>
                  <Text style={styles.countryPrefixText}>+91</Text>
                </View>
                <AppIcon name="phone" size={18} color="#0083B0" />
                <TextInput
                  style={[styles.textInput, { color: colors.textPrimary }]}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={contactNo}
                  onChangeText={(text) => {
                    setContactNo(text);
                    clearError('contactNo');
                  }}
                />
              </View>
              {errors.contactNo ? (
                <View style={styles.errorInlineRow}>
                  <AppIcon name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorInlineText}>{errors.contactNo}</Text>
                </View>
              ) : null}
            </View>

            {/* 6. ATTACH DOCUMENT / SCREENSHOT BUTTON */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                Attach Proof / Photo <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary }}>(Optional)</Text>
              </Text>
              <TouchableOpacity
                style={[styles.attachFileBtn, { borderColor: colors.border, backgroundColor: isDark ? colors.surfaceVariant : '#F8FAFC' }]}
                onPress={() => setShowAttachModal(true)}
                activeOpacity={0.8}
              >
                <AppIcon name="document" size={16} color="#0083B0" />
                <Text style={styles.attachFileBtnText}>
                  {attachedFile ? attachedFile : 'Attach File or Photo (Max 5MB)'}
                </Text>
                {attachedFile ? (
                  <TouchableOpacity
                    onPress={() => setAttachedFile(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <AppIcon name="close" size={16} color="#EF4444" />
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[
                styles.submitCareBtn,
                { backgroundColor: '#0083B0' },
              ]}
              onPress={handleSubmitCareForm}
              activeOpacity={0.88}
            >
              <AppIcon name="user-check" size={18} color="#FFFFFF" />
              <Text style={styles.submitCareBtnText}>
                Submit {ticketType ? ticketType : 'Request'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* PAST SUBMITTED COMPLAINTS & FEEDBACK TICKETS LIST */}
          <View style={styles.ticketsSectionHeader}>
            <Text style={[styles.ticketsSectionTitle, { color: colors.textPrimary }]}>
              Your Submitted Tickets ({tickets.length})
            </Text>
          </View>

          {tickets.map((t) => (
            <View
              key={t.id}
              style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.ticketTopRow}>
                <View
                  style={[
                    styles.ticketTypeBadge,
                    t.type === 'Complaint' && { backgroundColor: '#FEF2F2' },
                    t.type === 'Feedback' && { backgroundColor: '#DEF0FD' },
                  ]}
                >
                  <Text
                    style={[
                      styles.ticketTypeBadgeText,
                      t.type === 'Complaint' && { color: '#EF4444' },
                      t.type === 'Feedback' && { color: '#0083B0' },
                    ]}
                  >
                    {t.type}
                  </Text>
                </View>

                <View style={styles.ticketIdBadge}>
                  <Text style={styles.ticketIdText}>{t.id}</Text>
                </View>
              </View>

              <Text style={[styles.ticketSubject, { color: colors.textPrimary }]}>{t.subject}</Text>
              <Text style={[styles.ticketDesc, { color: colors.textSecondary }]}>{t.description}</Text>

              <View style={[styles.ticketBottomRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.ticketDeptText, { color: colors.textMuted }]}>
                  Dept: {t.department} · {t.date}
                </Text>
                <View
                  style={[
                    styles.ticketStatusPill,
                    t.status === 'In Progress' && { backgroundColor: '#FEF3C7' },
                    t.status === 'Resolved' && { backgroundColor: '#DCFCE7' },
                    t.status === 'Registered' && { backgroundColor: '#E0F2FE' },
                  ]}
                >
                  <Text
                    style={[
                      styles.ticketStatusText,
                      t.status === 'In Progress' && { color: '#D97706' },
                      t.status === 'Resolved' && { color: '#16A34A' },
                      t.status === 'Registered' && { color: '#0284C7' },
                    ]}
                  >
                    {t.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* FLOATING CURVY BOTTOM NAVIGATION BAR WITH CARE ACTIVE */}
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
            onPress={onOpenHome}
            activeOpacity={0.8}
          >
            <AppIcon name="home" size={isTablet ? 24 : 20} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 12.5 }]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Visits */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={onOpenVisits}
            activeOpacity={0.8}
          >
            <AppIcon name="calendar" size={isTablet ? 24 : 20} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 12.5 }]}>
              Visits
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Reports */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={onOpenReports}
            activeOpacity={0.8}
          >
            <AppIcon name="document" size={isTablet ? 24 : 20} color={colors.textMuted} />
            <Text style={[styles.navLabel, { color: colors.textMuted }, isTablet && { fontSize: 12.5 }]}>
              Reports
            </Text>
          </TouchableOpacity>

          {/* Tab 4: Care (ACTIVE HIGHLIGHT) */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <AppIcon name="care" size={isTablet ? 24 : 20} color="#0083B0" />
            <Text style={[styles.navLabel, { color: '#0083B0' }, styles.navLabelActive, isTablet && { fontSize: 12.5 }]}>
              Care
            </Text>
          </TouchableOpacity>
        </View>

        {/* DIRECT ATTACHMENT SOURCE PICKER (DOCUMENT vs CAMERA vs GALLERY) */}
        <Modal
          visible={showAttachModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAttachModal(false)}
        >
          <View style={styles.sheetBottomOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowAttachModal(false)} />
            <View style={[styles.waPhotoSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.waSheetHandleBar} />

              <Text style={[styles.waSheetTitle, { color: colors.textPrimary }]}>Attach Proof or Document</Text>
              <Text style={[styles.waSheetSub, { color: colors.textSecondary }]}>Choose attachment source:</Text>

              <View style={styles.waGridRow}>
                {/* 1. DOCUMENT / FILE OPTION */}
                <TouchableOpacity
                  style={styles.waGridBox}
                  onPress={() => {
                    setShowAttachModal(false);
                    executeDocumentWithPermission();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.waCircleBg, { backgroundColor: '#0083B0' }]}>
                    <AppIcon name="document" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.waCircleLabel, { color: colors.textPrimary }]}>Document</Text>
                </TouchableOpacity>

                {/* 2. CAMERA OPTION */}
                <TouchableOpacity
                  style={styles.waGridBox}
                  onPress={() => {
                    setShowAttachModal(false);
                    executeCameraWithPermission();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.waCircleBg, { backgroundColor: '#EC4899' }]}>
                    <AppIcon name="camera" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.waCircleLabel, { color: colors.textPrimary }]}>Camera</Text>
                </TouchableOpacity>

                {/* 3. GALLERY OPTION */}
                <TouchableOpacity
                  style={styles.waGridBox}
                  onPress={() => {
                    setShowAttachModal(false);
                    executeGalleryWithPermission();
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.waCircleBg, { backgroundColor: '#8B5CF6' }]}>
                    <AppIcon name="image" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.waCircleLabel, { color: colors.textPrimary }]}>Gallery</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.waCancelBtn, { backgroundColor: isDark ? colors.surfaceVariant : '#F1F5F9' }]}
                onPress={() => setShowAttachModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.waCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* TICKET SUBMITTED SUCCESS MODAL */}
        <Modal
          visible={!!submittedTicket}
          transparent
          animationType="fade"
          onRequestClose={() => setSubmittedTicket(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.successIconCircle}>
                <AppIcon name="check" size={28} color="#FFFFFF" />
              </View>

              <Text style={[styles.modalSuccessTitle, { color: colors.textPrimary }]}>
                {submittedTicket?.type} Registered!
              </Text>

              <View style={styles.ticketNumberBadge}>
                <Text style={styles.ticketNumberText}>
                  Ticket ID: {submittedTicket?.id}
                </Text>
              </View>

              <Text style={[styles.modalSuccessMsg, { color: colors.textSecondary }]}>
                Your {submittedTicket?.type.toLowerCase()} regarding "{submittedTicket?.subject}" has been successfully logged with our Patient Care team.
              </Text>

              <View style={styles.modalInfoBox}>
                <AppIcon name="clock" size={15} color="#0083B0" />
                <Text style={styles.modalInfoText}>
                  Expected Resolution: {submittedTicket?.resolutionTime}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSubmittedTicket(null)}
                activeOpacity={0.88}
              >
                <Text style={styles.modalCloseBtnText}>Done</Text>
              </TouchableOpacity>
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

  // HEADER BAR: CARE
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0083B0',
    letterSpacing: 0.5,
  },

  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // HELPDESK BANNER CARD
  helpBannerCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 16,
  },
  helpBannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpBannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DEF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  helpBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  helpBannerSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  emergencyPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  emergencyPill: {
    flex: 1,
    backgroundColor: '#0083B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5,
  },
  emergencyPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // FORM CARD
  formCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '800',
  },
  typePillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typePillBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  typePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  deptChipScroll: {
    gap: 8,
  },
  deptChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  deptChipActive: {
    backgroundColor: '#0083B0',
    borderColor: '#0083B0',
  },
  deptChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  deptChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 10,
  },
  countryPrefixBadge: {
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countryPrefixText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0083B0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  inputContainerMultiline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textInputMultiline: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    textAlignVertical: 'top',
  },

  attachFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  attachFileBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0083B0',
    flex: 1,
    marginLeft: 8,
  },

  submitCareBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  submitCareBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  errorInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingLeft: 2,
  },
  errorInlineText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },

  // TICKETS LIST
  ticketsSectionHeader: {
    marginBottom: 12,
  },
  ticketsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  ticketCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 12,
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ticketTypeBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  ticketIdBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ticketIdText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 10,
  },
  ticketBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  ticketDeptText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  ticketStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ticketStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // FLOATING BOTTOM NAVIGATION BAR
  bottomNavBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1.5,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  navLabelActive: {
    fontWeight: '800',
  },

  // ATTACHMENT SELECTION SHEET MODAL
  sheetModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
  },
  sheetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  attachOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 14,
  },
  attachOptionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachOptionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  attachOptionSub: {
    fontSize: 11.5,
    marginTop: 2,
  },

  // WHATSAPP-STYLE PHOTO SHEET
  sheetBottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  waPhotoSheet: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    padding: 20,
    alignItems: 'center',
  },
  waSheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 14,
  },
  waSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  waSheetSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 20,
  },
  waGridRow: {
    flexDirection: 'row',
    gap: 36,
    marginBottom: 20,
  },
  waGridBox: {
    alignItems: 'center',
  },
  waCircleBg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  waCircleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  waCancelBtn: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  waCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // SUCCESS MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalSuccessTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  ticketNumberBadge: {
    backgroundColor: '#DEF0FD',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  ticketNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0083B0',
  },
  modalSuccessMsg: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginBottom: 18,
  },
  modalInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0083B0',
  },
  modalCloseBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0083B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CareScreen;
