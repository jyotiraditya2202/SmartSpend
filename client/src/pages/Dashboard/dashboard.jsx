import React from 'react';
import './dashboard.css';
import { FiTarget, FiDollarSign, FiBarChart2, FiTrendingUp, FiArrowUp, FiPlus, FiArrowDown, FiTrash2, FiList, FiX, FiMessageSquare } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import * as spendUtils from '../../api/spendUtils'; 
import * as monthlySpend from '../../api/monthlySpend'; 
import * as weeklySpend from '../../api/weeklySpend';
import { useDashboardStore } from '../../store/dashboardStore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigatorButton from '../../components/NavigatorButton/NavigatorButton';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Use Vite style env if applicable


// model
const spendCategories = [
  "Groceries",
  "Entertainment",
  "Utilities",
  "Transportation",
  "Dining Out",
  "Shopping",
  "Health",
  "Other"
];

const incomeCategories = [
  "Salary",
  "Freelance ",
  "Business Revenue",
  "Investments ",
  "Rental Income",
  "Gifts / Grants",
  "Refunds / Reimbursements",
  "Other Income"
];

// Modal component for adding new spend records
const AddSpendModal = ({ onClose, onSubmit, initialType }) => {


  const [title, setTitle] = useState('');
  const [type, setType] = useState(initialType || '');
  
  const categories = type === "income" ? incomeCategories : spendCategories;

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSpentSubmit = (e) => {

    e.preventDefault();
    if (!title || !category || !amount) {
      setError("Please fill out all fields.");
      return;
    }
    console.log("amount:",amount);
    setIsSubmitting(true);
    setError(null);

    console.log('Submitting new spend record:', { title, category, type ,amount: parseFloat(amount) });
    onSubmit({ title, category, type, amount: parseFloat(amount) });
    setIsSubmitting(false);
    onClose(); 

  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
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

const AllRecordsModal = ({ spends, onClose, onDelete }) => {
  return (
    <div className="records-modal-backdrop">
      <div className="records-modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <h2 className="records-modal-title">All Spend Records</h2>
        <div className="records-list">
          {spends.length > 0 ? (
            spends.map((amount) => (
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
                  <span className="records-item-amount">${Number(amount.amount).toFixed(2)}</span>
                  <button key={amount._id} className="delete-btn" onClick={() => onDelete(amount._id)}>
                    <FiTrash2 style={{ height: '20px', width: '20px' }} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-records-message">No spend records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {

    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState('');
    const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
    const {
    budget,
    spendData,
    monthRemaining,
    budgetPercentage,
    comparePercentage,
    initialize
  } = useDashboardStore();
  
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (isChatOpen) {
      navigate('/chat');
    }
  }, [isChatOpen, navigate]);

  const efficiencyScore = useDashboardStore(state => state.efficiencyScore);
  const efficiencyBadge = useDashboardStore(state => state.efficiencyBadge);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAddSpend = () => {
    setIsModalOpen('spent');
  };
  const handleAddIncome = () => {
    setIsModalOpen('income');
  };

  const [recentSpends, setRecentSpends] = useState([]);
  
  const fetchSpends = async () => {
      const data = await spendUtils.getRecentSpends();
      if (data) setRecentSpends(data);
  };

  useEffect(() => {
    fetchSpends();
  }, []);

  const [allSpends, setAllSpends] = useState([]);

  useEffect(() => {
    if (!isRecordsModalOpen) return;

    const fetchAllSpends = async () => {
        const data = await spendUtils.getAllSpends();
        console.log("all spend data");
        console.log(data);
        if (data) setAllSpends(data);
    };

    fetchAllSpends();
  }, [isRecordsModalOpen]);


  const handleModalSubmit = async (newRecord) => {
    try {
        const response = await spendUtils.insertSpend(newRecord);
        console.log('Record inserted successfully:', response);

        // Optionally refetch the updated data via initialize()
        initialize();
        await fetchSpends(); 
        const token = localStorage.getItem('token');
        
        try{
          const res = monthlySpend.syncMonthlyData(token);
        }
        catch(err){
          alert('Failed sync monthly data !!');
        }
        try{
          const res = weeklySpend.syncWeeklyData(token);
        }
        catch(err){
          alert('Failed sync weekly data !!');
        } 
        console.log("synced data succefully !!");

    } catch (error) {
        console.error('Error inserting record:', error);
        alert('Failed to insert spend record. Please try again.');
    }
  };

  const handleDeleteRecentSpend = async (id) => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.delete(
            `${BASE_URL}/api/spend/delete/${id}`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            console.log("Successfully deleted:", res.data);
            await fetchSpends();
            initialize();
            
        } catch (err) {
            console.error('Error deleting spend:', err);
        }
    };

  const handleDeleteAllSpend = async (id) => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.delete(
            `${BASE_URL}/api/spend/delete/${id}`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            console.log("Successfully deleted:", res.data);
            await fetchAllSpends();
            await fetchSpends();
            initialize();
            
        } catch (err) {
            console.error('Error deleting spend:', err);
        }
  };

  if (!spendData) {
    return <p>Loading...</p>;
  }

  return (
    <>
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>SmartSpend Dashboard</h1>
        <p>Your intelligent spending companion</p>
        <div className='bt-postion'>


        {/* view all record */}
        <button className="add-spend-btn" onClick={() => setIsRecordsModalOpen(true)}>
            <FiList style={{ height: '20px', width: '20px', strokeWidth: '3' }} />
            View All Spendings
        </button>

        </div>

      </header>
      {spendData ? (
      <main className="dashboard-grid">
        
        {/* Card 1: Monthly Budget */}
        <div className="card">
          <div> {/* Top content wrapper */}
            <div className="card-header">
              <h3>Monthly Budget</h3>

              <button className="dash-btn" onClick={handleAddIncome}>
                <FiPlus className="card-icon" />
              </button>

            </div>
            <h2 className="card-value">${budget}</h2>
          </div>
          <div> {/* Bottom content wrapper */}
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${budgetPercentage}%` }}></div>
              </div>
              <span className="progress-percent">{budgetPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Spent This Month */}
        <div className="card">
          <div>
            <div className="card-header">
              <h3>Spent This Month</h3>
              <button className="dash-btn" onClick={handleAddSpend}>
                <FiPlus className="card-icon" />
              </button>
            </div>
            <h2 className="card-value">${spendData.thisMonthSpend}</h2>
          </div>
          <p className="card-info">${monthRemaining} remaining</p>
        </div>

        {/* Card 3: Savings */}
        <div className="card">
          <div>
            <div className="card-header">
              <h3>Savings</h3>
              <FiBarChart2 className="card-icon" />
            </div>
            <h2 className="card-value">${monthRemaining}</h2>
          </div>
        <p
        className="card-info savings-increase"
        style={{ color: comparePercentage < 0 ? 'red' : 'var(--positive-green)' }}
        >

        {comparePercentage < 0 ? <FiArrowDown /> : <FiArrowUp />}{" "}
        {Math.abs(comparePercentage)}% from last month
        
        </p>

        </div>

        {/* Card 4: Efficiency Score */}
        <div className="card">
          <div>
            <div className="card-header">
              <h3>Efficiency Score</h3>
              <FiTrendingUp className="card-icon" />
            </div>

            <div className="efficiency-score">
            <h2 className="card-value">{efficiencyScore}%</h2>
            <span className="great-badge">{efficiencyBadge}</span>
            </div>

          </div>
          <p className="card-info">Based on spending habits</p>
        </div>

        {/* recent spend data */}
        <div className="recent-spends-container">
            <h2>Recent Spends</h2>
            <ul className="recent-spends-list">
                {recentSpends.map((amount) => (
                    <li key={amount._id} className="spend-item">
                        <div className="spend-details">
                            <h4>{amount.title}</h4>
                            <p>{amount.category}</p>
                        
                            <p>
                            {
                            new Date(amount.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                            })
                          }
                            </p>

                        </div>
                        <div className="spend-right-section">
                            <span className="spend-amount">${Number(amount.amount).toFixed(2)}</span>
                            <button key={amount._id} className="delete-btn" onClick={() => handleDeleteRecentSpend(amount._id)}>
                                <FiTrash2 style={{ height: '20px', width: '20px' }} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

      </main>
      ):(
        <p>Loading...</p>
      )}

    </div>
    {isModalOpen && (
        <AddSpendModal
          onClose={() => setIsModalOpen('')}
          onSubmit={handleModalSubmit}
          initialType={isModalOpen}
        />
      )
      }

    {isRecordsModalOpen && (
        <AllRecordsModal
          spends={allSpends}
          onClose={() => setIsRecordsModalOpen(false)}
          onDelete={handleDeleteAllSpend}
        />
        
      )}

    <NavigatorButton></NavigatorButton>
    </>
  );
};

export default Dashboard;