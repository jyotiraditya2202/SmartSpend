import React from 'react';
import './Dashboard.css';
import { FiTarget, FiDollarSign, FiBarChart2, FiTrendingUp, FiArrowUp } from 'react-icons/fi';
import { useState, useEffect } from 'react';


const GetUserData = async () => {
  const token = localStorage.getItem('token'); // Get token from localStorage

  if (!token) {
    console.error("No token found in localStorage");
    return null;
  }

  const fetchSpend = async (startDate, endDate) => {
    try {
      const response = await fetch('http://localhost:5000/api/spendutils/getammount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send token to backend
        },
        body: JSON.stringify({
          start_date: startDate.toISOString(),
          last_date: endDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error fetching spend data");

      return data.total_spent;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Helpers to get date ranges
  const now = new Date();
  const startOfThisWeek = new Date(now);
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  startOfThisWeek.setDate(now.getDate() + diff);

  const startOfLastWeek = new Date(startOfThisWeek.getTime());
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    startOfLastWeek.setHours(0, 0, 0, 0);

    const endOfLastWeek = new Date(startOfThisWeek.getTime());
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

  const startOfThisMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const startOfLastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
  const endOfLastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0));


  // Get all four values
  const thisWeekSpend = await fetchSpend(startOfThisWeek, now);
  const lastWeekSpend = await fetchSpend(startOfLastWeek, endOfLastWeek);
  const thisMonthSpend = await fetchSpend(startOfThisMonth, now);
  const lastMonthSpend = await fetchSpend(startOfLastMonth, endOfLastMonth);

  endOfLastMonth.setHours(23, 59, 59, 999);

  return {
    thisWeekSpend,
    lastWeekSpend,
    thisMonthSpend,
    lastMonthSpend,
  };
};

const Dashboard = () => {

  const [spendData, setSpendData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await GetUserData();
      setSpendData(data);
    };

    fetchData();
  }, []);

  console.log(spendData);
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>SmartSpend Dashboard</h1>
        <p>Your intelligent spending companion</p>
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
            <h2 className="card-value">$3000</h2>
          </div>
          <div> {/* Bottom content wrapper */}
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '72%' }}></div>
              </div>
              <span className="progress-percent">72%</span>
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
          <p className="card-info">$850 remaining</p>
        </div>

        {/* Card 3: Savings */}
        <div className="card">
          <div>
            <div className="card-header">
              <h3>Savings</h3>
              <FiBarChart2 className="card-icon" />
            </div>
            <h2 className="card-value">$850</h2>
          </div>
          <p className="card-info savings-increase">
            <FiArrowUp /> +12% from last month
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
              <h2 className="card-value">78%</h2>
              <span className="great-badge">Great</span>
            </div>
          </div>
          <p className="card-info">Based on spending habits</p>
        </div>

      </main>
      ):(
        <p>Loading...</p>
      )}

    </div>
  );
};

export default Dashboard;