import React from "react";
import { Routes, Route } from 'react-router-dom'; // No need to import BrowserRouter here

import Authentication_page from "./pages/Authentication/authentication";
import Dashboard from "./pages/Dashboard/dashboard";
import ChatSection from "./pages/chat_bot/chat_bot";

function App() {
  return (
    // Your routes should be placed directly here,
    // as the top-level router is already in main.jsx.
    <Routes>
      {/* Route for the authentication page */}
      <Route path="/" element={<Authentication_page />} />
      
      {/* Route for the dashboard page */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Route for the chat page */}
      <Route path="/chat" element={<ChatSection />} />
    </Routes>
  );
}

export default App;