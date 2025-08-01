import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication_page from "./pages/Authentication/authentication";

function App() {
  return (
    <>
      <Authentication_page />
    </>
  );
}

export default App;