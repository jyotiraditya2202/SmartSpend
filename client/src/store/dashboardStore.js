import { create } from 'zustand';
import * as spendUtils from '../api/spendUtils';

const getToken = () => localStorage.getItem('token');

export const useDashboardStore = create((set, get) => ({
  budget: null,
  spendData: null,
  monthRemaining: null,

  // Fetch budget from API
  fetchBudget: async () => {
    const token = getToken();
    if (!token) return;
    const budget = await spendUtils.fetchBudget(token);
    set({ budget });
  },

  // Fetch all spend data
  fetchSpendData: async () => {
    const token = getToken();
    if (!token) return;
    const now = new Date();

    // compute date ranges
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() + diff);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    startOfLastWeek.setHours(0, 0, 0, 0);
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const startOfThisMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const startOfLastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
    const endOfLastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0));

    // parallel requests
    const [
      thisWeekSpend,
      lastWeekSpend,
      thisMonthSpend,
      lastMonthSpend
    ] = await Promise.all([
      spendUtils.fetchSpend(token, startOfThisWeek, now),
      spendUtils.fetchSpend(token, startOfLastWeek, endOfLastWeek),
      spendUtils.fetchSpend(token, startOfThisMonth, now),
      spendUtils.fetchSpend(token, startOfLastMonth, endOfLastMonth),
    ]);

    set({
      spendData: { thisWeekSpend, lastWeekSpend, thisMonthSpend, lastMonthSpend }
    });
  },

  // Compute remaining budget
  computeMonthRemaining: () => {
    const { budget, spendData } = get();
    if (budget == null || !spendData) {
      set({ monthRemaining: null });
      return;
    }
    set({ monthRemaining: budget - spendData.thisMonthSpend });
  },

  computeBudgetPercentage: () => {
    const { budget, spendData } = get();
    if (budget == null || !spendData) {
      set({ budgetPercentage: 0 });
      return;
    }

    set({ 
    budgetPercentage: (spendData.thisMonthSpend * 100) / budget
    });
  },

  computeComparePercWithLastMonth: () => {
  const { spendData, budget } = get();

  if (budget == null || !spendData) {
    set({
      comparePercentage: 0,
      comparePercentageString: '+0%'
    });
    return;
  }

  const thisMonthSaving = budget - spendData.thisMonthSpend;
  const lastMonthSaving = budget - spendData.lastMonthSpend;

  const diff = thisMonthSaving - lastMonthSaving;

  const percentChange = lastMonthSaving === 0
    ? 0
    : (diff / lastMonthSaving) * 100;

  const rounded = Math.round(percentChange * 100) / 100;

  const signedString = `${rounded > 0 ? '+' : ''}${rounded.toFixed(2)}%`;

  set({
    comparePercentage: rounded,
    comparePercentageString: signedString
  });
  }
,
  computeEfficiencyScore: () => {
    const { budget, spendData } = get();

    if (budget == null || !spendData) {
      set({ efficiencyScore: 0, efficiencyBadge: 'Poor' });
      return;
    }

    const saving = budget - spendData.thisMonthSpend;
    const score = Math.max(0, Math.min(100, (saving / budget) * 100)); // clamp to [0, 100]

    let badge = 'Poor';
    if (score >= 80) badge = 'Excellent';
    else if (score >= 60) badge = 'Great';
    else if (score >= 40) badge = 'Good';
    else if (score >= 20) badge = 'Average';

    set({
      efficiencyScore: Math.round(score),
      efficiencyBadge: badge
    });
  },

  // One-shot: load everything
  initialize: async () => {
    await get().fetchBudget();
    await get().fetchSpendData();
    get().computeMonthRemaining();
    get().computeBudgetPercentage();
    get().computeComparePercWithLastMonth();
    get().computeEfficiencyScore();
  }
}));
