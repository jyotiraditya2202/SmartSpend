import React from 'react';
import './dashboard.css';
import { FiTarget, FiDollarSign, FiBarChart2, FiTrendingUp, FiArrowUp, FiPlus, FiArrowDown, FiTrash2, FiList, FiX, FiMessageSquare } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


import * as spendUtils from '../../api/spendUtils'; 
import * as monthlySpend from '../../api/monthlySpend'; 
import * as weeklySpend from '../../api/weeklySpend';

import { useDashboardStore } from '../../store/dashboardStore';

import NavigatorButton from '../../components/NavigatorButton/NavigatorButton';
import AllRecordsModal from '../AllRecords/allRecords';
import AddSpendModal from '../AddSpend/addSpend';
import AddIncomeModal from '../AddIncome/addIncome';
import AddUpcomingSpendModal from '../AddUpcomingSpend/addUpcomingSpend';
import MonthYearPicker from '../../components/MonthYearPicker/MonthYearPicker';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Use Vite style env if applicable


// model
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
  const handleAddUpcomingSpend = () => {
    setIsModalOpen('upcomingSpent');
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
  }, [isModalOpen]);

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
        {/* <button className="add-spend-btn" onClick={() => setIsRecordsModalOpen(true)}>
            <FiList style={{ height: '20px', width: '20px', strokeWidth: '3' }} />
            View All Transaction
        </button> */}
        <div className="add-spend-btn" >
          <MonthYearPicker/>
        </div>

        </div>

      </header>
      {spendData ? (
      <main className="dashboard-grid">
        
        {/* Card 1: Monthly Budget */}
        <div className="card">
          <div> {/* Top content wrapper */}
            <div className="card-header">
              <h3>Income</h3>

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
              <h3>Expence</h3>
              <button className="dash-btn" onClick={handleAddSpend}>
                <FiPlus className="card-icon" />
              </button>
            </div>
            <h2 className="card-value">${spendData.thisMonthSpend}</h2>
          </div>

          <p
            className="card-info savings-increase"
            style={{ color: comparePercentage < 0 ? 'red' : 'var(--positive-green)' }}
          >

            {comparePercentage < 0 ? <FiArrowDown /> : <FiArrowUp />}{" "}
            {Math.abs(comparePercentage)}% from last month
          
          </p>
          
        </div>

        {/* Card 3: Savings */}
        <div className="card">
          <div>
            <div className="card-header">
              <h3>Upcoming Expence</h3>

              <button className="dash-btn" onClick={handleAddUpcomingSpend}>
                <FiPlus className="card-icon" />
              </button>

            </div>
            
            <h2 className="card-value">${spendData.upcomingSpend}</h2>
            {console.log(spendData.upcomingSpend)}
          
          </div>
            <p className="card-info">Projected Expence ${spendData.thisMonthSpend+spendData.upcomingSpend}</p>
        </div>

        {/* Card 4: Efficiency Score */}
        <div className="card">
          <div>
            <div className="card-header">
              <h3>Total Remaining</h3>
              <FiTrendingUp className="card-icon" />
            </div>

            <div className="efficiency-score">
            <h2 className="card-value">${monthRemaining}</h2>
            <span className="great-badge">{efficiencyBadge}</span>
            </div>

          </div>
          <p className="card-info">Based on spending habits</p>
        </div>

        {/* spend pi chart */}



        {/* recent spend data */}
        {/* <div className="recent-spends-container">
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
        </div> */}

      </main>
      ):(
        <p>Loading...</p>
      )}

    </div>
    {isModalOpen === "spent" && (
        <AddSpendModal
        isModalOpen={isModalOpen}
        setIsModelOpen={setIsModalOpen}
        />
      )}
      {
      isModalOpen === "income" && (
        <AddIncomeModal
          isModalOpen={isModalOpen}
          setIsModelOpen={setIsModalOpen}
        />
      )
      }
      {
      isModalOpen === "upcomingSpent" && (
        <AddUpcomingSpendModal
          isModalOpen={isModalOpen}
          setIsModelOpen={setIsModalOpen}
        />
      )
      }

    {isRecordsModalOpen && (
        <AllRecordsModal 
        isOpenAllSpendRecord={isRecordsModalOpen}
        setIsOpenAllSpendRecord={setIsRecordsModalOpen}
        />
      )}


    <NavigatorButton></NavigatorButton>
    </>
  );
};

export default Dashboard;