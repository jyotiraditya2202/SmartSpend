import React from 'react';
import './Dashboard.css';
import { FiTarget, FiDollarSign, FiBarChart2, FiTrendingUp, FiArrowUp, FiPlus, FiArrowDown, FiTrash2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import * as spendUtils from '../../api/spendUtils'; 
import { useDashboardStore } from '../../store/dashboardStore';

const Icon = ({ path, className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d={path} />
  </svg>
);

// // SVG paths for the icons used in the dashboard
// const iconPaths = {
//   FiTarget: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
//   FiDollarSign: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
//   FiBarChart2: "M18 20V10M12 20V4M6 20v-6",
//   FiTrendingUp: "M23 6l-9.5 9.5-5-5L1 18",
//   FiPlus: "M12 5v14M5 12h14",
//   FiArrowUp: "M12 19V5M5 12l7-7 7 7",
//   FiArrowDown: "M12 5v14M19 12l-7 7-7-7",
//   FiX: "M18 6L6 18M6 6l12 12"
// };

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
          <Icon path={iconPaths.FiX} />
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




const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
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
  
  const [recentSpends, setRecentSpends] = useState([
    { id: 1, title: 'Groceries', category: 'Groceries', spend: 75.25 },
    { id: 2, title: 'Dinner', category: 'Dining Out', spend: 45.00 },
    { id: 3, title: 'Movie tickets', category: 'Entertainment', spend: 22.50 },
    { id: 4, title: 'Gas', category: 'Transportation', spend: 35.00 },
    { id: 5, title: 'Internet bill', category: 'Utilities', spend: 60.00 },
  ]);


  const handleModalSubmit = async (newRecord) => {
    try {
        const response = await spendUtils.insertSpend(newRecord);
        console.log('Record inserted successfully:', response);

        // Optionally refetch the updated data via initialize()
        initialize();
    } catch (error) {
        console.error('Error inserting record:', error);
        alert('Failed to insert spend record. Please try again.');
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
        <button className="add-spend-btn" onClick={handleAddSpend}>
            <FiPlus className="add-spend-icon" style={{ height: '20px', width: '20px', strokeWidth: '3' }} />
            Add Spend
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
        style={{ color: comparePercentage < 0 ? 'red' : 'inherit' }}
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
                    <li key={spend.id} className="spend-item">
                        <div className="spend-details">
                            <h4>{spend.title}</h4>
                            <p>{spend.category}</p>
                        </div>
                        <div className="spend-right-section">
                            <span className="spend-amount">${spend.spend.toFixed(2)}</span>
                            <button className="delete-btn" onClick={() => handleDeleteSpend(spend.id)}>
                                <FiTrash2 className="delete-btn" style={{ height: '20px', width: '20px' }} />
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
    </>
  );
};

export default Dashboard;