
import React from 'react';
import axios from 'axios';

// --- env usge in api routes is yet to make ---
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchIncome = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/spendutils/getbudget`, {
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
    const response = await fetch(`${BASE_URL}/api/spendutils/getammount`, {
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

export const insertIncome = async (data) => {
  const token = localStorage.getItem('token'); // or however you store your auth token

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/income/insert`,
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

export const getRecentSpends = async () => {
  try {
    const token = localStorage.getItem('token'); // assuming you store JWT token here

    const res = await axios.post(
      `${BASE_URL}/api/spendutils/recentSpend`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("----------");
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.error('Error fetching recent spends:', err);
    return null;
  }
};

export const getAllSpends = async () => {
  try {
    const token = localStorage.getItem('token'); // assuming you store JWT token here

    const res = await axios.post(
      `${BASE_URL}/api/spendutils/allSpend`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error('Error fetching all spends:', err);
    return null;
  }
};