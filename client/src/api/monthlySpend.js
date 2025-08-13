import React from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchMonthlyData = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/MonthlySpend/fetchdata`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Error fetching monthly data");

    return data;

  } catch (error) {
    console.error("fetch monthly data error:", error);
    return null;
  }
}

// --- sync api ---
export const syncMonthlyData = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/MonthlySpend/sync`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Error fetching monthly data");

    return data;

  } catch (error) {
    console.error("syncing monthly data error:", error);
    return null;
  }
}

