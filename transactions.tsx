import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CircleDollarSign, CreditCard, Wallet } from 'lucide-react-native';

import { defaultTransactions, type Transaction } from '../lib/data';
import { readStorage } from '../lib/storage';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);

  useEffect(() => {
    const load = async () => {
      const savedTransactions = await readStorage<Transaction[]>('laundryq-transactions', defaultTransactions);
      setTransactions(savedTransactions);
    };

    load();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.subtitle}>Recent payment activity and booking settlement records.</Text>

      {transactions.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.id}>{entry.id}</Text>
            <Text style={[styles.status, entry.status === 'Paid' && styles.paid, entry.status === 'Refunded' && styles.refunded, entry.status === 'Pending' && styles.pending]}>{entry.status}</Text>
          </View>

          <View style={styles.detailRow}>
            <CircleDollarSign size={15} color="#475569" />
            <Text style={styles.meta}>Booking {entry.bookingId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Wallet size={15} color="#475569" />
            <Text style={styles.meta}>Amount: ₹{entry.amount.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <CreditCard size={15} color="#475569" />
            <Text style={styles.meta}>{entry.paymentMethod}</Text>
          </View>

          <Text style={styles.date}>{entry.paymentDate}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f8f6' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 30, fontWeight: '800', color: '#0f172a' },
  subtitle: { color: '#475569', marginTop: 6, marginBottom: 18 },
  card: { backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  id: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  status: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontWeight: '700', fontSize: 10 },
  paid: { backgroundColor: '#dcfce7', color: '#166534' },
  refunded: { backgroundColor: '#fef3c7', color: '#92400e' },
  pending: { backgroundColor: '#ccfbf1', color: '#0f766e' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  meta: { marginLeft: 8, color: '#475569' },
  date: { marginTop: 4, color: '#64748b', fontWeight: '600' },
});
