import React, { useEffect } from "react";
import { overAllAnalyticsStore } from "../../../store/overAllAnalyticsStore";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './OverAllAnalytics.css'

function OverAllAnalysis(){

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
        fetchWeeklyData
    } = overAllAnalyticsStore();

    useEffect(() => {
        fetchMonthlyData();
        fetchWeeklyData();
    }, []);
    
    return(
        <>
        <div className="summary-section">
            <div className="summary-item">
                {/* <h4>Total Spend ({currentPeriodType})</h4>
                <p><span className="currency">$</span>{totalOverallSpend.toFixed(2)}</p> */}
            </div>
            <div className="summary-item">
                {/* <h4>Most Spent Category</h4>
                <p>{mostSpentCategory} <Icon path={iconPaths.FiTag} style={{ height: '20px', width: '20px', color: 'var(--primary-blue)' }} /></p> */}
            </div>
            <div className="summary-item">
                  {/* <h4>Highest Single Spend</h4>
                <p><span className="currency">$</span>{highestSpendInPeriod.toFixed(2)} <Icon path={iconPaths.FiTrendingUp} style={{ height: '20px', width: '20px', color: 'var(--positive-green)' }} /></p> */}
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