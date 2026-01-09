import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme() || 'light';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(NAV_THEME[colorScheme].colors.background);
  }, [colorScheme]);

  return (
    <>
      <ThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <PortalHost />
      </ThemeProvider>
    </>
  );
}
