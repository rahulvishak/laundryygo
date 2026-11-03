import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, CalendarDays, Clock3, Droplets, ShieldCheck, UserRound } from 'lucide-react-native';

import { defaultBookings, defaultMachines, defaultProfile, formatCurrency, getMachineById, type Booking, type Machine, type Profile } from '../lib/data';
import { readStorage, subscribeStorage } from '../lib/storage';

const STORAGE_KEYS = {
  profile: 'laundryq-profile',
  machines: 'laundryq-machines',
  bookings: 'laundryq-bookings',
};

export default function LaundryDashboard() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);

  useEffect(() => {
    const unsubscribe = [
      subscribeStorage<Profile>(STORAGE_KEYS.profile, setProfile),
      subscribeStorage<Machine[]>(STORAGE_KEYS.machines, setMachines),
      subscribeStorage<Booking[]>(STORAGE_KEYS.bookings, setBookings),
    ];

    const load = async () => {
      const [savedProfile, savedMachines, savedBookings] = await Promise.all([
        readStorage<Profile>(STORAGE_KEYS.profile, defaultProfile),
        readStorage<Machine[]>(STORAGE_KEYS.machines, defaultMachines),
        readStorage<Booking[]>(STORAGE_KEYS.bookings, defaultBookings),
      ]);

      setProfile(savedProfile);
      setMachines(savedMachines);
      setBookings(savedBookings);
    };

    load();

    return () => unsubscribe.forEach((removeListener) => removeListener());
  }, []);

  const today = new Date();
  const availableMachines = machines.filter((machine) => machine.status === 'Available').length;
  const occupiedMachines = machines.filter((machine) => machine.status === 'Booked').length;
  const upcomingBookings = bookings.filter((booking) => booking.status === 'Upcoming');
  const nextBooking = upcomingBookings[0];

  const stats = useMemo(
    () => [
      { label: 'Total machines', value: '06' },
      { label: 'Available', value: String(availableMachines) },
      { label: 'Occupied', value: String(occupiedMachines) },
      { label: 'Upcoming', value: String(upcomingBookings.length) },
    ],
    [availableMachines, occupiedMachines, upcomingBookings.length],
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>Laundry Go</Text>
          <Text style={styles.title}>Welcome back, {profile.fullName.split(' ')[0]}</Text>
          <Text style={styles.roomLabel}>Room {profile.roomNumber}</Text>
        </View>
        <Link href="/profile" asChild>
          <Pressable style={styles.avatarShell}>
            {profile.photoUrl ? <Image source={{ uri: profile.photoUrl }} style={styles.avatar} /> : <UserRound size={23} color="#0f766e" />}
          </Pressable>
        </Link>
      </View>

      <View style={styles.dateCard}>
        <CalendarDays size={18} color="#0f766e" />
        <Text style={styles.dateText}>{today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerLabel}>Upcoming booking</Text>
          <Text style={styles.bannerTitle}>
            {nextBooking ? `${getMachineById(machines, nextBooking.machineId)?.name ?? 'Machine'} · ${nextBooking.bookingDate}` : 'No upcoming reservations'}
          </Text>
          <Text style={styles.bannerMeta}>
            {nextBooking ? `${nextBooking.startTime} to ${nextBooking.endTime} · ${formatCurrency(nextBooking.amount)}` : 'Add a slot to plan your laundry day'}
          </Text>
        </View>
        <ShieldCheck size={28} color="#ffffff" />
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/booking')}>
          <Text style={styles.primaryText}>Quick Book Now</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/booking')}>
          <Text style={styles.secondaryText}>View All Machines</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available machines</Text>
      </View>

      <View style={styles.machinesGrid}>
        {machines.map((machine) => (
          <View key={machine.id} style={styles.machineCard}>
            <View style={styles.machineHeadline}>
              <Text style={styles.machineName}>{machine.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  machine.status === 'Available' && styles.availableBadge,
                  machine.status === 'Booked' && styles.bookedBadge,
                  machine.status === 'Maintenance' && styles.maintenanceBadge,
                ]}
              >
                <Text style={styles.statusText}>{machine.status}</Text>
              </View>
            </View>

            <Text style={styles.machineBay}>{machine.bay}</Text>
            <View style={styles.slotRow}>
              <Clock3 size={14} color="#54627a" />
              <Text style={styles.machineSlot}>Next available: {machine.nextSlot}</Text>
            </View>

            <Pressable
              style={[
                styles.bookButton,
                machine.status === 'Maintenance' && styles.disabledBookButton,
              ]}
              onPress={() => router.push({ pathname: '/booking', params: { machineId: String(machine.id) } })}
              disabled={machine.status === 'Maintenance'}
            >
              <Text style={styles.bookButtonText}>{machine.status === 'Maintenance' ? 'Unavailable' : 'Book Now'}</Text>
              <ArrowRight size={14} color="#ffffff" />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent booking details</Text>
      </View>

      <View style={styles.historyCard}>
        {bookings.slice(0, 2).map((booking) => {
          const machine = getMachineById(machines, booking.machineId);
          return (
            <View key={booking.id} style={styles.bookingRow}>
              <View style={styles.bookingBadge}><Droplets size={14} color="#0f766e" /></View>
              <View style={styles.bookingTextWrap}>
                <Text style={styles.bookingMachine}>{machine?.name ?? `Machine ${booking.machineId}`}</Text>
                <Text style={styles.bookingMeta}>{booking.bookingDate} · {booking.startTime} – {booking.endTime}</Text>
              </View>
              <Text style={styles.bookingAmount}>{formatCurrency(booking.amount)}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f8f6' },
  content: { padding: 20, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  kicker: { fontSize: 12, fontWeight: '700', color: '#0f766e', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginTop: 4 },
  roomLabel: { color: '#64748b', fontSize: 13, marginTop: 4 },
  avatarShell: { width: 52, height: 52, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#b8ded5', backgroundColor: '#e5f4f0', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: '100%', height: '100%' },
  dateCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: '#e5f4f0', marginBottom: 18 },
  dateText: { marginLeft: 8, fontSize: 15, color: '#113261', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 },
  statCard: { width: '48%', backgroundColor: '#ffffff', padding: 16, borderRadius: 18, marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#475569', marginTop: 6, fontWeight: '600' },
  banner: { backgroundColor: '#0f766e', borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  bannerLabel: { color: '#cfe0ff', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  bannerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  bannerMeta: { color: '#dbeafe', fontSize: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  primaryButton: { flex: 1, backgroundColor: '#0f766e', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginRight: 8 },
  primaryText: { color: '#ffffff', fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#e2e8f0', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginLeft: 8 },
  secondaryText: { color: '#1e293b', fontWeight: '700' },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  machinesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  machineCard: { width: '48%', backgroundColor: '#ffffff', padding: 14, borderRadius: 18, marginBottom: 12, shadowColor: '#dfe7ff', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  machineHeadline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  machineName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  availableBadge: { backgroundColor: '#dcfce7' },
  bookedBadge: { backgroundColor: '#fef3c7' },
  maintenanceBadge: { backgroundColor: '#fbd5d5' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#0f172a', textTransform: 'uppercase' },
  machineBay: { color: '#475569', fontSize: 12, marginTop: 8 },
  slotRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  machineSlot: { marginLeft: 6, color: '#334155', fontSize: 12 },
  bookButton: { marginTop: 14, backgroundColor: '#0f766e', paddingVertical: 11, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  disabledBookButton: { backgroundColor: '#cbd5e1' },
  bookButtonText: { color: '#ffffff', fontWeight: '700', marginRight: 6 },
  historyCard: { backgroundColor: '#ffffff', borderRadius: 18, padding: 14 },
  bookingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2ff' },
  bookingBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#e5f4f0', alignItems: 'center', justifyContent: 'center' },
  bookingTextWrap: { flex: 1, marginLeft: 10 },
  bookingMachine: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  bookingMeta: { color: '#64748b', fontSize: 12, marginTop: 3 },
  bookingAmount: { fontSize: 14, fontWeight: '700', color: '#0ea5e9' },
});
