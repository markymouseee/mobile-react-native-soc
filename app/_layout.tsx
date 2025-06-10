import { Poppins_400Regular, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import Navigation from './Navigation';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [fontsLoad] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'Pacifico-Regular': require('../assets/fonts/Pacifico-Regular.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  useEffect(() => {
    if (fontsLoad) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoad]);

  if (!fontsLoaded) return null;


  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0c1021' }}>
          <StatusBar style="light" backgroundColor="#0c1021" translucent />
          <Navigation />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}