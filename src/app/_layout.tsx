import {DarkTheme, DefaultTheme, Stack, ThemeProvider} from 'expo-router';
import {useColorScheme} from 'react-native';

import {AnimatedSplashOverlay} from '@/components/animated-icon';
import {Providers} from '@/providers';
import {useAuthStore} from '@/store/auth-store';
import {AuthScreen} from '@/components/auth-screen';

function AppContent() {
  const student = useAuthStore((s) => s.student);

  if (!student) {
    return <AuthScreen/>;
  }

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen name="notifications"/>
      <Stack.Screen name="class/[id]"/>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Providers>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay/>
        <AppContent/>
      </ThemeProvider>
    </Providers>
  );
}
