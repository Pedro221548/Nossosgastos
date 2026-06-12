
import { User, Transaction, Goal } from './types';

export const USERS: { A: User; B: User } = {
  A: {
    id: 'user_a',
    name: 'Parceiro A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ParceiroA',
    income: 0,
    currentBalance: 0
  },
  B: {
    id: 'user_b',
    name: 'Parceiro B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ParceiroB',
    income: 0,
    currentBalance: 0
  },
};

export const AVATAR_OPTIONS = [
  'Alex', 'Sam', 'Jordan', 'Casey', 'Charlie', 'Taylor', 'Riley', 'Quinn', 'Avery', 'Skyler'
].map(seed => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);

// Renda Total da Família
export const TOTAL_FAMILY_INCOME = USERS.A.income + USERS.B.income;

export const CATEGORIES = [
  { id: 'Mercado', emoji: '🛒' },
  { id: 'Alimentação', emoji: '🍔' },
  { id: 'Lazer', emoji: '🎉' },
  { id: 'Transporte', emoji: '⛽' },
  { id: 'Casa', emoji: '🏠' },
  { id: 'Saúde', emoji: '💊' },
  { id: 'Educação', emoji: '🎓' },
  { id: 'Assinaturas', emoji: '📺' },
  { id: 'Vestuário', emoji: '👕' },
  { id: 'Viagem', emoji: '✈️' },
  { id: 'Pets', emoji: '🐶' },
  { id: 'Investimentos', emoji: '📈' },
  { id: 'Presente', emoji: '🎁' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  // Fix: Added missing 'type' property to each transaction to comply with the Transaction interface
  { id: '1', title: 'Aluguel', amount: 2200.00, category: 'Casa', date: '01/12/2025', spenderId: 'user_a', emoji: '🏠', type: 'expense', isFixed: true, isPaid: true },
  { id: '2', title: 'Internet Fibra', amount: 120.00, category: 'Casa', date: '05/12/2025', spenderId: 'user_b', emoji: '🌐', type: 'expense', isFixed: true },
  { id: '3', title: 'Sofá Novo', amount: 450.00, category: 'Casa', date: '10/12/2025', spenderId: 'user_a', emoji: '🛋️', type: 'expense', installments: { current: 3, total: 10 } },
  { id: '4', title: 'Academia', amount: 150.00, category: 'Saúde', date: '12/12/2025', spenderId: 'user_b', emoji: '💪', type: 'expense', isFixed: true },
  { id: '5', title: 'Mercado Semanal', amount: 450.20, category: 'Mercado', date: '15/12/2025', spenderId: 'user_a', emoji: '🛒', type: 'expense' },
  { id: '6', title: 'iPhone Alex', amount: 800.00, category: 'Lazer', date: '18/12/2025', spenderId: 'user_a', emoji: '📱', type: 'expense', installments: { current: 12, total: 12 } },
];

export const MOCK_GOALS: Goal[] = [
  { id: 'g1', title: 'Férias no Nordeste', targetAmount: 8000, currentAmount: 3200, imageUrl: 'https://picsum.photos/id/40/400/200', color: 'bg-orange-500' },
  { id: 'g2', title: 'Reforma da Sala', targetAmount: 5000, currentAmount: 1500, imageUrl: 'https://picsum.photos/id/111/400/200', color: 'bg-blue-500' },
];
