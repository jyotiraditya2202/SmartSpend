import { create } from 'zustand';
import * as spendUtils from '../api/spendUtils';
import * as monthlydata from '../api/monthlySpend';
import * as weeklydata from '../api/weeklySpend';

export const overAllAnalyticsStore = create((set, get) => ({
    monthlydata: [],
    weeklydata: [],

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

    }

})
)

