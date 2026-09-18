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
import { CustomAlertContainer } from './components/CustomAlert';
import { UserSession, PatientMember } from './components/types';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { INITIAL_PATIENTS } from './components/mockData';

function AppContent() {
  const { isDark, colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'patient_list' | 'book_visit' | 'pay_bills' | 'visits' | 'reports' | 'book_test' | 'add_member' | 'care'>('dashboard');
  const [patientListInitialTab, setPatientListInitialTab] = useState<'Home' | 'Visits' | 'Reports' | 'Care'>('Home');
  const [autoOpenAddMember, setAutoOpenAddMember] = useState<boolean>(false);
  const [healthPoints, setHealthPoints] = useState<number>(450);
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

  const handleMemberAdded = (newMember: PatientMember) => {
    if (!INITIAL_PATIENTS.some((p) => p.id === newMember.id)) {
      INITIAL_PATIENTS.unshift(newMember);
    }
    setPatientListInitialTab('Home');
    setAutoOpenAddMember(false);
    setCurrentScreen('patient_list');
  };

  // Global Hardware Device Back Button Handler: Prevents accidental app exit
  useEffect(() => {
    const onHardwareBackPress = () => {
      if (currentScreen !== 'dashboard') {
        // Navigate back to dashboard smoothly
        setCurrentScreen('dashboard');
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
  }, [currentScreen]);

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
    setUserSession((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {userSession.isLoggedIn ? (
          currentScreen === 'dashboard' ? (
            <DashboardScreen
              userSession={activeUserSession}
              onOpenPatientList={(tab, autoAdd) => {
                setPatientListInitialTab(tab || 'Home');
                setAutoOpenAddMember(!!autoAdd);
                setCurrentScreen('patient_list');
              }}
              onOpenAddMember={() => setCurrentScreen('add_member')}
              onOpenBookVisit={() => setCurrentScreen('book_visit')}
              onOpenBookTest={() => setCurrentScreen('book_test')}
              onOpenPayBills={() => setCurrentScreen('pay_bills')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onOpenReports={() => setCurrentScreen('reports')}
              onOpenCare={() => setCurrentScreen('care')}
              onLogout={handleLogout}
              onChangePin={handleChangePinRequest}
            />
          ) : currentScreen === 'patient_list' ? (
            <PatientListScreen
              userSession={activeUserSession}
              initialTab={patientListInitialTab}
              autoOpenAddMember={autoOpenAddMember}
              onOpenAddMember={() => setCurrentScreen('add_member')}
              onLogout={handleLogout}
              onChangePin={handleChangePinRequest}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onOpenReports={() => setCurrentScreen('reports')}
              onOpenCare={() => setCurrentScreen('care')}
            />
          ) : currentScreen === 'add_member' ? (
            <AddMemberScreen
              userSession={activeUserSession}
              onBack={() => setCurrentScreen('patient_list')}
              onMemberAdded={handleMemberAdded}
            />
          ) : currentScreen === 'book_visit' ? (
            <BookVisitScreen
              userSession={activeUserSession}
              onBack={() => setCurrentScreen('dashboard')}
              onBookingSuccess={() => setCurrentScreen('dashboard')}
            />
          ) : currentScreen === 'book_test' ? (
            <BookTestScreen
              userSession={activeUserSession}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onAddHealthPoints={(pts) => setHealthPoints((prev) => prev + pts)}
            />
          ) : currentScreen === 'pay_bills' ? (
            <PayBillsScreen
              userSession={userSession}
              onBack={() => setCurrentScreen('dashboard')}
            />
          ) : currentScreen === 'visits' ? (
            <VisitsScreen
              userSession={userSession}
              onBack={() => setCurrentScreen('dashboard')}
              onBookNewVisit={() => setCurrentScreen('book_visit')}
              onOpenHome={() => setCurrentScreen('dashboard')}
              onOpenPatientList={() => {
                setPatientListInitialTab('Reports');
                setCurrentScreen('patient_list');
              }}
              onOpenReports={() => setCurrentScreen('reports')}
              onOpenCare={() => setCurrentScreen('care')}
            />
          ) : currentScreen === 'reports' ? (
            <ReportsScreen
              userSession={userSession}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenHome={() => setCurrentScreen('dashboard')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onOpenPatientList={() => {
                setPatientListInitialTab('Reports');
                setCurrentScreen('patient_list');
              }}
              onOpenCare={() => setCurrentScreen('care')}
            />
          ) : (
            <CareScreen
              userSession={activeUserSession}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenHome={() => setCurrentScreen('dashboard')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onOpenReports={() => setCurrentScreen('reports')}
              onOpenPatientList={() => {
                setPatientListInitialTab('Home');
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
