import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Clock3, ReceiptText } from 'lucide-react-native';

import { defaultBookings, defaultMachines, defaultTransactions, formatCurrency, getMachineById, type Booking, type Machine, type Transaction } from '../lib/data';
import { readStorage } from '../lib/storage';

const STORAGE_KEYS = {
  bookings: 'laundryq-bookings',
  transactions: 'laundryq-transactions',
};

type Filter = 'All' | 'Upcoming' | 'Completed' | 'Cancelled';

export default function HistoryScreen() {
  const [bookings, setBookings] = useState<Booking[]>(defaultBookings);
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    const load = async () => {
      const [savedBookings, savedMachines, savedTransactions] = await Promise.all([
        readStorage<Booking[]>(STORAGE_KEYS.bookings, defaultBookings),
        readStorage<Machine[]>('laundryq-machines', defaultMachines),
        readStorage<Transaction[]>(STORAGE_KEYS.transactions, defaultTransactions),
      ]);

      setBookings(savedBookings);
      setMachines(savedMachines);
      setTransactions(savedTransactions);
    };

    load();
  }, []);

  const filteredBookings = useMemo(() => {
    const next = filter === 'All' ? bookings : bookings.filter((booking) => booking.status === filter);
    return [...next].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }, [bookings, filter]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>Your previous and upcoming booking timeline.</Text>

      <View style={styles.filterRow}>
        {(['All', 'Upcoming', 'Completed', 'Cancelled'] as Filter[]).map((option) => (
          <Pressable
            key={option}
            style={[styles.filterButton, filter === option && styles.filterSelected]}
            onPress={() => setFilter(option)}
          >
            <Text style={[styles.filterText, filter === option && styles.filterTextSelected]}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No records</Text>
          <Text style={styles.emptyText}>No bookings match the selected filter.</Text>
        </View>
      ) : (
        filteredBookings.map((booking) => {
          const machine = getMachineById(machines, booking.machineId);
          const transaction = transactions.find((item) => item.bookingId === booking.id);
          const paymentStatus = booking.status === 'Cancelled' ? 'Refunded' : booking.status === 'Completed' ? 'Paid' : 'Pending';

          return (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.bookingId}>{booking.id}</Text>
                <Text style={[styles.statusBadge, booking.status === 'Upcoming' && styles.upcomingBadge, booking.status === 'Completed' && styles.completedBadge, booking.status === 'Cancelled' && styles.cancelledBadge]}>
                  {booking.status}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <ReceiptText size={15} color="#475569" />
                <Text style={styles.detailText}>{machine?.name ?? `Machine ${booking.machineId}`}</Text>
              </View>

              <View style={styles.detailRow}>
                <Clock3 size={15} color="#475569" />
                <Text style={styles.detailText}>{booking.bookingDate} · {booking.startTime} – {booking.endTime}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.amount}>{formatCurrency(booking.amount)}</Text>
                <Text style={styles.paymentStatus}>{paymentStatus}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f8f6' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#475569', marginTop: 6, marginBottom: 18 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  filterButton: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#e5f4f0', marginRight: 8, marginBottom: 8 },
  filterSelected: { backgroundColor: '#0f766e' },
  filterText: { color: '#1e293b', fontWeight: '700' },
  filterTextSelected: { color: '#ffffff' },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bookingId: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontWeight: '700', fontSize: 10 },
  upcomingBadge: { backgroundColor: '#ccfbf1', color: '#0f766e' },
  completedBadge: { backgroundColor: '#dcfce7', color: '#166534' },
  cancelledBadge: { backgroundColor: '#fef3c7', color: '#92400e' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { marginLeft: 8, color: '#475569', fontSize: 13 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  amount: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  paymentStatus: { color: '#475569', fontWeight: '700' },
  emptyState: { backgroundColor: '#ffffff', borderRadius: 18, padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  emptyText: { marginTop: 8, color: '#64748b' },
});
