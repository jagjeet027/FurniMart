import express from 'express';
import {
  getAllCompanies,
  getApprovedCompanies,
  registerCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  trackCompanyClick,
} from '../../controllers/cargoInsurance/companyController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCompanies);
router.get('/approved', getApprovedCompanies);
router.post('/register', registerCompany);
router.get('/:id', getCompanyById);
router.put('/:id', protect, updateCompany);
router.delete('/:id', protect, deleteCompany);
router.post('/:id/track-click', trackCompanyClick);

export default router;
