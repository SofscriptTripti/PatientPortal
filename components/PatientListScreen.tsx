import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { PatientMember, UserSession } from './types';
import { INITIAL_PATIENTS } from './mockData';
import UniversalLoader from './UniversalLoader';

interface PatientListScreenProps {
  userSession: UserSession;
  onLogout: () => void;
  onChangePin: () => void;
}

// Avatar mapping: Exact cartoon avatars matching reference mockup
const getAvatarSource = (patient: PatientMember) => {
  if (patient.id === '1' || patient.name.toLowerCase().includes('deepak')) {
    return require('../assets/images/avatar_deepak.png');
  }
  if (patient.id === '2' || patient.name.toLowerCase().includes('kavita')) {
    return require('../assets/images/avatar_kavita.png');
  }
  if (patient.id === '3' || patient.name.toLowerCase().includes('aarav')) {
    return require('../assets/images/avatar_aarav.png');
  }
  return patient.genderType === 'F'
    ? require('../assets/images/avatar_kavita.png')
    : require('../assets/images/avatar_deepak.png');
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
  onLogout,
  onChangePin,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  // Exactly 3 family members
  const [patients, setPatients] = useState<PatientMember[]>(INITIAL_PATIENTS.slice(0, 3));
  const [activeTab, setActiveTab] = useState<'Home' | 'Visits' | 'Reports' | 'Care' | 'Profile'>('Home');

  // Universal Loader state
  const [loaderState, setLoaderState] = useState<{
    visible: boolean;
    message?: string;
    subtitle?: string;
  }>({ visible: false });

  // Modals state
  const [selectedPatient, setSelectedPatient] = useState<PatientMember | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Add Member Form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Son');
  const [newSex, setNewSex] = useState<'M' | 'F'>('M');
  const [newAge, setNewAge] = useState('');
  const [newMobile, setNewMobile] = useState(userSession.mobileNumber || '73737377376');
  const [newPatientNo, setNewPatientNo] = useState('');

  // Quick Action Handler: Book Visit
  const handleQuickBookVisit = () => {
    setLoaderState({
      visible: true,
      message: 'Loading Doctor Visit Schedules...',
      subtitle: 'Connecting to hospital appointment desk',
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      Alert.alert(
        'Book Visit',
        'Please select a family member below or choose your doctor to schedule an OPD consultation.'
      );
    }, 600);
  };

  // Quick Action Handler: Pay Bills (Entypo wallet)
  const handleQuickPayBills = () => {
    setLoaderState({
      visible: true,
      message: 'Fetching Hospital Invoices...',
      subtitle: 'Accessing secure medical billing portal',
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      Alert.alert('Pay Bills', 'All hospital bills and pharmacy invoices are settled. No pending balance.');
    }, 600);
  };

  // Quick Action Handler: Diet (MaterialCommunityIcons food-apple)
  const handleQuickDiet = () => {
    setLoaderState({
      visible: true,
      message: 'Opening Clinical Nutrition...',
      subtitle: 'Loading personalized doctor diet recommendations',
    });
    setTimeout(() => {
      setLoaderState({ visible: false });
      Alert.alert('Diet & Nutrition', 'Personalized recovery diet plans and calorie tracking are up-to-date.');
    }, 600);
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
      Alert.alert('Book Visit', `Ready to book an appointment for ${patient.name} (Patient No: ${patient.patientNumber}).`);
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
    const avatarBg = getAvatarBg(item);

    return (
      <TouchableOpacity
        style={styles.patientCard}
        onPress={() => setSelectedPatient(item)}
        activeOpacity={0.88}
      >
        {/* Left: Avatar with pastel colored circular background */}
        <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
          <Image
            source={getAvatarSource(item)}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>

        {/* Right: Info Section */}
        <View style={styles.cardRightContent}>
          {/* Top Row: Name + Relation Pill + Chevron Arrow */}
          <View style={styles.cardTopRow}>
            <View style={styles.nameAndTagGroup}>
              <Text style={styles.cardPatientName} numberOfLines={1}>
                {item.name}
              </Text>
              {/* Relation with Green app theme bg and White text in ALL CAPS */}
              <View style={styles.relationTag}>
                <Text style={styles.relationTagText}>
                  {item.relation.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Circular Right Chevron Button */}
            <View style={styles.chevronCircle}>
              <AppIcon name="chevron-right" size={15} color="#008494" />
            </View>
          </View>

          {/* Bottom Row: 3 Columns with thin vertical dividers */}
          <View style={styles.threeColumnGrid}>
            {/* Col 1: Gender / Age */}
            <View style={styles.infoCol}>
              <Text style={styles.infoColLabel}>Gender / Age</Text>
              <Text style={styles.infoColValue} numberOfLines={1}>
                {item.sex === 'M' ? 'Male' : 'Female'} / {item.age}
              </Text>
            </View>

            <View style={styles.colDivider} />

            {/* Col 2: Patient No */}
            <View style={styles.infoCol}>
              <Text style={styles.infoColLabel}>Patient No</Text>
              <Text style={styles.infoColValue} numberOfLines={1}>
                {item.patientNumber}
              </Text>
            </View>

            <View style={styles.colDivider} />

            {/* Col 3: Mobile No */}
            <View style={styles.infoCol}>
              <Text style={styles.infoColLabel}>Mobile No</Text>
              <Text style={styles.infoColValue} numberOfLines={1}>
                {item.mobileNumber}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // User initial for top avatar
  const userInitial = (userSession.name && userSession.name.trim().charAt(0).toUpperCase()) || 'D';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* 1. PROPER HEADER: White background, subtle bottom border & shadow */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeftGroup}>
            <Text style={styles.headerTitle}>
              <Text style={styles.headerTitleNavy}>Patient </Text>
              <Text style={styles.headerTitleTeal}>Portal</Text>
            </Text>
            <Text style={styles.headerSubtitle}>Care Today. Healthier Tomorrow.</Text>
          </View>

          <View style={styles.headerRightGroup}>
            {/* Notification Bell with Red Badge Dot */}
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => setShowContactModal(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppIcon name="bell" size={22} color="#0284C7" />
              <View style={styles.bellBadgeDot} />
            </TouchableOpacity>

            {/* Profile Avatar Circle with User Initial */}
            <TouchableOpacity
              style={styles.profileInitialCircle}
              onPress={() => setShowProfileMenu(true)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.profileInitialText}>{userInitial}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
            isTablet && { maxWidth: 640, alignSelf: 'center', width: '100%' },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. 4 FEATURE ICONS ROW: No borders around or between, distributed equally */}
          <View style={styles.featureRowContainer}>
            {/* 1. Book Visit */}
            <TouchableOpacity
              style={styles.featureCol}
              onPress={handleQuickBookVisit}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconWrapper}>
                <AppIcon name="calendar" size={28} color="#00A896" />
              </View>
              <Text style={styles.featureLabel}>Book Visit</Text>
            </TouchableOpacity>

            {/* 2. Pay Bills: wallet from Entypo */}
            <TouchableOpacity
              style={styles.featureCol}
              onPress={handleQuickPayBills}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconWrapper}>
                <AppIcon name="wallet" size={27} color="#00A896" />
              </View>
              <Text style={styles.featureLabel}>Pay Bills</Text>
            </TouchableOpacity>

            {/* 3. Diet: food-apple from MaterialCommunityIcons */}
            <TouchableOpacity
              style={styles.featureCol}
              onPress={handleQuickDiet}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconWrapper}>
                <AppIcon name="food-apple" size={28} color="#00A896" />
              </View>
              <Text style={styles.featureLabel}>Diet</Text>
            </TouchableOpacity>

            {/* 4. Add Member: person-add from Ionicons */}
            <TouchableOpacity
              style={styles.featureCol}
              onPress={() => setShowAddMemberModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconWrapper}>
                <AppIcon name="person-add" size={28} color="#00A896" />
              </View>
              <Text style={styles.featureLabel}>Add Member</Text>
            </TouchableOpacity>
          </View>

          {/* 3. SECTION TITLE ROW: "Your Family Members (3)" without Add Member icon */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleText}>
              Your Family Members ({patients.length})
            </Text>
          </View>

          {/* 4. LIST OF EXACTLY 3 FAMILY PATIENT CARDS */}
          {patients.slice(0, 3).map((item) => (
            <View key={item.id}>{renderPatientCard({ item })}</View>
          ))}
        </ScrollView>

        {/* 5. FIXED FLOATING BOTTOM NAVIGATION BAR */}
        <View
          style={[
            styles.bottomNavBar,
            { paddingBottom: Math.max(insets.bottom, 10) },
          ]}
        >
          {/* Tab 1: Home */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => setActiveTab('Home')}
            activeOpacity={0.8}
          >
            <AppIcon name="home" size={24} color={activeTab === 'Home' ? '#00A896' : '#8E9CAE'} />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Home' ? styles.navLabelActive : styles.navLabelInactive,
              ]}
            >
              Home
            </Text>
            {activeTab === 'Home' ? <View style={styles.activeTabIndicator} /> : <View style={styles.tabIndicatorPlaceholder} />}
          </TouchableOpacity>

          {/* Tab 2: Visits */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => {
              setActiveTab('Visits');
              handleQuickBookVisit();
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="calendar" size={23} color={activeTab === 'Visits' ? '#00A896' : '#8E9CAE'} />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Visits' ? styles.navLabelActive : styles.navLabelInactive,
              ]}
            >
              Visits
            </Text>
            {activeTab === 'Visits' ? <View style={styles.activeTabIndicator} /> : <View style={styles.tabIndicatorPlaceholder} />}
          </TouchableOpacity>

          {/* Tab 3: Reports */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => {
              setActiveTab('Reports');
              if (patients.length > 0) handleViewReportsForPatient(patients[0]);
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="document" size={23} color={activeTab === 'Reports' ? '#00A896' : '#8E9CAE'} />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Reports' ? styles.navLabelActive : styles.navLabelInactive,
              ]}
            >
              Reports
            </Text>
            {activeTab === 'Reports' ? <View style={styles.activeTabIndicator} /> : <View style={styles.tabIndicatorPlaceholder} />}
          </TouchableOpacity>

          {/* Tab 4: Care */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => {
              setActiveTab('Care');
              setShowContactModal(true);
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="care" size={23} color={activeTab === 'Care' ? '#00A896' : '#8E9CAE'} />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Care' ? styles.navLabelActive : styles.navLabelInactive,
              ]}
            >
              Care
            </Text>
            {activeTab === 'Care' ? <View style={styles.activeTabIndicator} /> : <View style={styles.tabIndicatorPlaceholder} />}
          </TouchableOpacity>

          {/* Tab 5: Profile */}
          <TouchableOpacity
            style={styles.navTab}
            onPress={() => {
              setActiveTab('Profile');
              setShowProfileMenu(true);
            }}
            activeOpacity={0.8}
          >
            <AppIcon name="user-outline" size={23} color={activeTab === 'Profile' ? '#00A896' : '#8E9CAE'} />
            <Text
              style={[
                styles.navLabel,
                activeTab === 'Profile' ? styles.navLabelActive : styles.navLabelInactive,
              ]}
            >
              Profile
            </Text>
            {activeTab === 'Profile' ? <View style={styles.activeTabIndicator} /> : <View style={styles.tabIndicatorPlaceholder} />}
          </TouchableOpacity>
        </View>
      </View>

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
                <Text style={styles.actionText}>Book Doctor Visit</Text>
                <Text style={styles.actionSubtext}>Select specialist & consultation slot</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                if (selectedPatient) handleViewReportsForPatient(selectedPatient);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E8FAF6' }]}>
                <AppIcon name="document" size={20} color="#00A896" />
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
              <View style={[styles.contactIconBg, { backgroundColor: '#E8FAF6' }]}>
                <AppIcon name="shield-check" size={20} color="#00A896" />
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

      {/* MODAL: PROFILE SETTINGS */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Settings</Text>
              <TouchableOpacity onPress={() => setShowProfileMenu(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.userProfileHeader}>
              <View style={styles.profileModalAvatar}>
                <Text style={styles.profileModalAvatarText}>{userInitial}</Text>
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.profileName}>{userSession.name || 'Deepak Chouhan'}</Text>
                <Text style={styles.profilePhone}>+91 {userSession.mobileNumber || '73737377373'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowProfileMenu(false);
                onChangePin();
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#DEF0FD' }]}>
                <AppIcon name="key" size={20} color="#0284C7" />
              </View>
              <Text style={styles.actionText}>Change Security PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowProfileMenu(false);
                setShowContactModal(true);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E8FAF6' }]}>
                <AppIcon name="phone" size={20} color="#00A896" />
              </View>
              <Text style={styles.actionText}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowProfileMenu(false);
                Alert.alert('Log Out', 'Are you sure you want to log out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log Out', style: 'destructive', onPress: onLogout },
                ]);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#FEF2F2' }]}>
                <AppIcon name="logout" size={20} color="#DC2626" />
              </View>
              <Text style={[styles.actionText, { color: '#DC2626' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
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
  },

  // 1. PROPER TOP HEADER BAR (with border and crisp background)
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerLeftGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 23,
    letterSpacing: -0.4,
  },
  headerTitleNavy: {
    fontWeight: '800',
    color: '#0F172A',
  },
  headerTitleTeal: {
    fontWeight: '800',
    color: '#00A896',
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  },
  cardPatientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#008494',
    letterSpacing: -0.2,
  },
  // Relation Tag with Green app theme background and White bold text in ALL CAPS
  relationTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#00A896',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relationTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 100,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  navLabelActive: {
    fontWeight: '700',
    color: '#00A896',
  },
  navLabelInactive: {
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabIndicator: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00A896',
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
    backgroundColor: '#00A896',
    borderColor: '#00A896',
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
    backgroundColor: '#00A896',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#00A896',
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
});

export default PatientListScreen;
