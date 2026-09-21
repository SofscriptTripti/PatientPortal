import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, BackHandler, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import PatientListScreen from './components/PatientListScreen';
import BookVisitScreen from './components/BookVisitScreen';
import BookTestScreen from './components/BookTestScreen';
import PayBillsScreen from './components/PayBillsScreen';
import VisitsScreen from './components/VisitsScreen';
import ReportsScreen from './components/ReportsScreen';
import AddMemberScreen from './components/AddMemberScreen';
import CareScreen from './components/CareScreen';
import MedicinesScreen from './components/MedicinesScreen';
import NotificationsScreen from './components/NotificationsScreen';
import DietScreen from './components/DietScreen';
import AnnouncementsScreen from './components/AnnouncementsScreen';
import ChangePinScreen from './components/ChangePinScreen';
import { CustomAlertContainer } from './components/CustomAlert';
import { UserSession, PatientMember } from './components/types';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { INITIAL_PATIENTS } from './components/mockData';
import { switchActiveAccount, getAvatarForMember } from './components/accountManager';

function AppContent() {
  const { isDark, colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'patient_list' | 'book_visit' | 'pay_bills' | 'visits' | 'reports' | 'book_test' | 'add_member' | 'care' | 'medicines' | 'notifications' | 'diet' | 'announcements' | 'change_pin'>('dashboard');
  const [patientListInitialTab, setPatientListInitialTab] = useState<'Home' | 'Visits' | 'Reports' | 'Care' | 'IP'>('Home');
  const [returnToScreen, setReturnToScreen] = useState<'dashboard' | 'patient_list'>('dashboard');
  const [autoOpenAddMember, setAutoOpenAddMember] = useState<boolean>(false);
  const [healthPoints, setHealthPoints] = useState<number>(450);
  const [activeMemberId, setActiveMemberId] = useState<string>('1');
  const [editingMember, setEditingMember] = useState<PatientMember | null>(null);
  const [selectedBannerId, setSelectedBannerId] = useState<string | undefined>();
  const [userSession, setUserSession] = useState<UserSession>({
    mobileNumber: '',
    name: '',
    isLoggedIn: false,
    healthPoints: 450,
  });

  const activeUserSession: UserSession = {
    ...userSession,
    healthPoints,
  };

  const handleSwitchAccount = (memberId: string) => {
    const { activeMember } = switchActiveAccount(memberId);
    setActiveMemberId(memberId);
    setUserSession((prev) => ({
      ...prev,
      name: activeMember.name,
      mobileNumber: activeMember.mobileNumber,
      userAvatar: getAvatarForMember(activeMember),
    }));
  };

  const handleMemberAdded = (newMember: PatientMember) => {
    if (!INITIAL_PATIENTS.some((p) => p.id === newMember.id)) {
      INITIAL_PATIENTS.unshift(newMember);
    }
    setPatientListInitialTab('Home');
    setAutoOpenAddMember(false);
    setCurrentScreen('patient_list');
  };

  const handleBackFromSubScreen = () => {
    if (returnToScreen === 'patient_list') {
      setCurrentScreen('patient_list');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  // Global Hardware Device Back Button Handler: Prevents accidental app exit
  useEffect(() => {
    const onHardwareBackPress = () => {
      if (currentScreen !== 'dashboard') {
        if (currentScreen !== 'patient_list' && returnToScreen === 'patient_list') {
          setCurrentScreen('patient_list');
        } else {
          setCurrentScreen('dashboard');
        }
        return true; // Event consumed, prevents exiting app
      }

      // On dashboard: Prompt confirmation instead of immediately terminating
      Alert.alert(
        'Exit Patient Portal',
        'Are you sure you want to close the app?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => backSubscription.remove();
  }, [currentScreen, returnToScreen]);

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserSession((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    setCurrentScreen('dashboard');
  };

  const handleChangePinRequest = () => {
    setReturnToScreen(currentScreen === 'patient_list' ? 'patient_list' : 'dashboard');
    setCurrentScreen('change_pin');
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {userSession.isLoggedIn ? (
          currentScreen === 'dashboard' ? (
            <DashboardScreen
              userSession={activeUserSession}
              onSwitchAccount={handleSwitchAccount}
              onOpenPatientList={(tab, autoAdd) => {
                setReturnToScreen('dashboard');
                setPatientListInitialTab(tab || 'Home');
                setAutoOpenAddMember(!!autoAdd);
                setCurrentScreen('patient_list');
              }}
              onOpenAddMember={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('add_member');
              }}
              onOpenBookVisit={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('book_visit');
              }}
              onOpenBookTest={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('book_test');
              }}
              onOpenPayBills={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('pay_bills');
              }}
              onOpenVisits={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('visits');
              }}
              onOpenReports={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('reports');
              }}
              onOpenCare={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('care');
              }}
              onOpenMedicines={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('medicines');
              }}
              onOpenNotifications={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('notifications');
              }}
              onOpenAnnouncements={(bannerId) => {
                setSelectedBannerId(bannerId);
                setReturnToScreen('dashboard');
                setCurrentScreen('announcements');
              }}
              onEditMember={(member) => {
                setEditingMember(member);
                setReturnToScreen('dashboard');
                setCurrentScreen('add_member');
              }}
              onLogout={handleLogout}
              onChangePin={handleChangePinRequest}
            />
          ) : currentScreen === 'notifications' ? (
            <NotificationsScreen
              userSession={activeUserSession}
              onBack={handleBackFromSubScreen}
            />
          ) : currentScreen === 'announcements' ? (
            <AnnouncementsScreen
              userSession={activeUserSession}
              initialBannerId={selectedBannerId}
              onBack={handleBackFromSubScreen}
              onOpenBookVisit={() => {
                setReturnToScreen('dashboard');
                setCurrentScreen('book_visit');
              }}
            />
          ) : currentScreen === 'medicines' ? (
            <MedicinesScreen
              userSession={activeUserSession}
              onBack={handleBackFromSubScreen}
              onAddHealthPoints={(pts) => setHealthPoints((prev) => prev + pts)}
            />
          ) : currentScreen === 'patient_list' ? (
            <PatientListScreen
              userSession={activeUserSession}
              onSwitchAccount={handleSwitchAccount}
              initialTab={patientListInitialTab}
              autoOpenAddMember={autoOpenAddMember}
              onOpenAddMember={() => {
                setEditingMember(null);
                setReturnToScreen('patient_list');
                setCurrentScreen('add_member');
              }}
              onLogout={handleLogout}
              onChangePin={handleChangePinRequest}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenBookVisit={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('book_visit');
              }}
              onOpenBookTest={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('book_test');
              }}
              onOpenPayBills={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('pay_bills');
              }}
              onOpenMedicines={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('medicines');
              }}
              onOpenVisits={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('visits');
              }}
              onOpenReports={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('reports');
              }}
              onOpenCare={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('care');
              }}
              onOpenNotifications={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('notifications');
              }}
              onOpenDiet={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('diet');
              }}
              onOpenAnnouncements={(bannerId) => {
                setSelectedBannerId(bannerId);
                setReturnToScreen('patient_list');
                setCurrentScreen('announcements');
              }}
              onEditMember={(member) => {
                setEditingMember(member);
                setReturnToScreen('patient_list');
                setCurrentScreen('add_member');
              }}
            />
          ) : currentScreen === 'diet' ? (
            <DietScreen
              userSession={activeUserSession}
              patient={INITIAL_PATIENTS.find((p) => p.id === activeMemberId || p.id === '5')}
              onBack={handleBackFromSubScreen}
              onOpenBookTest={() => {
                setReturnToScreen('patient_list');
                setCurrentScreen('book_test');
              }}
            />
          ) : currentScreen === 'change_pin' ? (
            <ChangePinScreen
              userSession={activeUserSession}
              onBack={handleBackFromSubScreen}
            />
          ) : currentScreen === 'add_member' ? (
            <AddMemberScreen
              userSession={activeUserSession}
              memberToEdit={editingMember}
              onBack={() => {
                setEditingMember(null);
                handleBackFromSubScreen();
              }}
              onMemberAdded={(newMember) => {
                setEditingMember(null);
                handleMemberAdded(newMember);
              }}
              onMemberUpdated={(updatedMember) => {
                setEditingMember(null);
                handleMemberAdded(updatedMember);
              }}
            />
          ) : currentScreen === 'book_visit' ? (
            <BookVisitScreen
              userSession={activeUserSession}
              skipPatientSelection={returnToScreen === 'patient_list'}
              onBack={handleBackFromSubScreen}
              onBookingSuccess={handleBackFromSubScreen}
              onAddHealthPoints={(pts) => setHealthPoints((prev) => prev + pts)}
            />
          ) : currentScreen === 'book_test' ? (
            <BookTestScreen
              userSession={activeUserSession}
              onBack={handleBackFromSubScreen}
              onOpenVisits={() => setCurrentScreen('visits')}
              onAddHealthPoints={(pts) => setHealthPoints((prev) => prev + pts)}
            />
          ) : currentScreen === 'pay_bills' ? (
            <PayBillsScreen
              userSession={userSession}
              onBack={handleBackFromSubScreen}
              onAddHealthPoints={(pts) => setHealthPoints((prev) => prev + pts)}
            />
          ) : currentScreen === 'visits' ? (
            <VisitsScreen
              userSession={userSession}
              onBack={handleBackFromSubScreen}
              onBookNewVisit={() => setCurrentScreen('book_visit')}
              onOpenHome={() => setCurrentScreen('dashboard')}
              onOpenPatientList={(tab) => {
                setPatientListInitialTab(tab || 'Home');
                setCurrentScreen('patient_list');
              }}
              onOpenReports={() => setCurrentScreen('reports')}
              onOpenCare={() => setCurrentScreen('care')}
            />
          ) : currentScreen === 'reports' ? (
            <ReportsScreen
              userSession={userSession}
              onBack={handleBackFromSubScreen}
              onOpenHome={() => setCurrentScreen('dashboard')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onOpenPatientList={(tab) => {
                setPatientListInitialTab(tab || 'Home');
                setCurrentScreen('patient_list');
              }}
              onOpenCare={() => setCurrentScreen('care')}
            />
          ) : (
            <CareScreen
              userSession={activeUserSession}
              onBack={handleBackFromSubScreen}
              onOpenHome={() => setCurrentScreen('dashboard')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onOpenReports={() => setCurrentScreen('reports')}
              onOpenPatientList={(tab) => {
                setPatientListInitialTab(tab || 'Home');
                setCurrentScreen('patient_list');
              }}
            />
          )
        ) : (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} duration={2500} />
        )}

        {/* Global App-Themed Curvy Alert Dialog */}
        <CustomAlertContainer />
      </View>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF5F8',
  },
});

export default App;
