import { Session } from '@supabase/supabase-js';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import '../global.css';
import GlobalProvider from './context/GlobalProvider';
import { supabase } from './lib/supabase';

SplashScreen.preventAutoHideAsync();

const RootLayout = (): React.JSX.Element => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Only redirect if user successfully signs in
      if (session) {
        router.replace('/(tabs)/home'); // Go to main app after successful login
      }
      // Remove automatic redirect to sign-in - let users navigate naturally
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);
  
  if (!fontsLoaded && !error && isLoading) return <></>;  // Return empty fragment instead of null

  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </GlobalProvider>
  );
}

export default RootLayout;