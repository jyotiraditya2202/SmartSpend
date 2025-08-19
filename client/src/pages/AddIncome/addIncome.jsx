import React from "react";
import './addIncome.css'

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

import { useDashboardStore } from "../../store/dashboardStore";

import * as monthlySpend from '../../api/monthlySpend';
import * as weeklySpend from '../../api/weeklySpend';
import * as incomeUtils from '../../api/incomeUtils';


function AddIncomeModal ({ isModalOpen, setIsModelOpen }){

    const categories = [
    "Salary",
    "Freelance ",
    "Business Revenue",
    "Investments ",
    "Rental Income",
    "Gifts / Grants",
    "Refunds / Reimbursements",
    "Other Income"
    ];

    const {
        budget,
        spendData,
        monthRemaining,
        budgetPercentage,
        comparePercentage,
        initialize
    } = useDashboardStore();
    
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const handleOnClose = () => {
        setIsModelOpen(false);
    }

    const handleSpentSubmit = async(e) => {
        
        e.preventDefault();
        setIsSubmitting(true);

        const data = { category, amount };

        try {
            
            const response = await incomeUtils.insertIncome(data);
            console.log('Record inserted successfully:', response);
            
            try{
                await monthlySpend.syncMonthlyData();
            }
            catch(err){
                alert('Failed sync monthly data !!');
            }
            try{
                await weeklySpend.syncWeeklyData();
            }
            catch(err){
                alert('Failed sync weekly data !!');
            } 
            console.log("synced data succefully !!");
            
            initialize();
            
            setIsSubmitting(false);
            setIsModelOpen(false);
    
        } catch (error) {
            console.error('Error inserting record:', error);
            alert('Failed to insert spend record. Please try again.');
        }

    };

    return (
    <div className="modal-backdrop">
        <div className="modal-content">
        <button className="modal-close-btn" onClick={handleOnClose}>
            <FiX />
        </button>
        <h2 className="modal-title">Add New Income</h2>
        <form className="add-spend-form" onSubmit={handleSpentSubmit}>
            {error && <p className="form-error">{error}</p>}
           
            <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
                ))}
            </select>
            </div>

            <div className="form-group">
            <label htmlFor="spend">Amount ($)</label>
            <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value) }}
                placeholder="e.g., 5.50"
                step="0.01"
                required
            />
            </div>
            <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Income'}
            </button>
        </form>
        </div>
    </div>
    );
};


export default AddIncomeModal;