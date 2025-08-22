import React, { useEffect } from "react";
import { overAllAnalyticsStore } from "../../../store/overAllAnalyticsStore";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './OverAllAnalytics.css'

function OverAllAnalysis(){

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

    const iconPaths = {
        FiArrowLeft: "M19 12H5M12 19l-7-7 7-7",
        FiDollarSign: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
        FiCalendar: "M19 4h-2V2h-2v2H9V2H7v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
        FiTag: "M20.5 12.5l-7.777 7.777a1 1 0 0 1-1.414 0L3 12.5V3h9.5L20.5 12.5zM7.5 7.5h.008v.008H7.5V7.5z",
        FiTrendingUp: "M23 6l-9.5 9.5-5-5L1 18",
        FiTrendingDown: "M23 18l-9.5-9.5-5 5L1 6"
    };

    const COLORS = ['#4A90E2', '#27AE60', '#F5A623', '#D0021B', '#8B572A', '#50E3C2', '#9B51E0', '#AAAAAA']; 

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

    const{
        monthlydata,
        weeklydata,
        fetchMonthlyData,
        fetchWeeklyData,
        yearlySpend,
        getCurrentYearSpend,
        yearlyIncome,
        getCurrentYearIncome
    } = overAllAnalyticsStore();

    useEffect(() => {
    const loadData = async () => {
        await fetchMonthlyData();
        await fetchWeeklyData();
        await getCurrentYearSpend();
        await getCurrentYearIncome();  
    };
    loadData();
    }, []);

    console.log("yearly income frontend:");
    console.log(yearlyIncome)
    
    return(
        <>
        <div class="networth-banner">
            <div>
                <div class="networth-title">Net Worth</div>
                    <div class="networth-value">₹ 1,20,000</div>
                    </div>
                        <div class="networth-change positive">
                    <span>▲</span>
                <span>+5.2%</span>
            </div>
        </div>
        <div className="summary-section">
            <div className="summary-item">
                <h4>Current Yearly Spend </h4>
                <p><span className="currency"> $ { yearlySpend} </span>{}</p>
            </div>

            <div className="summary-item">
                <h4>Current Yearly Income</h4>
                <p><span className="currency"> $ { yearlyIncome} </span></p>
            </div>
            
            <div className="summary-item">
                <h4>Average Monthly Spend</h4>
                {/* <p><span className="currency">$</span>{highestSpendInPeriod.toFixed(2)} <Icon path={iconPaths.FiTrendingUp} style={{ height: '20px', width: '20px', color: 'var(--positive-green)' }} /></p> */}
            </div>
            <div className="summary-item">
                {/* <h4>Lowest Single Spend</h4>
                <p><span className="currency">$</span>{lowestSpendInPeriod.toFixed(2)} <Icon path={iconPaths.FiTrendingDown} style={{ height: '20px', width: '20px', color: 'var(--negative-red)' }} /></p> */}
            </div>
                <div className="summary-item">
                {/* <h4>Average Daily Spend</h4>
                <p><span className="currency">$</span>{averageDailySpend} <Icon path={iconPaths.FiTrendingUp} style={{ height: '20px', width: '20px', color: 'var(--primary-blue)' }} /></p> */}
            </div>
        </div>

        <div className="charts-grid">

            {/* Every Month Spend Analysis  */}

            <div className="chart-card">
            <h3>Monthly Spending Trends</h3>
            <p className="chart-explanation">
                This bar chart shows your total spending for each month. Use it to identify months with higher or lower expenses and understand your long-term spending patterns.
            </p>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                data={
                    monthlydata.length > 0
                    ? monthlydata.map((item, index) => ({
                        name: new Date(item.StartDate).toLocaleString('default', { month: 'short', year: 'numeric' }),
                        TotalSpend: item.totalSpend
                    }))
                    : []
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS[7]} />
                <XAxis dataKey="name" stroke={COLORS[6]} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke={COLORS[6]} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px', color: 'var(--text-secondary)' }} />
                <Bar dataKey="TotalSpend" fill={COLORS[0]} name="monthly spend ($)" barSize={30} radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>


            <div className="chart-card">
            <h3>Weekly Spending Patterns</h3>
            <p className="chart-explanation">
                The line chart below illustrates your spending week by week. This can help you pinpoint specific weeks where spending deviated from your average.
            </p>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={
                weeklydata.length > 0 ? 
                weeklydata.map((item,index) => ({
                    name: new Date(item.StartDate).toLocaleString('default', { day: 'numeric', month: 'short', year: 'numeric'}),
                    TotalSpend: item.totalSpend
                }))
                :[]
                } margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS[7]} />
                <XAxis dataKey="name" stroke={COLORS[6]} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis stroke={COLORS[6]} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                    content={<CustomTooltip />}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', color: 'var(--text-secondary)' }} />
                <Line type="monotone" dataKey="TotalSpend" stroke={COLORS[1]} activeDot={{ r: 8 }} name="weekly spend ($)" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
            </div>

            <div className="chart-card">
            <h3>Daily Spending Overview</h3>
            <p className="chart-explanation">
                This chart visualizes your daily expenditures. Look for peaks on certain days that might indicate regular high-spending activities or unusual expenses.
            </p>

            {/* <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS[7]} />
                <XAxis 
                    dataKey="name" 
                    stroke={COLORS[6]} 
                    interval={Math.ceil(dailyChartData.length / 7)} 
                    angle={-30} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis stroke={COLORS[6]} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={<CustomTooltip />}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', color: 'var(--text-secondary)' }} />
                <Bar dataKey="TotalSpend" fill={COLORS[2]} name="Total Spend ($)" barSize={20} radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer> */}

            </div>

            {/* New Card for Top Categories List */}
            <div className="chart-card">
                <h3>Top Spending Categories</h3>
                <p className="chart-explanation">
                    Understand where most of your money goes. This list highlights your top categories by total spend, helping you prioritize areas for potential savings.
                </p>

                {/* <div className="category-list-container">
                    {categorySpends.length > 0 ? (
                        <ul className="category-list">
                            {categorySpends.map(([category, total], index) => (
                                <li key={category}>
                                    <span className="category-name">{index + 1}. {category}</span>
                                    <span className="category-amount">${total.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data-message">No category data available for this period.</p>
                    )}
                </div> */}

            </div>
        </div>
        </>
    )
}

export default OverAllAnalysis;