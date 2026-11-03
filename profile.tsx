import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LogOut, UserRound } from 'lucide-react-native';
import { router } from 'expo-router';

import { defaultProfile, type Profile } from '../lib/data';
import { readStorage, writeStorageStrict } from '../lib/storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      const savedProfile = await readStorage<Profile>('laundryq-profile', defaultProfile);
      const authenticated = await readStorage<boolean>('laundryq-authenticated', false);
      setProfile(savedProfile);
      setIsLoggedIn(authenticated);
    };

    load();
  }, []);

  const handleLogout = async () => {
    try {
      await writeStorageStrict('laundryq-authenticated', false);
      setIsLoggedIn(false);
      router.replace('/');
    } catch (error) {
      Alert.alert('Could not sign out', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your profile</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{isLoggedIn ? 'Logged in' : 'Guest'}</Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        {profile.photoUrl ? <Image source={{ uri: profile.photoUrl }} style={styles.avatar} /> : (
          <View style={styles.avatarFallback}><UserRound size={36} color="#0f766e" /></View>
        )}
        <Text style={styles.name}>{profile.fullName}</Text>
        <Text style={styles.subtext}>Room {profile.roomNumber}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button">
        <LogOut size={17} color="#ffffff" />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f8f6' },
  content: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  statusPill: { backgroundColor: '#ccfbf1', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  statusText: { fontWeight: '700', color: '#0f766e' },
  profileCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  avatarFallback: { width: 90, height: 90, borderRadius: 45, marginBottom: 12, backgroundColor: '#e5f4f0', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtext: { color: '#64748b', marginTop: 4 },
  logoutButton: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  logoutText: { color: '#ffffff', fontWeight: '700' },
});
