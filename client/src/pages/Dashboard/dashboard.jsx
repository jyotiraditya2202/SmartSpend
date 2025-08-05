import React from 'react';
import './Dashboard.css';
import { FiTarget, FiDollarSign, FiBarChart2, FiTrendingUp, FiArrowUp, FiPlus, FiArrowDown, FiTrash2, FiList, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import * as spendUtils from '../../api/spendUtils'; 
import { useDashboardStore } from '../../store/dashboardStore';
import axios from 'axios';

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

// Modal component for adding new spend records
const AddSpendModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(spendCategories[0]);
  const [spend, setSpend] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !category || !spend) {
      setError("Please fill out all fields.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Simulating API call
    setTimeout(() => {
      console.log('Submitting new spend record:', { title, category, spend: parseFloat(spend) });
      onSubmit({ title, category, spend: parseFloat(spend) });
      setIsSubmitting(false);
      onClose(); // Close the modal after submission
    }, 1000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <h2 className="modal-title">Add New Spend</h2>
        <form className="add-spend-form" onSubmit={handleSubmit}>
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
              {spendCategories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="spend">Amount ($)</label>
            <input
              id="spend"
              type="number"
              value={spend}
              onChange={(e) => setSpend(e.target.value)}
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
            spends.map((spend) => (
              <div key={spend._id} className="records-list-item">
                <div className="records-item-details">
                  <div className="records-item-title-cat">
                    <h4>{spend.title}</h4>
                    <p className="records-item-category">{spend.category}</p>
                  </div>

                  <span className="records-item-date">
                    {
                    new Date(spend.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                    })}
                  </span>

                </div>
                <div className="records-item-actions">
                  <span className="records-item-amount">${spend.spend.toFixed(2)}</span>
                  <button key={spend._id} className="delete-btn" onClick={() => onDelete(spend._id)}>
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
    const {
    budget,
    spendData,
    monthRemaining,
    budgetPercentage,
    comparePercentage,
    initialize
  } = useDashboardStore();
  
  const efficiencyScore = useDashboardStore(state => state.efficiencyScore);
  const efficiencyBadge = useDashboardStore(state => state.efficiencyBadge);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAddSpend = () => {
    setIsModalOpen(true);
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

  const fetchAllSpends = async () => {
      const data = await spendUtils.getAllSpends();
      if (data) setAllSpends(data);
  };

  useEffect(() => {
    fetchAllSpends();
  }, []);


  const handleModalSubmit = async (newRecord) => {
    try {
        const response = await spendUtils.insertSpend(newRecord);
        console.log('Record inserted successfully:', response);

        // Optionally refetch the updated data via initialize()
        initialize();
        await fetchSpends(); 
    } catch (error) {
        console.error('Error inserting record:', error);
        alert('Failed to insert spend record. Please try again.');
    }
  };

  const handleDeleteRecentSpend = async (id) => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.delete(
            `http://localhost:5000/api/spend/delete/${id}`,
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
            `http://localhost:5000/api/spend/delete/${id}`,
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

        {/* add spend button */}
        <button className="add-spend-btn" onClick={handleAddSpend}>
            <FiPlus className="add-spend-icon" style={{ height: '20px', width: '20px', strokeWidth: '3' }} />
            Add Spend
        </button>

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
              <FiTarget className="card-icon" />
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
              <FiDollarSign className="card-icon" />
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
                {recentSpends.map((spend) => (
                    <li key={spend._id} className="spend-item">
                        <div className="spend-details">
                            <h4>{spend.title}</h4>
                            <p>{spend.category}</p>
                        
                            <p>
                            {
                            new Date(spend.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                            })}
                            </p>

                        </div>
                        <div className="spend-right-section">
                            <span className="spend-amount">${spend.spend.toFixed(2)}</span>
                            <button key={spend._id} className="delete-btn" onClick={() => handleDeleteRecentSpend(spend._id)}>
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
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}

    {isRecordsModalOpen && (
        <AllRecordsModal
          spends={allSpends}
          onClose={() => setIsRecordsModalOpen(false)}
          onDelete={handleDeleteAllSpend}
        />
      )}
      
    </>
  );
};

export default Dashboard;