// utils imports 
import React from "react";
import { useState, useEffect } from 'react';
import axios from "axios";
import { FiX,FiTrash2 } from "react-icons/fi";
import './allRecords.css';

// store imports 
import { allSpendRecordStore } from "../../store/allSpendReordStore";
import { allIncomeRecordStore } from "../../store/allIncomeRecordStore";
import { useDashboardStore } from '../../store/dashboardStore';

// api imports
import * as monthlySpend from '../../api/monthlySpend';
import * as weeklySpend from '../../api/weeklySpend'

// base url
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 

function AllRecordsModal ({isOpenAllSpendRecord, setIsOpenAllSpendRecord}) {

// --- states ---
const [active, setActive] = useState("spent");

// --- initiallizing store vars  ---

const { allSpendRecord, fetchAllSpendRecord } = allSpendRecordStore();
const { allIncomeRecord, fetchAllIncomeRecord } = allIncomeRecordStore();

useEffect(() => {
  if (isOpenAllSpendRecord) {

    if(active == "spent"){
        fetchAllSpendRecord();
        console.log("spent data fetched !!");
        console.log(allSpendRecord);
    }
    if(active == "income"){
        fetchAllIncomeRecord();
        console.log("income data fetched !!");
        console.log(allIncomeRecord);
    }
}
}, [active]); 



const {
        budget,
        spendData,
        monthRemaining,
        budgetPercentage,
        comparePercentage,
        initialize
    } = useDashboardStore();

// --- handle closing function --- 
const hadleOnClose = () =>
{
    setIsOpenAllSpendRecord(false);
};

// --  handle delete spend ---
const handleDeleteAllSpend = async (id) => {
    try {

    const token = localStorage.getItem('token');

    const deleteRes = await axios.delete(
    `${BASE_URL}/api/spend/delete/${id}`,
    {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    }
    );

    initialize();

    await fetchAllSpendRecord();

    try {
        await monthlySpend.syncMonthlyData(token);
    } catch (err) {
        alert("Failed sync monthly data !!");
    }

    try {
        await weeklySpend.syncWeeklyData(token);
    } catch (err) {
        alert("Failed sync weekly data !!");
    }

    console.log("synced data succefully !!");

    } catch (err) {
    console.error('Error deleting spend:', err);
    }
};

const handleDeleteAllIncome = async (id) => {
    try {

    const token = localStorage.getItem('token');

    const deleteRes = await axios.delete(
    `${BASE_URL}/api/income/delete/${id}`,
    {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    }
    );

    try {
        await monthlySpend.syncMonthlyData(token);
    } catch (err) {
        alert("Failed sync monthly data !!");
    }

    try {
        await weeklySpend.syncWeeklyData(token);
    } catch (err) {
        alert("Failed sync weekly data !!");
    }

    initialize();

    await fetchAllIncomeRecord();
    
    console.log("synced data succefully !!");

    } catch (err) {
    console.error('Error deleting spend:', err);
    }
};

if (!isOpenAllSpendRecord) return null;

return (
    <div className="records-modal-backdrop">
    <div className="records-modal-content">
        <button className="modal-close-btn" onClick={hadleOnClose}>
        <FiX />
        </button>
        <h2 className="records-modal-title">All Spend Records</h2>
        <div className="navigation-menu">
            
            <p 
                id="spent"
                className={active === "spent" ? "active" : ""}
                onClick={() => setActive("spent")}
            >
            
            spent
            
            </p>
            
            <p 
                id="income"
                className={active === "income" ? "active" : ""}
                onClick={() => setActive("income")}
            >
            
            income
            
            </p>
        </div>
        
        <div className="records-list">
        {
        active === 'spent' && (
        allSpendRecord && allSpendRecord.length > 0 ? (
            allSpendRecord.map((amount) => (
            <div key={amount._id} className="records-list-item">
                <div className="records-item-details">
                <div className="records-item-title-cat">
                    <h4>{amount.title}</h4>
                    <p className="records-item-category">{amount.category}</p>
                </div>

                <span className="records-item-date">
                    {
                    new Date(amount.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                    })}
                </span>

                </div>
                <div className="records-item-actions">
                <span className="records-item-amount" style={{color:"#ff4444"}}>${Number(amount.amount).toFixed(2)}</span>
                <button key={amount._id} className="delete-btn" onClick={() => handleDeleteAllSpend(amount._id)}>
                    <FiTrash2 style={{ height: '20px', width: '20px' }} />
                </button>
                </div>
            </div>
            ))
        ) : (
            <p className="no-records-message">No spend records found.</p>
        ))}

        {active === 'income' && (

        allIncomeRecord && allIncomeRecord.length > 0 ? (
            allIncomeRecord.map((amount) => (
            <div key={amount._id} className="records-list-item">
                <div className="records-item-details">
                <div className="records-item-title-cat">
                    <h4>{amount.category}</h4>
                </div>

                <span className="records-item-date">
                    {
                    new Date(amount.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                    })}
                </span>

                </div>
                <div className="records-item-actions">
                <span className="records-item-amount" style={{color:"#00C851"}}>${Number(amount.amount).toFixed(2)}</span>
                <button key={amount._id} className="delete-btn" onClick={() => handleDeleteAllIncome(amount._id)}>
                    <FiTrash2 style={{ height: '20px', width: '20px' }} />
                </button>
                </div>
            </div>
            ))
        ) : (
            <p className="no-records-message">No Income records found.</p>
        ))}

        </div>

    </div>
    </div>
);
};

export default AllRecordsModal;