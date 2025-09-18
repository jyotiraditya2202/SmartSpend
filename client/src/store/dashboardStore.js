import { create } from 'zustand';
import * as spendUtils from '../api/spendUtils';

const getToken = () => localStorage.getItem('token');

const today = new Date();


export const useDashboardStore = create((set, get) => ({
  budget: null,
  spendData: null,
  monthRemaining: null,
  month: today.getMonth(),
  year: today.getFullYear(),

  setMonth: (month) => {
    set({ month });
    console.log("seted month", month);
    get().fetchSpendData();
    get().fetchBudget();  
  },

  setYear: (year) => {
    set({ year });
    console.log("seted year", year);
    get().fetchSpendData();
    get().fetchBudget();  
  },

  // Fetch budget from API
  fetchBudget: async () => {
  const { month, year } = get(); // month = 0-based (0 = Jan, 8 = Sep)

  const token = getToken();
  if (!token) return;

  // Start of this month
  const startOfThisMonth = new Date(year, month, 1, 0, 0, 0, 0);

  // End of this month (last day, 23:59:59.999)
  const endOfThisMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const budget = await spendUtils.fetchIncome(token, startOfThisMonth, endOfThisMonth);

  console.log("income:", budget);
  set({ budget });

  get().computeMonthRemaining();

  },

  // Fetch all spend data
  fetchSpendData: async () => {
    const { month, year } = get();

    const token = getToken();
    if (!token) return;    

    const monthIndex = new Date(`${month} 1 , ${year}`).getMonth() + 1;

    const nowUtil = new Date(year, monthIndex, 1);
    nowUtil.setHours(0, 0, 0, 0);

    const now = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

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

    const startOfThisMonth = new Date(Date.UTC(nowUtil.getFullYear(), nowUtil.getMonth(), 1));
    const endOfThisMonth = new Date(Date.UTC(nowUtil.getFullYear(), nowUtil.getMonth() + 1, 0, 23, 59, 59, 999));
    const startOfLastMonth = new Date(Date.UTC(nowUtil.getFullYear(), nowUtil.getMonth() - 1, 1));
    const endOfLastMonth = new Date(Date.UTC(nowUtil.getFullYear(), nowUtil.getMonth(), 0));

    // parallel requests
    const [
      thisWeekSpend,
      lastWeekSpend,
      thisMonthSpend,
      lastMonthSpend,
      upcomingSpend
    ] = (await Promise.all([
      spendUtils.fetchSpend(token, startOfThisWeek, now),
      spendUtils.fetchSpend(token, startOfLastWeek, endOfLastWeek),
      spendUtils.fetchSpend(token, startOfThisMonth, endOfThisMonth),
      spendUtils.fetchSpend(token, startOfLastMonth, endOfLastMonth),
      spendUtils.fetchSpend(token, tomorrow, endOfThisMonth)
    ])).map(v => v ?? 0);

    console.log("start of this month:", startOfThisMonth);
    console.log("end of this month:", endOfThisMonth);
    console.log("this month spend:", thisMonthSpend);

    set({
      spendData: { thisWeekSpend, lastWeekSpend, thisMonthSpend, lastMonthSpend, upcomingSpend }
    });

    get().computeMonthRemaining();
    },

  // Compute remaining budget
  computeMonthRemaining: () => {
    const { budget, spendData } = get();
    if (budget == null || !spendData) {
      set({ monthRemaining: null });
      return;
    }
    // if(!spendData){
    //   set({ monthRemaining: budget })
    // }
    set({ monthRemaining: budget - spendData.thisMonthSpend });
  },

  computeBudgetPercentage: () => {
    const { budget, spendData } = get();
    if (budget == null || !spendData) {
      set({ budgetPercentage: 0 });
      return;
    }

    const percentage = ((spendData.thisMonthSpend * 100) / budget).toFixed(2);
    set({ budgetPercentage: parseFloat(percentage) });
    
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

  computeDailySpend: () => {
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
    const today = new Date();
    get().setMonth(today.getMonth()); 
    get().setYear(today.getFullYear());
    await get().fetchBudget();
    await get().fetchSpendData();
    get().computeMonthRemaining();
    get().computeBudgetPercentage();
    get().computeComparePercWithLastMonth();
    get().computeEfficiencyScore(); 
  }
}));
