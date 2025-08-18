import { create } from 'zustand';
import * as spendUtils from '../api/spendUtils';

const token = () => localStorage.getItem('token');

export const allSpendRecordStore = create((set, get) => ({
    allSpendRecord: null,

    fetchAllSpendRecord: async() => {
        try{

            const allSpendRecord = await spendUtils.getAllSpends(token());
            console.log("Successfulll store !!")
            set({ allSpendRecord });

            if(!allSpendRecord){
                console.log("spend resords are empty  !!");
            }
        
        }
        catch(err){
            console.log("Error fetching the data!!", err);
        }
    }

})
)

