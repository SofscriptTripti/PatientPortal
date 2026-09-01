import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { PatientMember, UserSession } from './types';
import { INITIAL_PATIENTS } from './mockData';

interface PatientListScreenProps {
  userSession: UserSession;
  onLogout: () => void;
  onChangePin: () => void;
}

// Avatar mapping: Female -> avatar_female.png, Male -> avatar_male.png
const getAvatarSource = (genderType: 'M' | 'F') => {
  return genderType === 'F'
    ? require('../assets/images/avatar_female.png')
    : require('../assets/images/avatar_male.png');
};

export const PatientListScreen: React.FC<PatientListScreenProps> = ({
  userSession,
  onLogout,
  onChangePin,
}) => {
  const insets = useSafeAreaInsets();
  const [patients, setPatients] = useState<PatientMember[]>(INITIAL_PATIENTS);

  // Modals state
  const [selectedPatient, setSelectedPatient] = useState<PatientMember | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddExistingModal, setShowAddExistingModal] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Add Existing Form
  const [existPatientNo, setExistPatientNo] = useState('');
  const [existMobile, setExistMobile] = useState('');
  const [existRelation, setExistRelation] = useState('Relative');
  const [existGender, setExistGender] = useState<'M' | 'F'>('M');

  // New Member Form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Child');
  const [newSex, setNewSex] = useState<'M' | 'F'>('M');
  const [newAge, setNewAge] = useState('');
  const [newMarital] = useState('Single');
  const [newMobile, setNewMobile] = useState(userSession.mobileNumber || '9819863084');

  // Add Existing Member Handler
  const handleAddExisting = () => {
    if (!existPatientNo.trim() && !existMobile.trim()) {
      Alert.alert('Details Required', 'Please enter either Patient Number (UHID) or Mobile Number.');
      return;
    }

    const newMember: PatientMember = {
      id: Date.now().toString(),
      name: `MEMBER ${existPatientNo || 'ACCOUNT'}`,
      relation: existRelation,
      sex: existGender,
      age: '28yrs',
      maritalStatus: 'Married',
      registrationStatus: 'Registered',
      mobileNumber: existMobile.trim() || userSession.mobileNumber || '9819863084',
      patientNumber: existPatientNo.trim() || Math.floor(1000000 + Math.random() * 9000000).toString(),
      genderType: existGender,
    };

    setPatients((prev) => [newMember, ...prev]);
    setShowAddExistingModal(false);
    setExistPatientNo('');
    setExistMobile('');
    Alert.alert('Success', 'Existing family member account linked successfully!');
  };

  // Add New Member Handler
  const handleAddNewMember = () => {
    if (!newName.trim()) {
      Alert.alert('Name Required', 'Please enter member full name.');
      return;
    }
    if (!newAge.trim()) {
      Alert.alert('Age Required', 'Please enter member age.');
      return;
    }

    const ageNum = parseInt(newAge, 10);
    const newMember: PatientMember = {
      id: Date.now().toString(),
      name: newName.trim().toUpperCase(),
      relation: newRelation,
      sex: newSex,
      age: `${newAge.trim()}yrs`,
      maritalStatus: ageNum < 18 ? '' : newMarital,
      registrationStatus: 'Registered',
      mobileNumber: newMobile.trim() || '9819863084',
      patientNumber: Math.floor(1000000 + Math.random() * 9000000).toString(),
      genderType: newSex,
    };

    setPatients((prev) => [newMember, ...prev]);
    setShowNewMemberModal(false);
    setNewName('');
    setNewAge('');
    Alert.alert('Success', `${newName.trim()} has been registered and added to your family.`);
  };

  // Remove/Unlink Member Handler
  const handleRemoveMember = (patientId: string) => {
    Alert.alert(
      'Unlink Member',
      'Are you sure you want to remove this member from your linked family accounts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: () => {
            setPatients((prev) => prev.filter((p) => p.id !== patientId));
            setSelectedPatient(null);
            Alert.alert('Unlinked', 'Member unlinked from family list.');
          },
        },
      ]
    );
  };

  // Render individual Patient Card inside the curved parent container
  const renderPatientCard = ({ item }: { item: PatientMember }) => {
    return (
      <View style={styles.cardContainer}>
        {/* Left Column: Avatar + Green "Registered" Badge */}
        <View style={styles.leftColumn}>
          <View style={styles.avatarCircle}>
            <Image
              source={getAvatarSource(item.genderType)}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.registeredBadge}>
            <AppIcon name="check" size={12} color="#16A34A" />
            <Text style={styles.registeredBadgeText}>Registered</Text>
          </View>
        </View>

        {/* Right Column: Name + 4 Detail Rows */}
        <View style={styles.rightColumn}>
          {/* Top Row: Name and Three Dots */}
          <View style={styles.nameHeaderRow}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={styles.dotsButton}
              onPress={() => setSelectedPatient(item)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <AppIcon name="dots-horizontal" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* 4 Detail Rows matching the reference screenshot */}
          <View style={styles.detailsGrid}>
            {/* Row 1: Sex, Age, Marital Status */}
            <View style={styles.detailRow}>
              <View style={styles.iconCell}>
                <AppIcon name="user" size={16} color="#1D61E7" />
              </View>
              <Text style={styles.detailLabel}>Sex, Age, Marital Status</Text>
              <Text style={styles.detailValue}>
                {item.sex}, {item.age}{item.maritalStatus ? `, ${item.maritalStatus}` : ','}
              </Text>
            </View>

            {/* Row 2: Registration Status */}
            <View style={styles.detailRow}>
              <View style={styles.iconCell}>
                <AppIcon name="shield-check" size={16} color="#1D61E7" />
              </View>
              <Text style={styles.detailLabel}>Registration Status</Text>
              <Text style={[styles.detailValue, styles.statusRegisteredText]}>
                {item.registrationStatus}
              </Text>
            </View>

            {/* Row 3: Mobile Number */}
            <View style={styles.detailRow}>
              <View style={styles.iconCell}>
                <AppIcon name="phone" size={16} color="#1D61E7" />
              </View>
              <Text style={styles.detailLabel}>Mobile Number</Text>
              <Text style={[styles.detailValue, styles.mobileNumberText]}>
                {item.mobileNumber}
              </Text>
            </View>

            {/* Row 4: Patient Number */}
            <View style={styles.detailRow}>
              <View style={styles.iconCell}>
                <AppIcon name="patient-id" size={16} color="#1D61E7" />
              </View>
              <Text style={styles.detailLabel}>Patient Number</Text>
              <Text style={[styles.detailValue, styles.patientNumberText]}>
                {item.patientNumber}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      {/* 1. TOP HEADER SECTION WITH LARGER HEIGHT & CENTERED SPACING */}
      <View style={styles.headerContainer}>
        {/* Top bar with Contact Us button */}
        <View style={styles.headerTopBar}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.contactUsBtn}
            onPress={() => setShowContactModal(true)}
            activeOpacity={0.85}
          >
            <AppIcon name="phone" size={15} color="#1D61E7" />
            <Text style={styles.contactUsText}>Contact Us</Text>
          </TouchableOpacity>

         
        </View>

        {/* Header Content Row: Big Title (Single Line) + Big 3D Family Artwork */}
        <View style={styles.headerContentRow}>
          {/* Left Title: Single Line "Your Family Members" */}
          <View style={styles.headerTitlesCol}>
            <Text style={styles.titleSingleLine}>
              Your Family <Text style={styles.titleBlue}>Members</Text>
            </Text>
            <Text style={styles.headerSubtitle}>
              Manage and view linked{'\n'}family accounts
            </Text>
          </View>

          {/* Right Big 3D Family Photo */}
          <View style={styles.bannerArtContainer}>
            <Image
              source={require('../assets/images/family_banner.png')}
              style={styles.headerBannerArt}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* 2. PARENT SECTION WITH CURVED TOP BORDER ENCLOSING PATIENT LIST */}
      <View style={styles.curvedParentSection}>
        {/* SCROLLABLE PATIENTS LIST INSIDE CURVED PARENT */}
        <FlatList
          data={patients}
          renderItem={renderPatientCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 145 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* 3. STICKY BOTTOM ACTION BAR WITH PURPLE "ADD EXISTING MEMBER" BUTTON */}
      <View
        style={[
          styles.stickyBottomContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 },
        ]}
      >
        <View style={styles.buttonsRow}>
          {/* Add Existing Member Button (Purple styling matching reference image) */}
          <TouchableOpacity
            style={styles.addExistingBtnPurple}
            onPress={() => setShowAddExistingModal(true)}
            activeOpacity={0.85}
          >
            <AppIcon name="user-plus" size={20} color="#7C3AED" />
            <Text style={styles.addExistingBtnTextPurple}>Add Existing Member</Text>
          </TouchableOpacity>

          {/* New Member Button (Solid vibrant blue) */}
          <TouchableOpacity
            style={styles.newMemberBtn}
            onPress={() => setShowNewMemberModal(true)}
            activeOpacity={0.85}
          >
            <AppIcon name="user-plus" size={20} color="#FFFFFF" />
            <Text style={styles.newMemberBtnText}>New Member</Text>
          </TouchableOpacity>
        </View>

    
      </View>

      {/* CONTACT US MODAL */}
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
                <AppIcon name="hospital" size={24} color="#1D61E7" />
                <Text style={[styles.modalTitle, { marginLeft: 8 }]}>Bethany Hospitals</Text>
              </View>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              We are available 24/7 for you and your family.
            </Text>

            <View style={styles.contactItem}>
              <View style={styles.contactIconBg}>
                <AppIcon name="phone" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactItemLabel}>24x7 Emergency & Ambulance</Text>
                <Text style={styles.contactItemVal}>1066 / +91 22 2172 5100</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIconBg}>
                <AppIcon name="calendar" size={20} color="#1D61E7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactItemLabel}>Appointment Desk</Text>
                <Text style={styles.contactItemVal}>+91 22 2172 5555</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIconBg}>
                <AppIcon name="shield-check" size={20} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactItemLabel}>WhatsApp Support</Text>
                <Text style={styles.contactItemVal}>+91 98198 63084</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <View style={styles.contactIconBg}>
                <AppIcon name="hospital" size={20} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactItemLabel}>Location</Text>
                <Text style={styles.contactItemVal}>Pokhran Road No. 2, Thane (W), MH</Text>
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

      {/* ADD EXISTING MEMBER MODAL */}
      <Modal
        visible={showAddExistingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddExistingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Existing Member</Text>
              <TouchableOpacity onPress={() => setShowAddExistingModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Link an existing Bethany Hospital patient record to your family portal.
            </Text>

            <Text style={styles.formLabel}>Patient Number (UHID)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. 1113227"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={existPatientNo}
              onChangeText={setExistPatientNo}
            />

            <Text style={styles.formLabel}>Registered Mobile Number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="10-digit mobile number"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={10}
              value={existMobile}
              onChangeText={setExistMobile}
            />

            <View style={styles.rowFields}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.formLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {(['M', 'F'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderBtn,
                        existGender === g && styles.genderBtnActive,
                      ]}
                      onPress={() => setExistGender(g)}
                    >
                      <Text
                        style={[
                          styles.genderBtnText,
                          existGender === g && styles.genderBtnTextActive,
                        ]}
                      >
                        {g === 'M' ? 'Male 👨' : 'Female 👩'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.formLabel}>Relationship</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Spouse"
                  placeholderTextColor="#94A3B8"
                  value={existRelation}
                  onChangeText={setExistRelation}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryModalBtn}
              onPress={handleAddExisting}
            >
              <Text style={styles.primaryModalBtnText}>Link Patient Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NEW MEMBER MODAL */}
      <Modal
        visible={showNewMemberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Member</Text>
              <TouchableOpacity onPress={() => setShowNewMemberModal(false)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Add a new family member to book appointments and track records.
            </Text>

            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Ananya Deshmukh"
              placeholderTextColor="#94A3B8"
              value={newName}
              onChangeText={setNewName}
            />

            <View style={styles.rowFields}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.formLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {(['M', 'F'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderBtn,
                        newSex === g && styles.genderBtnActive,
                      ]}
                      onPress={() => setNewSex(g)}
                    >
                      <Text
                        style={[
                          styles.genderBtnText,
                          newSex === g && styles.genderBtnTextActive,
                        ]}
                      >
                        {g === 'M' ? 'Male 👨' : 'Female 👩'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.formLabel}>Age (Years) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 7"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={newAge}
                  onChangeText={setNewAge}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Relationship</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Son, Daughter, Mother, Spouse"
              placeholderTextColor="#94A3B8"
              value={newRelation}
              onChangeText={setNewRelation}
            />

            <Text style={styles.formLabel}>Mobile Number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="10-digit mobile"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={10}
              value={newMobile}
              onChangeText={setNewMobile}
            />

            <TouchableOpacity
              style={styles.primaryModalBtn}
              onPress={handleAddNewMember}
            >
              <Text style={styles.primaryModalBtnText}>Add Member to Family</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PATIENT OPTIONS SHEET / MODAL */}
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
                  Patient ID: #{selectedPatient?.patientNumber}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPatient(null)}>
                <AppIcon name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setSelectedPatient(null);
                Alert.alert('Book Appointment', `Select appointment slot for ${selectedPatient?.name}.`);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#EFF6FF' }]}>
                <AppIcon name="calendar" size={20} color="#1D61E7" />
              </View>
              <Text style={styles.actionText}>Book Doctor Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setSelectedPatient(null);
                Alert.alert('Lab Reports', `Viewing diagnostic and prescription records for ${selectedPatient?.name}.`);
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#ECFDF5' }]}>
                <AppIcon name="document" size={20} color="#16A34A" />
              </View>
              <Text style={styles.actionText}>View Medical & Lab Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                if (selectedPatient) {
                  handleRemoveMember(selectedPatient.id);
                }
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#FEF2F2' }]}>
                <AppIcon name="trash" size={20} color="#DC2626" />
              </View>
              <Text style={[styles.actionText, { color: '#DC2626' }]}>
                Unlink From Family
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PROFILE / MENU MODAL */}
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
              <View style={styles.profileAvatarCircle}>
                <AppIcon name="user" size={26} color="#1D61E7" />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.profileName}>{userSession.name || 'Account Holder'}</Text>
                <Text style={styles.profilePhone}>+91 {userSession.mobileNumber}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setShowProfileMenu(false);
                onChangePin();
              }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#EFF6FF' }]}>
                <AppIcon name="key" size={20} color="#1D61E7" />
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
              <View style={[styles.actionIconBg, { backgroundColor: '#F8FAFC' }]}>
                <AppIcon name="phone" size={20} color="#1D61E7" />
              </View>
              <Text style={styles.actionText}>Contact Bethany Hospitals</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#C5DEF8',
  },
  headerContainer: {
    backgroundColor: '#E8F2FE',
    paddingTop: 8,
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactUsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D4E2F6',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 8,
  },
  contactUsText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },
  menuIconBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4E2F6',
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 0,
    width: '100%',
  },
  headerTitlesCol: {
    flex: 1,
    paddingLeft: 30,
    justifyContent: 'center',
  },
  titleSingleLine: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  titleBlue: {
    color: '#1D61E7',
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#556880',
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  bannerArtContainer: {
    width: 215,
    height: 180,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerBannerArt: {
    width: '130%',
    height: '100%',
    right:30
  },
  curvedParentSection: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 18,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  leftColumn: {
    alignItems: 'center',
    width: 98,
  },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 92,
    height: 92,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    marginTop: 9,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  registeredBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 3,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 14,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
    letterSpacing: 0.2,
  },
  dotsButton: {
    padding: 2,
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCell: {
    width: 22,
    alignItems: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 13.5,
    color: '#1E293B',
    fontWeight: '600',
  },
  statusRegisteredText: {
    color: '#16A34A',
    fontWeight: '700',
  },
  mobileNumberText: {
    color: '#1D61E7',
    fontWeight: '700',
  },
  patientNumberText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  stickyBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addExistingBtnPurple: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0FF',
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    borderRadius: 16,
    paddingVertical: 14,
    marginRight: 8,
  },
  addExistingBtnTextPurple: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C3AED',
    marginLeft: 6,
  },
  newMemberBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D61E7',
    borderRadius: 16,
    paddingVertical: 14,
    marginLeft: 8,
    shadowColor: '#1D61E7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  newMemberBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  confidentialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  confidentialText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13.5,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 19,
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactItemLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  contactItemVal: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  modalCloseBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14.5,
  },
  formLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 4,
  },
  rowFields: {
    flexDirection: 'row',
  },
  genderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    height: 46,
  },
  genderBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  genderBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  genderBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: '#1D61E7',
    fontWeight: '800',
  },
  primaryModalBtn: {
    backgroundColor: '#1D61E7',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#1D61E7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  userProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profilePhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
});

export default PatientListScreen;
