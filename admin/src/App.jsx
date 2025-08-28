import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard/adminDashboard/Dashboard';
import ManufacturerDashboard from './components/dashboard/ManufacturerDashboard/ManufacturerDashboard';
import Userdashboard from './components/dashboard/usersDashboard/Userdashboard';
import IssueDetailPage from './components/dashboard/ManufacturerDashboard/IdeaDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/" element={<ManufacturerDashboard />} />
        <Route path="/userdashboard/*" element={<Userdashboard />} />
        <Route path="idea/:id" element={<IssueDetailPage />} />
        <Route path="/issues" element={<IssueDetailPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
