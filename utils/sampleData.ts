// Clean Slate for Centria — No more mock data

import { Expense, Subscription, VaultDocument, Reminder, UserProfile } from '../context/AppContext';

export const sampleProfile: UserProfile = {
  name: 'User',
  currency: 'PHP',
  monthlyIncome: 0,
  createdAt: new Date().toISOString(),
};

export const sampleExpenses: Expense[] = [];
export const sampleSubscriptions: Subscription[] = [];
export const sampleDocuments: VaultDocument[] = [];
export const sampleReminders: Reminder[] = [];
