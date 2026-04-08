import express from 'express';
import {
  getAllLoanProviders,
  getApprovedLoanProviders,
  registerLoanProvider,
  getLoanProviderById,
  updateLoanProvider,
  deleteLoanProvider,
  trackLoanProviderClick,
} from '../../controllers/cargoInsurance/loanProviderController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getAllLoanProviders);
router.get('/approved', getApprovedLoanProviders);
router.post('/register', registerLoanProvider);
router.get('/:id', getLoanProviderById);
router.put('/:id', protect, updateLoanProvider);
router.delete('/:id', protect, deleteLoanProvider);
router.post('/:id/track-click', trackLoanProviderClick);

export default router;
