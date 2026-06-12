import { describe, it, expect } from 'vitest';
import { filterTransactionsByMonth, calculateFinancialStats, calculateInstallmentDates } from './financial';
import { Transaction } from '../types';

describe('Financial Utilities Test Suite', () => {
  describe('filterTransactionsByMonth', () => {
    it('should include normal transactions for the target month & year', () => {
      const mockTransactions: Transaction[] = [
        { id: '1', title: 'Aluguel', amount: 1500, category: 'Moradia', date: '10/06/2026', spenderId: 'A', type: 'expense', isPaid: true },
        { id: '2', title: 'Mercado', amount: 300, category: 'Alimentação', date: '15/07/2026', spenderId: 'B', type: 'expense', isPaid: false }
      ];
      
      const juneDate = new Date(2026, 5, 15); // June 2026 (0-indexed month)
      const filtered = filterTransactionsByMonth(mockTransactions, juneDate);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Aluguel');
    });

    it('should include fixed transactions when they start in a previous or current month', () => {
      const mockTransactions: Transaction[] = [
        { id: '1', title: 'Gym Membership', amount: 120, category: 'Saúde', date: '01/01/2026', spenderId: 'A', type: 'expense', isPaid: false, isFixed: true },
        { id: '2', title: 'Future Expense', amount: 50, category: 'Outros', date: '01/08/2026', spenderId: 'B', type: 'expense', isPaid: false, isFixed: true }
      ];
      
      const juneDate = new Date(2026, 5, 15); // June 2026
      const filtered = filterTransactionsByMonth(mockTransactions, juneDate);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Gym Membership');
    });
  });

  describe('calculateFinancialStats', () => {
    it('should calculate correct totals for income, payments, pending bills, and free balance', () => {
      const mockFiltered: Transaction[] = [
        { id: '1', title: 'Salário Extra', amount: 500, category: 'Salário', date: '05/06/2026', spenderId: 'A', type: 'revenue', isPaid: true },
        { id: '2', title: 'Luz Pago', amount: 200, category: 'Moradia', date: '10/06/2026', spenderId: 'B', type: 'expense', isPaid: true },
        { id: '3', title: 'Internet Pendente', amount: 100, category: 'Assinaturas', date: '15/06/2026', spenderId: 'A', type: 'expense', isPaid: false },
        { id: '4', title: 'Fixo Pago', amount: 50, category: 'Presentes', date: '01/01/2026', spenderId: 'B', type: 'expense', isPaid: false, isFixed: true, paidMonths: ['2026-6'] }
      ];

      const baseIncome = 4000;
      const currentMonthKey = '2026-6';
      
      const stats = calculateFinancialStats(mockFiltered, baseIncome, currentMonthKey);
      
      // Effective Income = base (4000) + revenue item (500) = 4500
      expect(stats.income).toBe(4500);
      // Paid Expenses = Luz Pago (200) + Fixo Pago because month '2026-6' is included (50) = 250
      expect(stats.paid).toBe(250);
      // Pending Expenses = Internet Pendente (100) = 100
      expect(stats.pending).toBe(100);
      // Free Balance = 4500 - 250 - 100 = 4150
      expect(stats.balance).toBe(4150);
    });
  });

  describe('calculateInstallmentDates', () => {
    it('should generate the correct sequential dates and wrap years correctly', () => {
      const installments = calculateInstallmentDates('25/11/2026', 3);
      
      expect(installments).toHaveLength(3);
      expect(installments[0]).toBe('25/11/2026');
      expect(installments[1]).toBe('25/12/2026');
      expect(installments[2]).toBe('25/01/2027'); // Year wrapping!
    });
    
    it('should pad single digits with leading zeroes correctly', () => {
      const installments = calculateInstallmentDates('05/02/2026', 2);
      
      expect(installments[0]).toBe('05/02/2026');
      expect(installments[1]).toBe('05/03/2026');
    });
  });
});
