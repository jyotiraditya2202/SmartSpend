import { create } from 'zustand';
import * as spendUtils from '../api/spendUtils';
import * as monthlydata from '../api/monthlySpend';
import * as weeklydata from '../api/weeklySpend';

export const overAllAnalyticsStore = create((set, get) => ({
    monthlydata: [],
    weeklydata: [],
    yearlySpend: 0,
    yearlyIncome: 0,

    fetchMonthlyData: async() => {
        try{
            const res = await monthlydata.fetchMonthlyData();

            if(!res){
                console.log("Monthly data is empty");
            }

            set({
                monthlydata: res
            });

        }   
        catch(err){
            set({
                monthlydata: null
            });
        }

    },

    fetchWeeklyData: async() => {
        try{
            const res = await weeklydata.fetchWeeklyData();

            if(!res){
                console.log("Weekly data is empty");
            }

            set({
                weeklydata: res
            });

        }   
        catch(err){
            set({
                weeklydata: null
            });
        }

    },

    getCurrentYearSpend: () => {
        const { monthlydata } = get();

        if (!monthlydata || !Array.isArray(monthlydata)) {
            set({ yearlySpend: 0 }); 
            return 0;
        }

        const currentYear = new Date().getFullYear();

        // Filter monthly entries that belong to this year
        const thisYearData = monthlydata.filter(item => {
            const startDate = new Date(item.StartDate);
            return startDate.getFullYear() === currentYear;
        });

        console.log("-----------");
        console.log(thisYearData);

        // Sum up totalSpend for this year
        const total = thisYearData.reduce((sum, item) => {
            return sum + (item.totalSpend || 0);
        }, 0);

        set({ yearlySpend: total }); // ✅ save in state
        return total;
    },

    getCurrentYearIncome: () => {
        const { monthlydata } = get();

        if (!monthlydata || !Array.isArray(monthlydata)) {
            set({ yearlyIncome: 0 }); 
            return 0;
        }

        const currentYear = new Date().getFullYear();

        // Filter monthly entries that belong to this year
        const thisYearData = monthlydata.filter(item => {
            const startDate = new Date(item.StartDate);
            return startDate.getFullYear() === currentYear;
        });

        // Sum up totalSpend for this year
        const total = thisYearData.reduce((sum, item) => {
            return sum + (item.budget || 0);
        }, 0);

        set({ yearlyIncome: total }); // ✅ save in state
        console.log("Yearly income");
        console.log(get().yearlyIncome);
        return total;
    }

})
)

