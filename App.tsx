/**
 * Bethany Hospitals - Patient Portal
 * React Native Application
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import PatientListScreen from './components/PatientListScreen';
import { UserSession } from './components/types';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userSession, setUserSession] = useState<UserSession>({
    mobileNumber: '9819863084',
    name: 'CHOUGULE MINAL SACHIN',
    isLoggedIn: false,
  });

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
  };

  const handleLogout = () => {
    setUserSession((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
  };

  const handleChangePinRequest = () => {
    // Return to auth screen in change PIN mode
    setUserSession((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {userSession.isLoggedIn ? (
          <PatientListScreen
            userSession={userSession}
            onLogout={handleLogout}
            onChangePin={handleChangePinRequest}
          />
        ) : (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} duration={2500} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
});

export default App;
