import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommandTable from "./CommandTable.jsx";
import LoginPage from './Login.jsx';

function App() {
    return (
      
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/commands" element={<CommandTable/>} />
      </Routes>
    </Router>
  );
}

export default App
