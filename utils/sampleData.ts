// Realistic sample data for demo — Philippine Peso context

import { Expense, Subscription, VaultDocument, Reminder, UserProfile } from '../context/AppContext';

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

function dateStr(day: number, monthOffset = 0): string {
  return new Date(year, month + monthOffset, day).toISOString();
}

export const sampleProfile: UserProfile = {
  name: 'User',
  currency: 'PHP',
  monthlyIncome: 45000,
  createdAt: new Date(year, month - 2, 1).toISOString(),
};

export const sampleExpenses: Expense[] = [
  {
    id: 'exp1',
    amount: 1850,
    category: 'food',
    note: 'Grocery run',
    date: dateStr(now.getDate()),
  },
  {
    id: 'exp2',
    amount: 980,
    category: 'transport',
    note: 'Gas fill-up',
    date: dateStr(now.getDate()),
  },
  {
    id: 'exp3',
    amount: 650,
    category: 'food',
    note: 'Dinner with friends',
    date: dateStr(now.getDate() - 1),
  },
  {
    id: 'exp4',
    amount: 350,
    category: 'health',
    note: 'Pharmacy',
    date: dateStr(now.getDate() - 1),
  },
  {
    id: 'exp5',
    amount: 2500,
    category: 'shopping',
    note: 'New headphones',
    date: dateStr(now.getDate() - 3),
  },
  {
    id: 'exp6',
    amount: 4200,
    category: 'bills',
    note: 'Electric bill',
    date: dateStr(now.getDate() - 5),
  },
  {
    id: 'exp7',
    amount: 1200,
    category: 'entertainment',
    note: 'Concert tickets',
    date: dateStr(now.getDate() - 7),
  },
  {
    id: 'exp8',
    amount: 15000,
    category: 'bills',
    note: 'Rent',
    date: dateStr(3),
  },
];

export const sampleSubscriptions: Subscription[] = [
  {
    id: 'sub1',
    name: 'Netflix',
    price: 549,
    cycle: 'monthly',
    nextBillingDate: dateStr(now.getDate() + 3),
    icon: '🎬',
    active: true,
  },
  {
    id: 'sub2',
    name: 'Spotify',
    price: 194,
    cycle: 'monthly',
    nextBillingDate: dateStr(now.getDate() + 5),
    icon: '🎵',
    active: true,
  },
  {
    id: 'sub3',
    name: 'Gym',
    price: 2500,
    cycle: 'monthly',
    nextBillingDate: dateStr(now.getDate() + 10),
    icon: '🏋️',
    active: true,
  },
  {
    id: 'sub4',
    name: 'iCloud',
    price: 149,
    cycle: 'monthly',
    nextBillingDate: dateStr(now.getDate() + 15),
    icon: '☁️',
    active: true,
  },
];

export const sampleDocuments: VaultDocument[] = [
  {
    id: 'doc1',
    name: 'Driver\'s License',
    category: 'id',
    fileUri: '',
    fileType: 'image/jpeg',
    expiryDate: new Date(year + 1, 11, 15).toISOString(),
  },
  {
    id: 'doc2',
    name: 'Lease Agreement',
    category: 'contract',
    fileUri: '',
    fileType: 'application/pdf',
    expiryDate: new Date(year + 1, 5, 30).toISOString(),
  },
  {
    id: 'doc3',
    name: 'Insurance Receipt',
    category: 'receipt',
    fileUri: '',
    fileType: 'image/png',
    expiryDate: null,
  },
];

export const sampleReminders: Reminder[] = [
  {
    id: 'rem1',
    title: 'Netflix',
    date: dateStr(now.getDate() + 3),
    type: 'payment',
    completed: false,
    linkedSubscriptionId: 'sub1',
  },
  {
    id: 'rem2',
    title: 'Spotify',
    date: dateStr(now.getDate() + 5),
    type: 'payment',
    completed: false,
    linkedSubscriptionId: 'sub2',
  },
  {
    id: 'rem3',
    title: 'Rent due',
    date: dateStr(now.getDate() + 10),
    type: 'bill',
    completed: false,
    linkedSubscriptionId: null,
  },
  {
    id: 'rem4',
    title: 'Dentist appointment',
    date: dateStr(now.getDate() + 15),
    type: 'custom',
    completed: false,
    linkedSubscriptionId: null,
  },
  {
    id: 'rem5',
    title: 'Electric bill',
    date: dateStr(now.getDate() - 2),
    type: 'bill',
    completed: true,
    linkedSubscriptionId: null,
  },
];
