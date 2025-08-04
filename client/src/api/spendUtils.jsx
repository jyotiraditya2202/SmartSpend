
import React from 'react';
import axios from 'axios';

export const fetchBudget = async (token) => {
  try {
    const response = await fetch('http://localhost:5000/api/spendutils/getbudget', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Error fetching budget data");

    return data.budget;

  } catch (error) {
    console.error("fetchSpend error:", error);
    return null;
  }
}

export const fetchSpend = async (token, startDate, endDate) => {
  try {
    const response = await fetch('http://localhost:5000/api/spendutils/getammount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    console.error("fetchSpend error:", error);
    return null;
  }
};

export const insertSpend = async (data) => {
  const token = localStorage.getItem('token'); // or however you store your auth token

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/spend/insert`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};