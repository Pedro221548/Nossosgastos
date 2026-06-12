import { Transaction } from '../types';

/**
 * Filters transactions that are relevant to a given month and year.
 * Includes transactions for that month, plus recurring/fixed transactions from previous months.
 */
export function filterTransactionsByMonth(transactions: Transaction[], date: Date): Transaction[] {
  const targetMonth = date.getMonth();
  const targetYear = date.getFullYear();

  return transactions.filter(t => {
    const [day, m, year] = t.date.split('/').map(Number);
    
    let refMonth = m - 1;
    let refYear = year;
    if (t.referenceMonth) {
       const [ry, rm] = t.referenceMonth.split('-');
       refYear = Number(ry);
       refMonth = Number(rm) - 1;
    }
    
    const isCurrentMonth = refMonth === targetMonth && refYear === targetYear;
    const isFixedAndRelevant = t.isFixed && (refYear < targetYear || (refYear === targetYear && refMonth <= targetMonth));
    
    return isCurrentMonth || isFixedAndRelevant;
  });
}

/**
 * Calculates current income, paid, pending, and balance stats.
 */
export function calculateFinancialStats(
  filteredTransactions: Transaction[],
  baseIncome: number,
  currentMonthKey: string
) {
  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const revenues = filteredTransactions.filter(t => t.type === 'revenue');
  
  const totalExtraRevenue = revenues.reduce((acc, t) => acc + t.amount, 0);
  const effectiveIncome = baseIncome + totalExtraRevenue;
  
  const paidExpenses = expenses
    .filter(t => t.isFixed ? t.paidMonths?.includes(currentMonthKey) : t.isPaid)
    .reduce((acc, t) => acc + t.amount, 0);
    
  const pendingExpenses = expenses
    .filter(t => t.isFixed ? !t.paidMonths?.includes(currentMonthKey) : !t.isPaid)
    .reduce((acc, t) => acc + t.amount, 0);

  return {
    income: effectiveIncome,
    paid: paidExpenses,
    pending: pendingExpenses,
    balance: effectiveIncome - paidExpenses - pendingExpenses
  };
}

/**
 * Generates dates for installments starting from a specific date.
 * Returns dates in format "DD/MM/YYYY" formatted correctly for the UI.
 */
export function calculateInstallmentDates(startDateStr: string, totalInstallments: number): string[] {
  if (!startDateStr.includes('/')) return [];
  const [d, m, y] = startDateStr.split('/').map(Number);
  
  const dates: string[] = [];
  const startDate = new Date(y, m - 1, d);
  
  for (let i = 0; i < totalInstallments; i++) {
    const nextDate = new Date(startDate);
    nextDate.setMonth(startDate.getMonth() + i);
    // Format to DD/MM/YYYY
    const formattedDay = nextDate.getDate().toString().padStart(2, '0');
    const formattedMonth = (nextDate.getMonth() + 1).toString().padStart(2, '0');
    const formattedYear = nextDate.getFullYear();
    dates.push(`${formattedDay}/${formattedMonth}/${formattedYear}`);
  }
  
  return dates;
}
