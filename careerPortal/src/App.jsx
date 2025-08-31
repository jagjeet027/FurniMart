import React from 'react'
import FurnimartCareerPortal from './components/FurnimartCareerPortal'
import StaffHiring from './components/StaffHiring' // Fixed: Capital S in StaffHiring
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterIndividuals from './components/RegisterIndividuals';
import OrganizationRegister from './components/OrganizationRegister';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FurnimartCareerPortal />} />
          <Route path="/staff/hiring" element={<StaffHiring />} /> 
          <Route path="/register/individual-applicant" element={<RegisterIndividuals/>}/>
          <Route path="register/organization-applicant" element={<OrganizationRegister/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;