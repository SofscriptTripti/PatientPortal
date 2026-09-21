import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ScrollView,
  useWindowDimensions,
  Switch,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession, PatientMember } from './types';
import { INITIAL_PATIENTS } from './mockData';
import { useTheme } from './ThemeContext';
import { getActiveMember, getAvatarForMember } from './accountManager';

export interface ProfileSettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
  userSession: UserSession;
  onSwitchAccount?: (memberId: string) => void;
  onLogout: () => void;
  onChangePin?: () => void;
  onOpenAnnouncements?: () => void;
  onEditMember?: (member: PatientMember) => void;
}

export const ProfileSettingsDrawer: React.FC<ProfileSettingsDrawerProps> = ({
  visible,
  onClose,
  userSession,
  onSwitchAccount,
  onLogout,
  onChangePin,
  onOpenAnnouncements,
  onEditMember,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const { theme, setTheme, colorOptionId, setColorOptionId, colorOptions, isDark, colors } = useTheme();

  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showSelectMemberModal, setShowSelectMemberModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(520)).current;

  // Active Member identity from account manager
  const activeMember = getActiveMember();

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 520,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 520,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.slideBarOverlay}>
        {/* Backdrop dismiss touchable */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.slideBarPanel,
            {
              backgroundColor: colors.background,
              width: Math.min(width * 0.92, isTablet ? 520 : 380),
              transform: [{ translateX: slideAnim }],
              borderTopLeftRadius: 28,
              borderBottomLeftRadius: 28,
              borderLeftWidth: 1.5,
              borderLeftColor: colors.border,
              overflow: 'hidden',
            },
          ]}
        >
          {/* 🌟 STATUS BAR AREA WITH DEDICATED TOP ACCENT HANDLE */}
          <View style={[styles.statusBarStrip, { backgroundColor: colors.surface, paddingTop: Math.max(insets.top, 12) }]}>
            <View style={[styles.topDragHandlePill, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
          </View>

          {/* Header: Title + Close Button */}
          <View
            style={[
              styles.slideBarHeader,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.slideBarTitle, { color: colors.textPrimary }]}>
                  Profile & Settings
                </Text>
                <View style={[styles.statusBadgeDot, { backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.slideBarSubtitle, { color: colors.textSecondary }]}>
                Hospital registration & account preferences
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.slideBarCloseBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="close" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slideBarScrollContent}>
            {/* User Identity Banner with Profile Pic, Name, UHID, Mobile & Circular Dropdown Switcher Icon on Right */}
            <View style={[styles.slideUserBanner, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.slideAvatarWrapper, { backgroundColor: colors.primaryLight, overflow: 'hidden' }]}>
                  <Image
                    source={getAvatarForMember(activeMember)}
                    style={styles.slideAvatarImg}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.slideUserName, { color: colors.textPrimary }]}>{activeMember.name}</Text>
                    <View style={[styles.typeBadge, activeMember.patientType === 'IP' ? styles.ipBadgeBg : styles.opBadgeBg]}>
                      <Text style={[styles.typeBadgeText, activeMember.patientType === 'IP' ? styles.ipBadgeText : styles.opBadgeText]}>
                        {activeMember.patientType || 'OP'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.slideUserUhid}>UHID: {activeMember.patientNumber}</Text>
                  <Text style={[styles.slideUserMobile, { color: colors.textSecondary }]}>
                    +91 {activeMember.mobileNumber || userSession.mobileNumber || '9414023873'}
                  </Text>
                </View>

                {/* 🔴 Circle Dropdown Icon on Right Side of Main Hero Section */}
                <TouchableOpacity
                  style={[
                    styles.circleDropdownBtn,
                    { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                  ]}
                  onPress={() => setShowAccountDropdown(!showAccountDropdown)}
                  activeOpacity={0.75}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AppIcon name={showAccountDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Inline Account Switcher List */}
              {showAccountDropdown && (
                <View style={[styles.heroAccountDropdownList, { borderTopColor: colors.border }]}>
                  <Text style={[styles.accountDropdownSub, { color: colors.textSecondary }]}>Switch Member Account (Self):</Text>
                  {INITIAL_PATIENTS.map((member) => {
                    const isSelected = member.id === activeMember.id;
                    return (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.accountDropdownOption,
                          isSelected && [styles.accountDropdownOptionActive, { backgroundColor: colors.primaryLight }],
                        ]}
                        onPress={() => {
                          setShowAccountDropdown(false);
                          onSwitchAccount?.(member.id);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.dropdownAvatarBox, { backgroundColor: colors.primaryLight }]}>
                          <Image source={getAvatarForMember(member)} style={{ width: 34, height: 34, borderRadius: 17 }} resizeMode="cover" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.dropdownOptionName, { color: colors.textPrimary }, isSelected && { fontWeight: '800' }]}>
                              {member.name}
                            </Text>
                            <View style={[styles.typeBadge, member.patientType === 'IP' ? styles.ipBadgeBg : styles.opBadgeBg]}>
                              <Text style={[styles.typeBadgeText, member.patientType === 'IP' ? styles.ipBadgeText : styles.opBadgeText]}>
                                {member.patientType || 'OP'}
                              </Text>
                            </View>
                            {isSelected && (
                              <Text style={[styles.selfPill, { color: colors.primary }]}> (Self)</Text>
                            )}
                          </View>
                          <Text style={[styles.dropdownOptionRelation, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                            {member.relation} • {member.age}
                          </Text>
                        </View>
                        {isSelected ? (
                          <View style={[styles.activeCheckCircle, { backgroundColor: colors.primary }]}>
                            <AppIcon name="check" size={12} color="#FFFFFF" />
                          </View>
                        ) : (
                          <Text style={[styles.switchActionText, { color: colors.primary }]}>Switch ➔</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* SECTION 1: HOSPITAL REGISTRATION (MRD) */}
            <View style={styles.slideSectionContainer}>
              <View style={styles.slideSectionHeaderRow}>
                <Text style={[styles.slideSectionTitle, { color: colors.textSecondary }]}>HOSPITAL REGISTRATION (MRD)</Text>
                <View style={[styles.lockedBadge, { backgroundColor: isDark ? colors.borderLight : '#F1F5F9' }]}>
                  <AppIcon name="lock" size={11} color={colors.textSecondary} />
                  <Text style={[styles.lockedBadgeText, { color: colors.textSecondary }]}>MRD Verified</Text>
                </View>
              </View>

              <View style={[styles.mrdDetailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.mrdRow}>
                  <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Full Name</Text>
                  <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>{activeMember.name}</Text>
                </View>
                <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                <View style={styles.mrdRow}>
                  <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Date of Birth</Text>
                  <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>{activeMember.dob || '1992-05-14'}</Text>
                </View>
                <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                <View style={styles.mrdRow}>
                  <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Gender</Text>
                  <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>{activeMember.genderType === 'F' ? 'Female' : 'Male'}</Text>
                </View>
                <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                <View style={styles.mrdRow}>
                  <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>Primary Mobile</Text>
                  <Text style={[styles.mrdValue, { color: colors.textPrimary }]}>+91 {activeMember.mobileNumber || userSession.mobileNumber || '9414023873'}</Text>
                </View>
                <View style={[styles.mrdDivider, { backgroundColor: colors.divider }]} />

                <View style={styles.mrdRow}>
                  <Text style={[styles.mrdLabel, { color: colors.textSecondary }]}>UHID</Text>
                  <Text style={[styles.mrdValue, { color: colors.primary }]}>{activeMember.patientNumber}</Text>
                </View>
              </View>
            </View>

            {/* SECTION 2: ACCOUNTS, ANNOUNCEMENTS & APPEARANCE PREFERENCES */}
            <View style={styles.slideSectionContainer}>
              <Text style={[styles.slideSectionTitle, { color: colors.textSecondary }]}>ACCOUNT & APP PREFERENCES</Text>
              <View style={[styles.slideMenuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* 1. Edit Member Details Option */}
                <TouchableOpacity
                  style={styles.slideMenuItem}
                  activeOpacity={0.7}
                  onPress={() => setShowSelectMemberModal(true)}
                >
                  <View style={[styles.slideMenuIconBg, { backgroundColor: colors.primaryLight }]}>
                    <AppIcon name="edit" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Edit Member Details</Text>
                    <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Select a family member to correct personal details</Text>
                  </View>
                  <AppIcon name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={[styles.slideMenuDivider, { backgroundColor: colors.divider }]} />

                {/* 2. Change Access PIN */}
                <TouchableOpacity
                  style={styles.slideMenuItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    handleClose();
                    onChangePin?.();
                  }}
                >
                  <View style={[styles.slideMenuIconBg, { backgroundColor: colors.primaryLight }]}>
                    <AppIcon name="key" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Change Access PIN</Text>
                    <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Update 4-digit security PIN for instant login</Text>
                  </View>
                  <AppIcon name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={[styles.slideMenuDivider, { backgroundColor: colors.divider }]} />

                {/* 3. Hospital Announcements & News */}
                <TouchableOpacity
                  style={styles.slideMenuItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    handleClose();
                    onOpenAnnouncements?.();
                  }}
                >
                  <View style={[styles.slideMenuIconBg, { backgroundColor: colors.primaryLight }]}>
                    <AppIcon name="bullhorn" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Hospital Announcements & News</Text>
                    <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>View official health campaigns, drives & news</Text>
                  </View>
                  <AppIcon name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={[styles.slideMenuDivider, { backgroundColor: colors.divider }]} />

                {/* 4. Dark Mode Switch */}
                <View style={styles.slideMenuItem}>
                  <View style={[styles.slideMenuIconBg, { backgroundColor: colors.primaryLight }]}>
                    <AppIcon name={isDark ? "moon" : "sun"} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slideMenuItemTitle, { color: colors.textPrimary }]}>Dark Theme</Text>
                    <Text style={[styles.slideMenuItemSub, { color: colors.textSecondary }]}>Switch between dark and light themes</Text>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={(val) => setTheme(val ? 'Dark' : 'Light')}
                    trackColor={{ false: '#CBD5E1', true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.slideMenuDivider, { backgroundColor: colors.divider }]} />

                {/* 5. Theme Accent Color Options */}
                <View style={{ padding: 14 }}>
                  <Text style={[styles.colorSectionHeading, { color: colors.textPrimary }]}>Theme Accent Color</Text>
                  <Text style={[styles.colorSectionSubheading, { color: colors.textSecondary }]}>Choose from 5 distinct color palettes across the app</Text>

                  <View style={styles.colorPaletteRow}>
                    {colorOptions.map((opt) => {
                      const isSelected = opt.id === colorOptionId;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.colorSwatchBtn,
                            { backgroundColor: isDark ? opt.dark.primary : opt.light.primary },
                            isSelected && styles.colorSwatchBtnActive,
                          ]}
                          onPress={() => setColorOptionId(opt.id)}
                          activeOpacity={0.8}
                        >
                          {isSelected && <AppIcon name="check" size={16} color="#FFFFFF" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.selectedColorInfoRow}>
                    <View
                      style={[
                        styles.selectedColorDot,
                        {
                          backgroundColor:
                            colorOptions.find((c) => c.id === colorOptionId)?.light.primary || colors.primary,
                        },
                      ]}
                    />
                    <Text style={[styles.colorSelectedName, { color: colors.textPrimary }]}>
                      Active: {colorOptions.find((c) => c.id === colorOptionId)?.name || 'Teal Cyan'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Modal for selecting member to edit */}
          <Modal
            visible={showSelectMemberModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSelectMemberModal(false)}
          >
            <TouchableOpacity
              style={styles.selectMemberBackdrop}
              activeOpacity={1}
              onPress={() => setShowSelectMemberModal(false)}
            >
              <View style={[styles.selectMemberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.selectMemberHeader}>
                  <Text style={[styles.selectMemberTitle, { color: colors.textPrimary }]}>Select Member to Edit Details</Text>
                  <Text style={[styles.selectMemberSub, { color: colors.textSecondary }]}>Choose whose information you want to update</Text>
                </View>

                <ScrollView style={{ maxHeight: 320 }}>
                  {INITIAL_PATIENTS.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[styles.memberSelectRow, { borderBottomColor: colors.divider }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setShowSelectMemberModal(false);
                        handleClose();
                        onEditMember?.(member);
                      }}
                    >
                      <Image source={getAvatarForMember(member)} style={styles.memberSelectAvatar} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.memberSelectName, { color: colors.textPrimary }]}>{member.name}</Text>
                        <Text style={[styles.memberSelectRel, { color: colors.textSecondary }]}>
                          {member.relation} • UHID: {member.patientNumber}
                        </Text>
                      </View>
                      <AppIcon name="chevron-right" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]}
                  onPress={() => setShowSelectMemberModal(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Bottom Sticky Logout Button */}
          <View style={[styles.slideStickyFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.slideLogoutBtn}
              activeOpacity={0.8}
              onPress={() => {
                handleClose();
                onLogout();
              }}
            >
              <AppIcon name="logout" size={18} color="#DC2626" />
              <Text style={styles.slideLogoutText}>Log Out of Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  slideBarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  slideBarPanel: {
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  statusBarStrip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },
  topDragHandlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 2.25,
    marginTop: 6,
  },
  slideBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  slideBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 6,
  },
  slideBarSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  slideBarCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideBarScrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  slideUserBanner: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  slideAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideAvatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  slideUserName: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  slideUserUhid: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2,
  },
  slideUserMobile: {
    fontSize: 12,
    marginTop: 1,
  },
  circleDropdownBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  heroAccountDropdownList: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  accountDropdownSub: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  accountDropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  accountDropdownOptionActive: {
    borderWidth: 1,
  },
  dropdownAvatarBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOptionName: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  selfPill: {
    fontSize: 12,
    fontWeight: '800',
  },
  dropdownOptionRelation: {
    fontSize: 11.5,
    marginTop: 1,
  },
  activeCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  slideSectionContainer: {
    marginBottom: 20,
  },
  slideSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  slideSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mrdDetailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  mrdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  mrdLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  mrdValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  mrdDivider: {
    height: 1,
    marginVertical: 6,
  },
  mrdNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 6,
  },
  mrdNoticeText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  slideMenuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  slideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  slideMenuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  slideMenuItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  slideMenuItemSub: {
    fontSize: 11,
    marginTop: 1,
  },
  slideMenuDivider: {
    height: 1,
    marginLeft: 62,
  },
  colorSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  colorSectionSubheading: {
    fontSize: 11.5,
    marginTop: 2,
    marginBottom: 12,
  },
  colorPaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorSwatchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSwatchBtnActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  selectedColorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  selectedColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  colorSelectedName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  accessibilityDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  slideStickyFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  slideLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    gap: 8,
  },
  slideLogoutText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#DC2626',
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
  selectMemberBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectMemberCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  selectMemberHeader: {
    marginBottom: 16,
  },
  selectMemberTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectMemberSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  memberSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberSelectAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberSelectName: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberSelectRel: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileSettingsDrawer;
