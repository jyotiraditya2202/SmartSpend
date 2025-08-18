import React from "react";
import './addSpend.css'

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

import { useDashboardStore } from "../../store/dashboardStore";

import * as monthlySpend from '../../api/monthlySpend';
import * as weeklySpend from '../../api/weeklySpend';
import * as spendUtils from '../../api/spendUtils';


function AddSpendModal ({ isModalOpen, setIsModelOpen }){
    const categories = [
    "Groceries",
    "Entertainment",
    "Utilities",
    "Transportation",
    "Dining Out",
    "Shopping",
    "Health",
    "Other"
    ];

    const type = 'spent';

    const {
        budget,
        spendData,
        monthRemaining,
        budgetPercentage,
        comparePercentage,
        initialize
    } = useDashboardStore();
    
    const [title, setTitle] = useState('');
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

        const data = { title, category, amount, type };

        try {
            
            const response = await spendUtils.insertSpend(data);
            console.log('Record inserted successfully:', response);
    
            // Optionally refetch the updated data via initialize()
            initialize();

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
        <h2 className="modal-title">Add New Spend</h2>
        <form className="add-spend-form" onSubmit={handleSpentSubmit}>
            {error && <p className="form-error">{error}</p>}
            <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Coffee with friends"
                required
            />
            </div>
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
            {isSubmitting ? 'Adding...' : 'Add Spend'}
            </button>
        </form>
        </div>
    </div>
    );
};


export default AddSpendModal;