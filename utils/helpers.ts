// General helpers — ID generation, financial calculations

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function getMonthlyEquivalent(price: number, cycle: 'weekly' | 'monthly' | 'yearly'): number {
  switch (cycle) {
    case 'weekly': return price * 4.33;
    case 'monthly': return price;
    case 'yearly': return price / 12;
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: '🛒',
    transport: '⛽',
    health: '🏥',
    shopping: '🛍️',
    entertainment: '🎬',
    bills: '📱',
    other: '📦',
    // Document categories
    id: '🪪',
    receipt: '🧾',
    contract: '📄',
    // Reminder types
    bill: '💰',
    payment: '💳',
    custom: '🔔',
  };
  return icons[category] || '📦';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    food: 'Food',
    transport: 'Transport',
    health: 'Health',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    bills: 'Bills',
    other: 'Other',
    id: 'IDs',
    receipt: 'Receipts',
    contract: 'Contracts',
  };
  return labels[category] || 'Other';
}

export function getUrgencyColor(daysUntil: number): string {
  if (daysUntil <= 3) return '#F87171';  // red
  if (daysUntil <= 7) return '#FBBF24';  // yellow
  return '#34D399';  // green
}
