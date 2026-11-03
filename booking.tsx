import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarDays, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react-native';

import { defaultBookings, defaultMachines, formatCurrency, hasTimeConflict, isPastSlot, type Booking, type Machine, timeSlots } from '../lib/data';
import { readStorage, subscribeStorage, writeStorage } from '../lib/storage';

const STORAGE_KEY = 'laundryq-bookings';

function getNextFiveDates() {
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      iso: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });
}

export default function BookingScreen() {
  const params = useLocalSearchParams<{ machineId?: string }>();
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [selectedMachineId, setSelectedMachineId] = useState<number>(Number(params.machineId ?? 1));
  const [selectedDate, setSelectedDate] = useState<string>(getNextFiveDates()[0].iso);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(timeSlots[0].label);

  useEffect(() => {
    const unsubscribe = [
      subscribeStorage<Machine[]>('laundryq-machines', setMachines),
      subscribeStorage<Booking[]>(STORAGE_KEY, setBookings),
    ];

    const load = async () => {
      const [savedMachines, savedBookings] = await Promise.all([
        readStorage<Machine[]>('laundryq-machines', defaultMachines),
        readStorage<Booking[]>(STORAGE_KEY, defaultBookings),
      ]);

      setMachines(savedMachines);
      setBookings(savedBookings);
    };

    load();

    return () => unsubscribe.forEach((removeListener) => removeListener());
  }, []);

  const nextDates = useMemo(() => getNextFiveDates(), []);
  const selectedMachine = machines.find((machine) => machine.id === selectedMachineId) ?? machines[0];
  const slot = timeSlots.find((entry) => entry.label === selectedSlot) ?? timeSlots[0];
  const isConflict = hasTimeConflict(selectedDate, slot.start, slot.end, selectedMachineId, bookings);
  const slotUnavailable = isPastSlot(selectedDate, slot.start) || isConflict;

  const handleBook = async () => {
    if (!selectedMachine || !slot) {
      Alert.alert('Booking incomplete', 'Please choose a machine and time slot.');
      return;
    }

    if (isPastSlot(selectedDate, slot.start)) {
      Alert.alert('Time in the past', 'Choose a future slot for booking.');
      return;
    }

    if (isConflict) {
      Alert.alert('Slot unavailable', 'The selected machine is already booked for that time.');
      return;
    }

    const nextBooking: Booking = {
      id: `LQ-${Date.now().toString().slice(-6)}`,
      userId: 'student-1',
      machineId: selectedMachineId,
      bookingDate: selectedDate,
      startTime: slot.start,
      endTime: slot.end,
      status: 'Upcoming',
      amount: 149,
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [nextBooking, ...bookings];
    await writeStorage(STORAGE_KEY, updatedBookings);

    const machineStatus = machines.map((machine) =>
      machine.id === selectedMachineId ? { ...machine, status: 'Booked', nextSlot: `${slot.label}` } : machine,
    );
    await writeStorage('laundryq-machines', machineStatus);

    Alert.alert('Reservation confirmed', `Booking ID: ${nextBooking.id}`);
    router.push('/history');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Slot booking</Text>
      <Text style={styles.subtitle}>Choose the machine, date, and preferred slot.</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Select washing machine</Text>
        <View style={styles.machineOptions}>
          {machines.map((machine) => (
            <Pressable
              key={machine.id}
              style={[
                styles.machineOption,
                selectedMachineId === machine.id && styles.machineSelected,
                machine.status === 'Maintenance' && styles.machineDisabled,
              ]}
              onPress={() => machine.status !== 'Maintenance' && setSelectedMachineId(machine.id)}
              disabled={machine.status === 'Maintenance'}
            >
              <Text style={styles.machineOptionName}>{machine.name}</Text>
              <Text style={styles.machineOptionMeta}>{machine.status}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Choose booking date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {nextDates.map((date) => (
            <Pressable
              key={date.iso}
              style={[styles.dateButton, selectedDate === date.iso && styles.dateSelected]}
              onPress={() => setSelectedDate(date.iso)}
            >
              <CalendarDays size={16} color={selectedDate === date.iso ? '#ffffff' : '#0f766e'} />
              <Text style={[styles.dateLabel, selectedDate === date.iso && styles.dateLabelSelected]}>{date.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Available time slots</Text>
        <View style={styles.slotGrid}>
          {timeSlots.map((entry) => {
            const isUnavailable = hasTimeConflict(selectedDate, entry.start, entry.end, selectedMachineId, bookings) || isPastSlot(selectedDate, entry.start);
            return (
              <Pressable
                key={entry.label}
                style={[
                  styles.slotButton,
                  selectedSlot === entry.label && styles.slotSelected,
                  isUnavailable && styles.slotUnavailable,
                ]}
                onPress={() => !isUnavailable && setSelectedSlot(entry.label)}
                disabled={isUnavailable}
              >
                <Text style={[styles.slotText, selectedSlot === entry.label && styles.slotTextSelected]}>{entry.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Machine</Text>
          <Text style={styles.summaryValue}>{selectedMachine?.name ?? 'Machine 01'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date</Text>
          <Text style={styles.summaryValue}>{selectedDate}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time</Text>
          <Text style={styles.summaryValue}>{slot.label}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>1 hour</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>{formatCurrency(149)}</Text>
        </View>
      </View>

      <Pressable style={[styles.confirmButton, slotUnavailable && styles.confirmDisabled]} onPress={handleBook} disabled={slotUnavailable}>
        <CheckCircle2 size={18} color="#ffffff" />
        <Text style={styles.confirmText}>Confirm reservation</Text>
      </Pressable>

      <View style={styles.infoRow}>
        <ShieldCheck size={16} color="#0f766e" />
        <Text style={styles.infoText}>No overlapping bookings allowed. System blocks duplicates automatically.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f8f6' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#4b5563', marginTop: 6, marginBottom: 18 },
  sectionCard: { backgroundColor: '#ffffff', borderRadius: 18, padding: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, color: '#0f172a' },
  machineOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  machineOption: { width: '30%', backgroundColor: '#e5f4f0', borderRadius: 14, padding: 10, margin: 4, alignItems: 'center' },
  machineSelected: { backgroundColor: '#ccfbf1', borderWidth: 1, borderColor: '#0f766e' },
  machineDisabled: { opacity: 0.45 },
  machineOptionName: { fontWeight: '700', color: '#0f172a' },
  machineOptionMeta: { fontSize: 10, marginTop: 4, color: '#475569' },
  dateRow: { paddingRight: 8 },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e5f4f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginRight: 10 },
  dateSelected: { backgroundColor: '#0f766e' },
  dateLabel: { marginLeft: 6, color: '#1e293b', fontWeight: '600' },
  dateLabelSelected: { color: '#ffffff' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  slotButton: { width: '47%', borderRadius: 12, padding: 12, margin: 4, backgroundColor: '#e5f4f0' },
  slotSelected: { backgroundColor: '#ccfbf1', borderWidth: 1, borderColor: '#0f766e' },
  slotUnavailable: { backgroundColor: '#e5e7eb', opacity: 0.7 },
  slotText: { color: '#0f172a', fontWeight: '600' },
  slotTextSelected: { color: '#0f766e' },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 18 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#64748b' },
  summaryValue: { fontWeight: '700', color: '#0f172a' },
  confirmButton: { backgroundColor: '#0f766e', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  confirmDisabled: { backgroundColor: '#cbd5e1' },
  confirmText: { color: '#ffffff', fontWeight: '800', marginLeft: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  infoText: { marginLeft: 8, color: '#0f766e', fontSize: 12 },
});
