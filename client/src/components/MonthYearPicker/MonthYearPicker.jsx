import './MonthYearPicker.css';
import React, { useState } from "react";

import { useDashboardStore } from '../../store/dashboardStore.js';

const MonthYearPicker = () => {
  const {
      month,
      year,
      setMonth,
      setYear
    } = useDashboardStore();
    
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const today = new Date();


  // handle month change
  const changeMonth = (direction) => {
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  // handle year change
  const changeYear = (direction) => {
    setYear(prev => prev + direction);
  };

  return (
    <div className="picker-container">
      {/* Month Selector */}
      <button className="nav-button" onClick={() => changeMonth(-1)}>◀</button>
      <div className="picker-section">
        
        <div 
          className="custom-box"
          onWheel={(e) => changeMonth(e.deltaY > 0 ? 1 : -1)}
        >
          {months[month]}
        </div>
      </div>

      {/* Year Selector */}
      <div className="picker-section">
        <div 
          className="custom-box"
          onWheel={(e) => changeYear(e.deltaY > 0 ? 2 : -1)}
        >
          {year}
        </div>
      </div>
      <button className="nav-button" onClick={() => changeMonth(1)}>▶</button>

    </div>
  );
};

export default MonthYearPicker;
