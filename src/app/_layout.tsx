import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Providers } from '@/providers';
import { useAuthStore } from '@/store/auth-store';
import { AuthScreen } from '@/components/auth-screen';

function AppContent() {
  const student = useAuthStore((s) => s.student);

  if (!student) {
    return <AuthScreen />;
  }

  return <AppTabs />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Providers>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppContent />
      </ThemeProvider>
    </Providers>
  );
}
