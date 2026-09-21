import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from './Icons';
import { UserSession } from './types';
import { useTheme } from './ThemeContext';
import IMAGES from './imageAssets';

interface AnnouncementsScreenProps {
  userSession: UserSession;
  initialBannerId?: string;
  onBack: () => void;
  onOpenBookVisit?: () => void;
}

interface AnnouncementItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  date: string;
  paragraph: string;
  actionText: string;
}

const ANNOUNCEMENTS_LIST: AnnouncementItem[] = [
  {
    id: 'womens_wellness',
    title: "Women's Wellness & Maternity Care Campaign",
    subtitle: 'Care Designed Around You • Gynecology, Maternity & Screening',
    category: "Women's Health",
    image: IMAGES.bannerWomensWellness,
    date: 'Active Campaign • Sep 2026',
    paragraph:
      "Our hospital is proud to announce the launch of our comprehensive Women's Wellness & Maternity Care Initiative. This program offers specialized consultations with senior Gynecologists, free preventive health screenings, breast cancer awareness checks, and advanced maternity packages. We are committed to providing holistic, patient-centered care for women of all age groups. Schedule your appointment today to access expert healthcare guidance, personalized nutrition plans, and state-of-the-art diagnostic testing.",
    actionText: 'Book Wellness Consultation',
  },
  {
    id: 'heart_campaign',
    title: 'Heart Health Screening & Preventive Cardiology Campaign',
    subtitle: 'Listen to Your Heart Before It Whispers • Special Screening Package',
    category: 'Cardiology Care',
    image: IMAGES.bannerHeartCampaign,
    date: 'Active Campaign • Sep 2026',
    paragraph:
      'Cardiovascular health is key to long-term vitality. Our Heart Health Campaign provides early risk detection through discounted cardiac screening packages, including ECG, Lipid Profile, Blood Pressure monitoring, and TMT testing. Led by our renowned Chief Cardiologist Dr. Chakravarthi, the initiative aims to empower patients with lifestyle counseling, early intervention, and customized heart care plans. Protect your heart before symptoms arise by visiting our OPD cardiology wing.',
    actionText: 'Book Heart Checkup',
  },
  {
    id: 'surgical_care',
    title: 'Advanced Surgical & Rehabilitation Care Initiative',
    subtitle: 'Expertise Across Every Step • Precision Surgery & Personalized Rehab',
    category: 'Surgery & Rehab',
    image: IMAGES.bannerSurgicalCare,
    date: 'Specialist Drive • Sep 2026',
    paragraph:
      'Experience world-class surgical precision with our minimal-access and robotic-assisted surgical unit. Designed for faster recovery, lower post-operative discomfort, and shorter hospital stays, our surgical team covers Laparoscopic, Orthopedic, Neuro, and General Surgeries. Coupled with dedicated post-surgery physical rehabilitation specialists, we ensure continuous monitoring from pre-op preparation through home recovery. Contact our surgical helpdesk for second opinions and surgical slot bookings.',
    actionText: 'Consult Surgical Team',
  },
  {
    id: 'trauma_emergency',
    title: '24/7 Emergency & Trauma Care Expansion',
    subtitle: 'Ready When Every Second Counts • Rapid Response & Life Support',
    category: 'Emergency 24/7',
    image: IMAGES.bannerTraumaEmergency,
    date: '24/7 Active Hotline',
    paragraph:
      'We have expanded our Emergency & Trauma Response Unit with state-of-the-art Advanced Life Support (ALS) ambulances, dedicated ICU beds, and instant triage protocols. Available 24/7, our emergency trauma surgeons and critical care specialists are equipped for rapid stabilization during cardiac events, accidents, and acute medical emergencies. Save our emergency helpline 1800-209-4455 / 108 for immediate ambulance dispatch and priority trauma admission.',
    actionText: 'Call Emergency Helpline',
  },
  {
    id: 'community_camp',
    title: 'Community Mega Health Screening Camp',
    subtitle: 'Care That Reaches Everyone • Free Consultation & Health Screening',
    category: 'Community Outreach',
    image: IMAGES.bannerCommunityCamp,
    date: 'This Saturday • 09:00 AM',
    paragraph:
      'As part of our community outreach commitment, our hospital is hosting a Free Community Mega Health Camp this Saturday at the Main Community Grounds. Open to all age groups, the camp features free blood sugar tests, BP checks, general physician consultations, eye checks, and basic dental screenings. Free medicines and follow-up consultation vouchers will be distributed to all registered attendees. Bring your family members for a complete health checkup.',
    actionText: 'Register Free for Camp',
  },
  {
    id: 'blood_donation',
    title: 'Annual Mega Blood Donation Drive',
    subtitle: 'Donate Blood, Save Lives • Free Health Checkup Included',
    category: 'Blood Bank Drive',
    image: IMAGES.bannerBloodDonation,
    date: 'Ongoing Drive • Main Auditorium',
    paragraph:
      'Join us in saving lives by participating in our Annual Mega Blood Donation Drive at the Hospital Main Auditorium. Every single blood donation can save up to three lives in emergency surgeries and trauma cases. Donors will receive a complimentary full body health checkup, Hb testing, refreshments, and an official Blood Donor Honor Certificate. Medical registration is open daily from 09:00 AM to 05:00 PM. Be a hero and donate blood this week!',
    actionText: 'Pledge Blood Donation',
  },
];

export const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = ({
  userSession,
  initialBannerId,
  onBack,
  onOpenBookVisit,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const { isDark, colors } = useTheme();

  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categories = ['All', "Women's Health", 'Cardiology Care', 'Surgery & Rehab', 'Emergency 24/7', 'Community Outreach'];

  const filteredAnnouncements =
    selectedFilter === 'All'
      ? ANNOUNCEMENTS_LIST
      : ANNOUNCEMENTS_LIST.filter((a) => a.category === selectedFilter);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
        {/* TOP HEADER BAR (Visit Details style) */}
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
              style={[styles.headerBackBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }, isTablet && { width: 42, height: 42, borderRadius: 21 }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="back" size={isTablet ? 24 : 20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenterGroup}>
            <Text style={[styles.headerTitleCentered, { color: colors.primary }, isTablet && { fontSize: 22 }]}>
              Announcements & News
            </Text>
          </View>

          <View style={[styles.headerSideGroup, isTablet && { width: 44 }]} />
        </View>

        {/* CATEGORY FILTER CHIPS */}
        <View style={styles.filterStripContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {categories.map((cat) => {
              const isSelected = selectedFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChipBtn,
                    isSelected ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setSelectedFilter(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isSelected ? { color: '#FFFFFF', fontWeight: '800' } : { color: colors.textSecondary }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ANNOUNCEMENT CARDS LIST */}
        <ScrollView
          contentContainerStyle={[styles.scrollListContent, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredAnnouncements.map((item) => (
            <View
              key={item.id}
              style={[
                styles.announcementCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                },
                initialBannerId === item.id && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            >
              {/* Banner Image */}
              <View style={styles.bannerImageWrap}>
                <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
                <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
                  <Text style={styles.categoryTagText}>{item.category.toUpperCase()}</Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.dateText, { color: colors.primary }]}>{item.date}</Text>
                </View>

                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>

                <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]} />

                {/* 5-6 Line Paragraph */}
                <Text style={[styles.paragraphText, { color: colors.textPrimary }]}>
                  {item.paragraph}
                </Text>
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
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerSideGroup: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenterGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCentered: {
    fontSize: 18.5,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FILTER CHIPS
  filterStripContainer: {
    paddingVertical: 10,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 12,
  },

  // LIST CONTENT
  scrollListContent: {
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 4,
  },
  announcementCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#0083B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerImageWrap: {
    width: '100%',
    height: 170,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 2,
  },
  itemSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  paragraphText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

export default AnnouncementsScreen;
