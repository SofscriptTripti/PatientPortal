import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import IMAGES from './imageAssets';

interface MobileEntryScreenProps {
  mobileNumber: string;
  setMobileNumber: (text: string) => void;
  onMobileSubmit: () => void;
  onOpenRegister?: () => void;
}

export const MobileEntryScreen: React.FC<MobileEntryScreenProps> = ({
  mobileNumber,
  setMobileNumber,
  onMobileSubmit,
  onOpenRegister,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 600 || height >= 950;
  const isSmallMobile = width < 380;
  
  // Responsive sizing for hero image and typography
  const heroImgWidth = isTablet ? 380 : (isSmallMobile ? 140 : 155);
  const heroImgHeight = isTablet ? 360 : (isSmallMobile ? 135 : 150);
  const heroHeadingFontSize = isTablet ? 36 : (isSmallMobile ? 19 : 21.5);
  const heroHeadingLineHeight = isTablet ? 44 : (isSmallMobile ? 23 : 26);
  const heroSubFontSize = isTablet ? 16 : (isSmallMobile ? 10.5 : 11.5);
  const heroSubLineHeight = isTablet ? 24 : (isSmallMobile ? 14.5 : 16);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.screenOuter}>
            {/* TOP SECTION: HEADER + HERO + MOBILE NUMBER CARD */}
            <View style={styles.topSixtySection}>
              {/* TOP HEADER BAR */}
              <View style={[styles.topHeaderBar, isTablet && { paddingTop: 24, paddingBottom: 10 }]}>
                <View style={styles.brandRow}>
                  <Image
                    source={IMAGES.patientPortalLogo}
                    fadeDuration={0}
                    style={[styles.portalLogo, isTablet && { width: 66, height: 66 }]}
                    resizeMode="contain"
                  />
                  <View style={styles.brandTextCol}>
                    <View style={styles.brandTitleRow}>
                      <Text style={[styles.brandTitleDark, isTablet && { fontSize: 30 }]}>Patient </Text>
                      <Text style={[styles.brandTitleTeal, isTablet && { fontSize: 30 }]}>Portal</Text>
                    </View>
                    <Text style={[styles.brandSubtitle, isTablet && { fontSize: 15 }]}>
                      Care Today. Healthier Tomorrow.
                    </Text>
                  </View>
                </View>
              </View>

              {/* HERO SECTION: Main Character Artwork */}
              <View style={styles.heroSection}>
                {/* 'Your Health in Your Hands' text commented out to prevent image overlap */}
                {/* 
                <View style={styles.heroLeftCol}>
                  <Text
                    style={[
                      styles.heroHeading,
                      { fontSize: heroHeadingFontSize, lineHeight: heroHeadingLineHeight },
                    ]}
                  >
                    Your Health
                  </Text>
                  <Text
                    style={[
                      styles.heroHeading,
                      { fontSize: heroHeadingFontSize, lineHeight: heroHeadingLineHeight },
                    ]}
                  >
                    in Your Hands
                  </Text>
                  <Text
                    style={[
                      styles.heroSubheading,
                      { fontSize: heroSubFontSize, lineHeight: heroSubLineHeight },
                    ]}
                  >
                    Simple access to appointments,{'\n'}reports & more — anytime.
                  </Text>
                </View>
                */}

                <View style={styles.heroRightColCentered}>
                  <Image
                    source={IMAGES.heroCharacter}
                    fadeDuration={0}
                    style={[
                      styles.heroImageClean,
                      {
                        width: isTablet ? 380 : Math.min(width * 0.88, 280),
                        height: isTablet ? 360 : Math.min(height * 0.28, 220),
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* FLOATING MOBILE NUMBER INPUT CARD */}
              <View style={[styles.inputCard, isTablet && { marginHorizontal: 28, padding: 26, marginTop: -12, marginBottom: 8 }]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, isTablet && { fontSize: 18 }]}>Mobile Number</Text>
                  <Text style={[styles.cardSubtitle, isTablet && { fontSize: 12.5 }]}>
                    We'll send an OTP to this number
                  </Text>
                </View>

                {/* Mobile Input Field */}
                <View style={[styles.mobileInputRow, isTablet && { height: 56 }]}>
                  <View style={styles.flagContainer}>
                    <View style={styles.flagIconBox}>
                      <View style={styles.flagStripeSaffron} />
                      <View style={styles.flagStripeWhite}>
                        <View style={styles.flagChakra} />
                      </View>
                      <View style={styles.flagStripeGreen} />
                    </View>
                    <Text style={[styles.countryCodeText, isTablet && { fontSize: 17 }]}>+91</Text>
                  </View>

                  <View style={styles.inputDivider} />

                  <TextInput
                    style={[styles.mobileTextInput, isTablet && { fontSize: 17 }]}
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    returnKeyType="done"
                    onSubmitEditing={onMobileSubmit}
                  />

                  {mobileNumber.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearBtn}
                      onPress={() => setMobileNumber('')}
                    >
                      <AppIcon name="close" size={14} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Gradient Send OTP Button */}
                <TouchableOpacity
                  style={[styles.sendOtpBtnWrapper, isTablet && { height: 56, marginTop: 18 }]}
                  onPress={onMobileSubmit}
                  activeOpacity={0.88}
                >
                  <ImageBackground
                    source={IMAGES.btnGradientBg}
                    fadeDuration={0}
                    style={styles.sendOtpGradient}
                    imageStyle={styles.sendOtpGradientImg}
                  >
                    <Text style={[styles.sendOtpBtnText, isTablet && { fontSize: 17.5 }]}>Send OTP</Text>
                    <View style={styles.sendOtpArrowBox}>
                      <AppIcon name="arrow-right" size={20} color="#FFFFFF" />
                    </View>
                  </ImageBackground>
                </TouchableOpacity>

                {/* Don't have Acc ? Register Now (Left Side) */}
                <View style={[styles.registerPromptRow, isTablet && { marginTop: 14 }]}>
                  <Text style={[styles.dontHaveAccText, isTablet && { fontSize: 14.5 }]}>Don't have Acc ? </Text>
                  <TouchableOpacity
                    onPress={onOpenRegister}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                  >
                    <Text style={[styles.registerNowLink, isTablet && { fontSize: 14.5 }]}>Register Now.</Text>
                  </TouchableOpacity>
                </View>

                {/* Security trust badge */}
                <View style={[styles.secureBadgeRow, isTablet && { marginTop: 16 }]}>
                  <AppIcon name="shield-check" size={16} color="#94A3B8" />
                  <Text style={[styles.secureBadgeText, isTablet && { fontSize: 13 }]}>
                    Your information is secure with us
                  </Text>
                </View>
              </View>
            </View>

            {/* BOTTOM SECTION: 3 FEATURES + WAVE FOOTER BG */}
            <View style={styles.bottomFortySection}>
              {/* 3 FEATURE COLUMNS ROW */}
              <View style={[styles.featuresContainer, isTablet && { marginHorizontal: 28, marginTop: 40, marginBottom: 24 }]}>
                <View style={styles.featureCol}>
                  <View
                    style={[
                      styles.featureIconBox,
                      { backgroundColor: '#E0F2FE' },
                      isTablet && { width: 58, height: 58, borderRadius: 29 },
                    ]}
                  >
                    <AppIcon name="calendar" size={isTablet ? 26 : 24} color="#2563EB" />
                  </View>
                  <Text style={[styles.featureLabel, isTablet && { fontSize: 13.5, lineHeight: 18 }]}>
                    Book{'\n'}Appointments
                  </Text>
                </View>

                <View style={[styles.featureDivider, isTablet && { height: 44 }]} />

                <View style={styles.featureCol}>
                  <View
                    style={[
                      styles.featureIconBox,
                      { backgroundColor: '#D4F7F2' },
                      isTablet && { width: 58, height: 58, borderRadius: 29 },
                    ]}
                  >
                    <AppIcon name="document" size={isTablet ? 26 : 24} color="#0D9488" />
                  </View>
                  <Text style={[styles.featureLabel, isTablet && { fontSize: 13.5, lineHeight: 18 }]}>
                    Access{'\n'}Reports
                  </Text>
                </View>

                <View style={[styles.featureDivider, isTablet && { height: 44 }]} />

                <View style={styles.featureCol}>
                  <View
                    style={[
                      styles.featureIconBox,
                      { backgroundColor: '#EDE9FE' },
                      isTablet && { width: 58, height: 58, borderRadius: 29 },
                    ]}
                  >
                    <AppIcon name="users" size={isTablet ? 26 : 24} color="#7C3AED" />
                  </View>
                  <Text style={[styles.featureLabel, isTablet && { fontSize: 13.5, lineHeight: 18 }]}>
                    Stay{'\n'}Connected
                  </Text>
                </View>
              </View>

              {/* BOTTOM WAVE FOOTER - USING wave_footer_bg.png */}
              <View style={styles.bottomWaveContainer}>
                <Image
                  source={IMAGES.waveFooterBg}
                  fadeDuration={0}
                  style={[
                    styles.bottomWaveImage,
                    {
                      height: isTablet ? 310 : 230,
                    },
                  ]}
                  resizeMode="stretch"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F8FAFE',
  },
  screenOuter: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFE',
    justifyContent: 'space-between',
  },
  topSixtySection: {
    width: '100%',
    justifyContent: 'space-between',
  },
  bottomFortySection: {
    width: '100%',
    justifyContent: 'space-between',
  },

  // 1. TOP HEADER BAR
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#F8FAFE',
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portalLogo: {
    width: 56,
    height: 56,
  },
  brandTextCol: {
    marginLeft: 14,
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandTitleDark: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0B2341',
    letterSpacing: -0.3,
  },
  brandTitleTeal: {
    fontSize: 25,
    fontWeight: '800',
    color: '#02AAB0',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  // 2. HERO SECTION
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
    width: '100%',
    zIndex: 1,
  },
  heroLeftCol: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 2,
    zIndex: 2,
  },
  heroHeading: {
    fontWeight: '800',
    color: '#0B1E36',
    letterSpacing: -0.5,
  },
  heroSubheading: {
    fontWeight: '400',
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  heroRightColCentered: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heroImageClean: {
    // Dynamic width and height handled via inline style
  },

  // 3. FLOATING MOBILE NUMBER INPUT CARD
  inputCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 20,
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#0F253E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    zIndex: 10,
    width: 'auto',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0B2341',
  },
  cardSubtitle: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#64748B',
  },
  mobileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIconBox: {
    width: 24,
    height: 16,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
  },
  flagStripeSaffron: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  flagStripeWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagChakra: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000080',
  },
  flagStripeGreen: {
    flex: 1,
    backgroundColor: '#138808',
  },
  countryCodeText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0B2341',
    marginLeft: 8,
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  mobileTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0B2341',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  sendOtpBtnWrapper: {
    height: 50,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 14,
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sendOtpGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOtpGradientImg: {
    borderRadius: 14,
  },
  sendOtpBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sendOtpArrowBox: {
    position: 'absolute',
    right: 18,
  },
  secureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secureBadgeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
    fontWeight: '500',
  },

  // 4. 3 FEATURE COLUMNS ROW
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 26,
    marginBottom: 16,
    paddingHorizontal: 12,
    width: 'auto',
  },
  featureCol: {
    flex: 1,
    alignItems: 'center',
  },
  featureIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B2341',
    textAlign: 'center',
    lineHeight: 16,
  },
  featureDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginHorizontal: 8,
  },

  // REGISTER PROMPT ROW (LEFT SIDE)
  registerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  dontHaveAccText: {
    fontSize: 13.5,
    fontFamily: 'System',
    color: '#64748B',
    fontWeight: '500',
  },
  registerNowLink: {
    fontSize: 13.5,
    fontFamily: 'System',
    color: '#0083B0',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // 5. BOTTOM WAVE CONTAINER (PINNED TO BOTTOM)
  bottomWaveContainer: {
    width: '100%',
    marginTop: 'auto',
    overflow: 'hidden',
  },
  bottomWaveImage: {
    width: '100%',
    height: 230,
  },
});

export default MobileEntryScreen;
