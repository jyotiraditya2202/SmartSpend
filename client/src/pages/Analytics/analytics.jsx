import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './analytics.css';
import * as monthlyData from '../../api/monthlySpend';
import * as weeklyData from '../../api/weeklySpend';
import OverAllAnalysis from './OverAllAnalytics/OverAllAnalytics';

// Reusable Icon component using inline SVG for a clean, library-free solution.
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

// SVG paths for the icons used (keeping relevant ones)
const iconPaths = {
  FiArrowLeft: "M19 12H5M12 19l-7-7 7-7",
  FiDollarSign: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  FiCalendar: "M19 4h-2V2h-2v2H9V2H7v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  FiTag: "M20.5 12.5l-7.777 7.777a1 1 0 0 1-1.414 0L3 12.5V3h9.5L20.5 12.5zM7.5 7.5h.008v.008H7.5V7.5z",
  FiTrendingUp: "M23 6l-9.5 9.5-5-5L1 18",
  FiTrendingDown: "M23 18l-9.5-9.5-5 5L1 6"
};


const AnalyticsPage = () => {
  // ---
  const token = localStorage.getItem('token');

  const[monthlydata, Setmonthlydata] = useState('');
  const[weeklydata, Setweeklydata] = useState('');

  useEffect(() => {
    const fetchMonthlyData = async () => {
        try {
          const res = await monthlyData.fetchMonthlyData(token);
          
          if (!res) {
            console.log("Monthly data found Empty!!");
          }
          Setmonthlydata(res);
        } catch (err) {
          console.error("Error fetching monthly data:", err);
        }
      };
    
    const fetchWeeklyData = async () => {
        try{
            const res = await weeklyData.fetchWeeklyData(token);
            if(!res){
                console.log("Weekly Data found Empty!!");
            }
            Setweeklydata(res);
        }
        catch(err){
          console.log("Error fetching Weekly Data")
        }

    } 
    fetchMonthlyData();
    fetchWeeklyData();
  }, []);

  console.log(monthlydata);
  // --- 
  // Mock spending data - you can replace this with actual data fetched from a backend
  const [allSpends] = useState([
    { id: 1, title: 'Groceries', category: 'Groceries', spend: 75.25, date: '2023-10-25' },
    { id: 2, title: 'Dinner', category: 'Dining Out', spend: 45.00, date: '2023-10-24' },
    { id: 3, title: 'Movie tickets', category: 'Entertainment', spend: 22.50, date: '2023-10-23' },
    { id: 4, title: 'Gas', category: 'Transportation', spend: 35.00, date: '2023-10-22' },
    { id: 5, title: 'Internet bill', category: 'Utilities', spend: 60.00, date: '2023-10-21' },
    { id: 6, title: 'Coffee', category: 'Dining Out', spend: 4.50, date: '2023-10-20' },
    { id: 7, 'title': 'Clothes', category: 'Shopping', spend: 120.00, date: '2023-10-19' },
    { id: 8, title: 'Gym membership', category: 'Health', spend: 50.00, date: '2023-10-18' },
    { id: 9, title: 'Books', category: 'Education', spend: 30.00, date: '2023-10-17' },
    { id: 10, title: 'Electricity', category: 'Utilities', spend: 80.00, date: '2023-09-28' },
    { id: 11, title: 'Concert', category: 'Entertainment', spend: 70.00, date: '2023-09-25' },
    { id: 12, title: 'Restaurant', category: 'Dining Out', spend: 55.00, date: '2023-09-20' },
    { id: 13, title: 'Bus fare', category: 'Transportation', spend: 15.00, date: '2023-09-15' },
    { id: 14, title: 'New Gadget', category: 'Shopping', spend: 250.00, date: '2023-09-10' },
    { id: 15, title: 'Pharmacy', category: 'Health', spend: 20.00, date: '2023-09-05' },
    { id: 16, title: 'Online Course', category: 'Education', spend: 100.00, date: '2023-08-30' },
    { id: 17, title: 'Cafe', category: 'Dining Out', spend: 12.00, date: '2023-08-28' },
    { id: 18, title: 'Fuel', category: 'Transportation', spend: 40.00, date: '2023-08-25' },
    { id: 19, title: 'Streaming Sub', category: 'Entertainment', spend: 10.00, date: '2023-08-20' },
    { id: 20, title: 'Rent', category: 'Utilities', spend: 1000.00, date: '2023-08-01' },
    { id: 21, title: 'Lunch', category: 'Dining Out', spend: 18.00, date: '2023-10-25' },
    { id: 22, title: 'Snacks', category: 'Groceries', spend: 10.50, date: '2023-10-25' },
    { id: 23, title: 'Taxi', category: 'Transportation', spend: 20.00, date: '2023-10-24' },
    { id: 24, title: 'Game', category: 'Entertainment', spend: 40.00, date: '2023-10-24' },
    { id: 25, title: 'Water Bill', category: 'Utilities', spend: 30.00, date: '2023-10-20' },
  ]);

  // State for controlling the analytics view
  const [currentPeriodType, setCurrentPeriodType] = useState('overall'); // 'overall', 'monthly', 'weekly'
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');

  // Generate unique months and weeks for dropdown filters
  const getUniqueMonths = () => {
    const months = [...new Set(allSpends.map(spend => new Date(spend.date).toLocaleString('en-US', { year: 'numeric', month: 'long' })))];
    // Sort months chronologically
    return months.sort((a, b) => new Date(a) - new Date(b));
  };

  const getUniqueWeeks = () => {
    const weeks = [...new Set(allSpends.map(spend => {
      const date = new Date(spend.date);
      const year = date.getFullYear();
      const week = Math.ceil((((date - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
      return `${year}-W${week.toString().padStart(2, '0')}`;
    }))];
    return weeks.sort(); // Sort lexicographically for weeks
  };

  const uniqueMonths = getUniqueMonths();
  const uniqueWeeks = getUniqueWeeks();

  // Set initial selected month/week to the latest available
  useEffect(() => {
    if (uniqueMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(uniqueMonths[uniqueMonths.length - 1]);
    }
    if (uniqueWeeks.length > 0 && !selectedWeek) {
      setSelectedWeek(uniqueWeeks[uniqueWeeks.length - 1]);
    }
  }, [allSpends]); // Run once when allSpends is available

  // Filtered spends based on current view and selections
  const getFilteredSpends = () => {
    if (currentPeriodType === 'overall') {
      return allSpends;
    } else if (currentPeriodType === 'monthly' && selectedMonth) {
      return allSpends.filter(spend => 
        new Date(spend.date).toLocaleString('en-US', { year: 'numeric', month: 'long' }) === selectedMonth
      );
    } else if (currentPeriodType === 'weekly' && selectedWeek) {
      return allSpends.filter(spend => {
        const date = new Date(spend.date);
        const year = date.getFullYear();
        const week = Math.ceil((((date - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}` === selectedWeek;
      });
    }
    return []; // Return empty array if no filter matches or selection is empty
  };

  const filteredSpends = getFilteredSpends();

  // --- Data Aggregation Functions (now operate on filteredSpends) ---

  // Aggregate spends by month
  const getMonthlySpendsData = (spendsToAggregate) => {
    const monthlyData = {};
    spendsToAggregate.forEach(spend => {
      const monthYear = new Date(spend.date).toLocaleString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += spend.spend;
    });
    return Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b)).map(monthYear => ({
      name: monthYear,
      TotalSpend: monthlyData[monthYear],
    }));
  };

  // Aggregate spends by week
  const getWeeklySpendsData = (spendsToAggregate) => {
    const weeklyData = {};
    spendsToAggregate.forEach(spend => {
      const date = new Date(spend.date);
      const day = date.getDay(); 
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
      const weekStart = new Date(date.setDate(diff));
      const weekKey = `${weekStart.getFullYear()}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}-${weekStart.getDate().toString().padStart(2, '0')}`;
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey] += spend.spend;
    });
    return Object.keys(weeklyData).sort((a, b) => new Date(a) - new Date(b)).map(weekKey => ({
      name: weekKey,
      TotalSpend: weeklyData[weekKey],
    }));
  };

  // Aggregate spends by category
  const getCategorySpendsData = (spendsToAggregate) => {
    const categoryData = {};
    spendsToAggregate.forEach(spend => {
      if (!categoryData[spend.category]) {
        categoryData[spend.category] = 0;
      }
      categoryData[spend.category] += spend.spend;
    });
    return Object.entries(categoryData)
      .sort(([, a], [, b]) => b - a);
  };

  // Aggregate spends by day
  const getDailySpendsData = (spendsToAggregate) => {
    const dailyData = {};
    spendsToAggregate.forEach(spend => {
      const dateKey = spend.date; 
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = 0;
      }
      dailyData[dateKey] += spend.spend;
    });
    return Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b)).map(dateKey => ({
      name: dateKey,
      TotalSpend: dailyData[dateKey],
    }));
  };

  const monthlyChartData = getMonthlySpendsData(filteredSpends);
  const weeklyChartData = getWeeklySpendsData(filteredSpends);
  const categorySpends = getCategorySpendsData(filteredSpends);
  const dailyChartData = getDailySpendsData(filteredSpends);

  // Derived insights for textual explanations (operate on filteredSpends)
  const totalOverallSpend = filteredSpends.reduce((sum, record) => sum + record.spend, 0);
  const mostSpentCategory = categorySpends.length > 0 ? categorySpends[0][0] : 'N/A';
  const highestSpendInPeriod = filteredSpends.length > 0 ? Math.max(...filteredSpends.map(s => s.spend)) : 0;
  const lowestSpendInPeriod = filteredSpends.length > 0 ? Math.min(...filteredSpends.map(s => s.spend)) : 0;
  const averageDailySpend = dailyChartData.length > 0 ? (totalOverallSpend / dailyChartData.length).toFixed(2) : 'N/A';
  
  // Custom tooltip for daily/weekly/monthly charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-tooltip-wrapper">
          <p className="recharts-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="recharts-tooltip-item" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Colors for chart elements
  const COLORS = ['#4A90E2', '#27AE60', '#F5A623', '#D0021B', '#8B572A', '#50E3C2', '#9B51E0', '#AAAAAA']; 

  return (
    <>
      <OverAllAnalysis></OverAllAnalysis>
    </>
  );
};

export default AnalyticsPage;
