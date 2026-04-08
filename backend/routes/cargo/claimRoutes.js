// import express from 'express';
// import {
//   submitClaim,
//   getClaims,
//   getClaimById,
//   reviewClaim,
//   updateClaimStatus
// } from '../controllers/claimController.js';
// import { protect } from '../middlewares/authMiddleware.js';
// import { authorize } from '../middlewares/roleMiddleware.js';

// const router = express.Router();

// router.route('/')
//   .get(protect, getClaims)
//   .post(protect, submitClaim);

// router.get('/:id', protect, getClaimById);
// router.put('/:id/review', protect, authorize('admin', 'moderator'), reviewClaim);
// router.put('/:id/status', protect, authorize('admin', 'moderator'), updateClaimStatus);

// export default router;
