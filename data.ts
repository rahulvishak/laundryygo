export type MachineStatus = 'Available' | 'Booked' | 'Maintenance';
export type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export type Profile = {
  fullName: string;
  studentId: string;
  email: string;
  hostelName: string;
  roomNumber: string;
  phoneNumber: string;
  photoUrl: string;
};

export type Machine = {
  id: number;
  name: string;
  status: MachineStatus;
  nextSlot: string;
  bay: string;
};

export type Booking = {
  id: string;
  userId: string;
  machineId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  amount: number;
  createdAt: string;
};

export type Transaction = {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: PaymentStatus;
};

export const timeSlots = [
  { label: '6:00 AM – 7:00 AM', start: '06:00', end: '07:00' },
  { label: '7:00 AM – 8:00 AM', start: '07:00', end: '08:00' },
  { label: '8:00 AM – 9:00 AM', start: '08:00', end: '09:00' },
  { label: '9:00 AM – 10:00 AM', start: '09:00', end: '10:00' },
  { label: '10:00 AM – 11:00 AM', start: '10:00', end: '11:00' },
  { label: '11:00 AM – 12:00 PM', start: '11:00', end: '12:00' },
  { label: '12:00 PM – 1:00 PM', start: '12:00', end: '13:00' },
  { label: '1:00 PM – 2:00 PM', start: '13:00', end: '14:00' },
  { label: '2:00 PM – 3:00 PM', start: '14:00', end: '15:00' },
  { label: '3:00 PM – 4:00 PM', start: '15:00', end: '16:00' },
  { label: '4:00 PM – 5:00 PM', start: '16:00', end: '17:00' },
  { label: '5:00 PM – 6:00 PM', start: '17:00', end: '18:00' },
];

export const defaultProfile: Profile = {
  fullName: 'Laundry Go Student',
  studentId: 'STU-2048',
  email: 'aisha.rahman@hostel.edu',
  hostelName: 'North Block Hostel',
  roomNumber: '',
  phoneNumber: '+91 98989 12345',
  photoUrl: '',
};

export const defaultMachines: Machine[] = [
  { id: 1, name: 'Machine 01', status: 'Available', nextSlot: '6:00 AM – 7:00 AM', bay: 'Bay A' },
  { id: 2, name: 'Machine 02', status: 'Booked', nextSlot: '7:00 AM – 8:00 AM', bay: 'Bay B' },
  { id: 3, name: 'Machine 03', status: 'Maintenance', nextSlot: 'Under repair', bay: 'Bay C' },
  { id: 4, name: 'Machine 04', status: 'Available', nextSlot: '10:00 AM – 11:00 AM', bay: 'Bay D' },
  { id: 5, name: 'Machine 05', status: 'Booked', nextSlot: '8:00 AM – 9:00 AM', bay: 'Bay E' },
  { id: 6, name: 'Machine 06', status: 'Available', nextSlot: '11:00 AM – 12:00 PM', bay: 'Bay F' },
];

export const defaultBookings: Booking[] = [
  {
    id: 'LQ-2048',
    userId: 'student-1',
    machineId: 2,
    bookingDate: getDateOffset(0),
    startTime: '07:00',
    endTime: '08:00',
    status: 'Upcoming',
    amount: 149,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'LQ-2049',
    userId: 'student-1',
    machineId: 5,
    bookingDate: getDateOffset(1),
    startTime: '08:00',
    endTime: '09:00',
    status: 'Upcoming',
    amount: 149,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'LQ-2050',
    userId: 'student-1',
    machineId: 1,
    bookingDate: getDateOffset(-1),
    startTime: '09:00',
    endTime: '10:00',
    status: 'Completed',
    amount: 149,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'LQ-2051',
    userId: 'student-1',
    machineId: 4,
    bookingDate: getDateOffset(-2),
    startTime: '10:00',
    endTime: '11:00',
    status: 'Cancelled',
    amount: 0,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const defaultTransactions: Transaction[] = [
  {
    id: 'TXN-1001',
    bookingId: 'LQ-2048',
    amount: 149,
    paymentDate: getDateOffset(0),
    paymentMethod: 'UPI',
    status: 'Paid',
  },
  {
    id: 'TXN-1002',
    bookingId: 'LQ-2050',
    amount: 149,
    paymentDate: getDateOffset(-1),
    paymentMethod: 'Wallet',
    status: 'Paid',
  },
  {
    id: 'TXN-1003',
    bookingId: 'LQ-2051',
    amount: 0,
    paymentDate: getDateOffset(-2),
    paymentMethod: 'Refund',
    status: 'Refunded',
  },
];

export const hostelSettings = {
  operatingHours: '6:00 AM – 6:00 PM',
  bookingDuration: '1 hour',
  pricing: '₹149 per slot',
};

export function getDateOffset(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${convertToDisplayTime(start)} – ${convertToDisplayTime(end)}`;
}

export function convertToDisplayTime(time: string): string {
  const [hourString, minuteString] = time.split(':');
  const hour = Number(hourString);
  const minute = Number(minuteString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
}

export function getMachineById(machines: Machine[], id: number): Machine | undefined {
  return machines.find((machine) => machine.id === id);
}

export function isPastSlot(date: string, startTime: string): boolean {
  const target = new Date(`${date}T${startTime}:00`).getTime();
  return target <= Date.now();
}

export function hasTimeConflict(
  date: string,
  startTime: string,
  endTime: string,
  machineId: number,
  bookings: Booking[],
): boolean {
  const startMs = new Date(`${date}T${startTime}:00`).getTime();
  const endMs = new Date(`${date}T${endTime}:00`).getTime();

  return bookings.some((booking) => {
    if (booking.machineId !== machineId || booking.status === 'Cancelled' || booking.bookingDate !== date) {
      return false;
    }

    const existingStart = new Date(`${booking.bookingDate}T${booking.startTime}:00`).getTime();
    const existingEnd = new Date(`${booking.bookingDate}T${booking.endTime}:00`).getTime();

    return startMs < existingEnd && existingStart < endMs;
  });
}
