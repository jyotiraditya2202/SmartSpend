import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const generatePrompt = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/generatePrompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({}) 
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Error generating prompt");

    return data.firstreply;

  } catch (error) {
    console.error("generatePrompt error:", error);
    return null;
  }
};
