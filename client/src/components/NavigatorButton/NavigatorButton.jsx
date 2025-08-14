import './NavigatorButton.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiX, FiArrowUpCircle, FiPieChart, FiPlus } from 'react-icons/fi'; 


function NavigatorButton(){
    
    
    const [CurrentView, setCurrentView] = useState(false);
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    const navigate = useNavigate();

    // --- chat open state ---
    useEffect(() => {
        if (CurrentView === 'chat') {
        navigate('/chat');
        }
        if (CurrentView === 'analytics') {
        navigate('/analytics');
        }
    }, [CurrentView, navigate]);

    return(
        <div className="fab-container">

        {/* <button
            className={`fab-child-button ${isFloatingMenuOpen ? '' : 'hidden'}`}
            onClick={() => { handleAddSpend(); setIsFloatingMenuOpen(false); }}
        >
            <Icon path={iconPaths.FiPlus} style={{ height: '20px', width: '20px' }} />
            Add Spend
        </button>

        <button
            className={`fab-child-button ${isFloatingMenuOpen ? '' : 'hidden'}`}
            onClick={() => { setCurrentView('records'); setIsFloatingMenuOpen(false); }}
        >
            <Icon path={iconPaths.FiList} style={{ height: '20px', width: '20px' }} />
            All Records
        </button>

        <button
            className={`fab-child-button ${isFloatingMenuOpen ? '' : 'hidden'}`}
            onClick={() => { setCurrentView('analytics'); setIsFloatingMenuOpen(false); }}
        >
            <Icon path={iconPaths.FiPieChart} style={{ height: '20px', width: '20px' }} />
            Analytics
        </button> */}
        <button
        className={`fab-child-button ${isFloatingMenuOpen ? '' : 'hidden'}`}
        onClick={() => {
            setCurrentView('analytics');
            setIsFloatingMenuOpen(false);
        }}
        >
        <FiPieChart style={{ height: '24px', width: '24px', strokeWidth: '3' }} />
        
        </button>
        

        <button
            className={`fab-child-button ${isFloatingMenuOpen ? '' : 'hidden'}`}
            onClick={() => { setCurrentView('chat'); setIsFloatingMenuOpen(false); }}
        >
            <FiMessageSquare style={{ height: '24px', width: '24px', strokeWidth: '3' }}/>
        </button>

        <button
            className={`fab-child-button ${isFloatingMenuOpen ? '' : 'hidden'}`}
            onClick={() => { setCurrentView('chat'); setIsFloatingMenuOpen(false); }}
        >
            <FiPlus style={{ height: '24px', width: '24px', strokeWidth: '3' }}/>
        </button>

        <button className="fab-button" onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}>
            
            {
            isFloatingMenuOpen ? (
            <FiX style={{ height: '24px', width: '24px', strokeWidth: '3' }} />
            ) : (
            <FiArrowUpCircle style={{ height: '24px', width: '24px', strokeWidth: '3' }} />
            )
            }

        </button>
        </div>
);
}

export default NavigatorButton;