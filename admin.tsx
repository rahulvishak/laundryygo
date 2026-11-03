import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, ListFilter, Shield } from 'lucide-react-native';

import { defaultBookings, defaultMachines, type Booking, type Machine } from '../lib/data';
import { readStorage, writeStorage } from '../lib/storage';

const machineStatusOptions: Array<'Available' | 'Booked' | 'Maintenance'> = ['Available', 'Booked', 'Maintenance'];

export default function AdminScreen() {
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);

  useEffect(() => {
    const load = async () => {
      const [savedMachines, savedBookings] = await Promise.all([
        readStorage<Machine[]>('laundryq-machines', defaultMachines),
        readStorage<Booking[]>('laundryq-bookings', defaultBookings),
      ]);

      setMachines(savedMachines);
      setBookings(savedBookings);
    };

    load();
  }, []);

  const handleStatusChange = async (machineId: number, nextStatus: 'Available' | 'Booked' | 'Maintenance') => {
    const updated = machines.map((machine) =>
      machine.id === machineId ? { ...machine, status: nextStatus, nextSlot: nextStatus === 'Available' ? 'Next slot open' : nextStatus === 'Booked' ? 'In use by hostel student' : 'Under maintenance' } : machine,
    );

    setMachines(updated);
    await writeStorage('laundryq-machines', updated);
  };

  const totalStudents = 184;
  const activeBookings = bookings.filter((b) => b.status === 'Upcoming').length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Admin dashboard</Text>
      <Text style={styles.subtitle}>Controls for hostel operations and booking oversight.</Text>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Registered students</Text>
          <Text style={styles.summaryValue}>{totalStudents}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Active bookings</Text>
          <Text style={styles.summaryValue}>{activeBookings}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Machines online</Text>
          <Text style={styles.summaryValue}>{machines.filter((m) => m.status !== 'Maintenance').length}/6</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Machine status board</Text>
        {machines.map((machine) => (
          <View key={machine.id} style={styles.machineRow}>
            <View>
              <Text style={styles.machineName}>{machine.name}</Text>
              <Text style={styles.machineMeta}>{machine.bay}</Text>
            </View>
            <View style={styles.statusBlock}>
              {machineStatusOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => handleStatusChange(machine.id, option)}
                  style={[styles.statusPill, machine.status === option && styles.statusSelected]}
                >
                  <Text style={[styles.statusText, machine.status === option && styles.statusTextSelected]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Booking oversight</Text>
        {bookings.slice(0, 4).map((booking) => (
          <View key={booking.id} style={styles.bookingRow}>
            <View>
              <Text style={styles.bookingId}>{booking.id}</Text>
              <Text style={styles.bookingMeta}>{booking.bookingDate} · Machine {booking.machineId}</Text>
            </View>
            <View style={styles.bookStatusPill}>
              <Text style={styles.bookStatusText}>{booking.status}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.adminActions}>
        <Pressable style={styles.primaryAction}>
          <Shield size={16} color="#ffffff" />
          <Text style={styles.primaryText}>Role-based access</Text>
        </Pressable>
        <Pressable style={styles.secondaryAction}>
          <ListFilter size={16} color="#0f766e" />
          <Text style={styles.secondaryText}>Operating hours</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f8f6' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#475569', marginTop: 6, marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  summaryCard: { width: '31%', backgroundColor: '#ffffff', borderRadius: 16, padding: 14 },
  summaryLabel: { color: '#64748b', fontSize: 11 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 6 },
  panel: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 18 },
  panelTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  machineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2ff' },
  machineName: { fontWeight: '700', color: '#0f172a' },
  machineMeta: { fontSize: 12, color: '#64748b', marginTop: 5 },
  statusBlock: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: '#eef2ff', marginLeft: 4 },
  statusSelected: { backgroundColor: '#ccfbf1' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' },
  statusTextSelected: { color: '#0f766e' },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2ff' },
  bookingId: { fontWeight: '700', color: '#0f172a' },
  bookingMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  bookStatusPill: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
  bookStatusText: { fontWeight: '700', color: '#166534' },
  adminActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  primaryAction: { flex: 1, backgroundColor: '#111827', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  primaryText: { color: '#ffffff', fontWeight: '700', marginLeft: 8 },
  secondaryAction: { flex: 1, backgroundColor: '#e2e8f0', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  secondaryText: { color: '#0f766e', fontWeight: '700', marginLeft: 8 },
});
