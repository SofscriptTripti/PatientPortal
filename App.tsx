

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, BackHandler, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import PatientListScreen from './components/PatientListScreen';
import BookVisitScreen from './components/BookVisitScreen';
import PayBillsScreen from './components/PayBillsScreen';
import VisitsScreen from './components/VisitsScreen';
import { CustomAlertContainer } from './components/CustomAlert';
import { UserSession } from './components/types';
import { ThemeProvider, useTheme } from './components/ThemeContext';

function AppContent() {
  const { isDark, colors } = useTheme();
  const [showSplash, setShowSplash] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'patient_list' | 'book_visit' | 'pay_bills' | 'visits'>('dashboard');
  const [patientListInitialTab, setPatientListInitialTab] = useState<'Home' | 'Visits' | 'Reports' | 'Care'>('Reports');
  const [userSession, setUserSession] = useState<UserSession>({
    mobileNumber: '9414023873',
    name: 'Rathi Vijay Sharma',
    isLoggedIn: true,
  });

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
              userSession={userSession}
              onOpenPatientList={(tab) => {
                setPatientListInitialTab(tab || 'Reports');
                setCurrentScreen('patient_list');
              }}
              onOpenBookVisit={() => setCurrentScreen('book_visit')}
              onOpenPayBills={() => setCurrentScreen('pay_bills')}
              onOpenVisits={() => setCurrentScreen('visits')}
              onLogout={handleLogout}
              onChangePin={handleChangePinRequest}
            />
          ) : currentScreen === 'patient_list' ? (
            <PatientListScreen
              userSession={userSession}
              initialTab={patientListInitialTab}
              onLogout={handleLogout}
              onChangePin={handleChangePinRequest}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenVisits={() => setCurrentScreen('visits')}
            />
          ) : currentScreen === 'book_visit' ? (
            <BookVisitScreen
              userSession={userSession}
              onBack={() => setCurrentScreen('dashboard')}
              onBookingSuccess={() => setCurrentScreen('dashboard')}
            />
          ) : currentScreen === 'pay_bills' ? (
            <PayBillsScreen
              userSession={userSession}
              onBack={() => setCurrentScreen('dashboard')}
            />
          ) : (
            <VisitsScreen
              userSession={userSession}
              onBack={() => setCurrentScreen('dashboard')}
              onBookNewVisit={() => setCurrentScreen('book_visit')}
              onOpenHome={() => setCurrentScreen('dashboard')}
              onOpenPatientList={() => {
                setPatientListInitialTab('Reports');
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
