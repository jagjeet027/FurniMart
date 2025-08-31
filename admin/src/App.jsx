import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ManufacturerDashboard from './components/dashboard/ManufacturerDashboard/ManufacturerDashboard';   

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManufacturerDashboard />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
