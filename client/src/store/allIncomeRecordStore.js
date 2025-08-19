import { create } from 'zustand';
import * as incomeUtils from '../api/incomeUtils';

const token = () => localStorage.getItem('token');

export const allIncomeRecordStore = create((set, get) => ({
    allIncomeRecord: null,

    fetchAllIncomeRecord: async() => {
        try{

            const allIncomeRecord = await incomeUtils.getAllIncome(token());
            console.log("Successfulll store !!")
            set({ allIncomeRecord });

            if(!allIncomeRecord){
                console.log("spend resords are empty  !!");
            }
        
        }
        catch(err){
            console.log("Error fetching the data !!", err);
        }
    }

})
)

