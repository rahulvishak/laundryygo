import { router, Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { readStorage } from '../lib/storage';

export default function RootLayout() {
  const segments = useSegments();
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    readStorage<boolean>('laundryq-authenticated', false).then(() => setSessionLoaded(true));
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;

    let active = true;
    readStorage<boolean>('laundryq-authenticated', false).then((authenticated) => {
      if (!active) return;

      const isLoginScreen = segments[0] === 'index';
      if (authenticated && isLoginScreen) {
        router.replace('/home');
      } else if (!authenticated && !isLoginScreen) {
        router.replace('/');
      }
    });

    return () => {
      active = false;
    };
  }, [segments, sessionLoaded]);

  if (!sessionLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f1f8f6' },
        animation: 'slide_from_right',
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f8f6' },
});
