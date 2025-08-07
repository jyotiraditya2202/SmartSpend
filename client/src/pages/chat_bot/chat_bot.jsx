import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiDollarSign, FiBarChart2, FiTrendingUp, FiArrowUp, FiPlus, FiArrowDown, FiTrash2, FiList, FiX, FiMessageSquare, FiUser, FiArrowLeft, FiSend } from 'react-icons/fi';
import * as chat from '../../api/chatBotUtils';
import './chat_bot.css';
import { useState, useEffect } from 'react';
import { generatePrompt } from '../../api/chatBotUtils';
import ReactMarkdown from 'react-markdown';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Use Vite style env if applicable

const ChatSection = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
        const initChat = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const result = await generatePrompt(token);
                if (result) {
                    setMessages([{ role: 'bot', content: result }]);
                } else {
                    setMessages([{ role: 'bot', content: 'Hello! I am your SmartSpend assistant. What can I help you with today?' }]);
                }
            } else {
                setMessages([{ role: 'bot', content: 'Missing token. Please login again.' }]);
            }
        };

        initChat();
    }, []);

  const handleCloseChat = () => {
    navigate('/dashboard'); 
  };

  const handleSend = async () => {
        if (input.trim() === '') return;

        const newUserMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token'); // Get the JWT token from local storage

            const response = await fetch(`${BASE_URL}/api/chat/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add token to Authorization header
                },
                body: JSON.stringify({ userMessage: input }) // Server handles history
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            const botReply = data.response || 'No response from bot.';

            const newBotMessage = { role: 'bot', content: botReply };
            setMessages(prev => [...prev, newBotMessage]);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [
                ...prev,
                { role: 'bot', content: 'Sorry, I am unable to connect right now.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    
  return (
    <>
      <div className="full-page-chat-container">
        <div className="chat-header">
            <button className="back-btn" onClick={handleCloseChat}>
                <FiArrowLeft style={{ height: '20px', width: '20px' }} />
            </button>
            <h2 className="chat-title">SmartSpend Assistant</h2>
            <div></div> 
        </div>
        <div className="chat-messages">
            {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>
                    <div className="message-icon">
                        <FiUser  style={{ height: '20px', width: '20px' }}/>
                    </div>
                    <div className="message-bubble">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="chat-message bot">
                    <div className="message-icon">
                        <FiUser  style={{ height: '20px', width: '20px' }}/>
                    </div>
                    <div className="message-bubble loading">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                </div>
            )}
        </div>
        <div className="chat-input-container">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your spending..."
                className="chat-input"
                disabled={isLoading}
            />
            <button onClick={handleSend} className="send-btn" disabled={isLoading}>
                <FiSend  style={{ height: '20px', width: '20px' }} />
            </button>
        </div>
    </div>


      <button className="floating-chat-btn" onClick={handleCloseChat}>
        <FiX style={{ height: '24px', width: '24px', strokeWidth: '3' }} />
      </button>
    </>
  );
};

export default ChatSection;
