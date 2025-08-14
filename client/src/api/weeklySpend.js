import React from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// -- fetch weekly data ---
export const fetchWeeklyData = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/WeeklySpend/fetchdata`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Error fetching weekly data");

    return data;

  } catch (error) {
    console.error("fetch weekly data error:", error);
    return null;
  }
}

// --- sync api ---
export const syncWeeklyData = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/WeeklySpend/sync`, {
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

