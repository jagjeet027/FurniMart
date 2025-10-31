// import { Claim, Policy as PolicyModel } from '../models/Policy.js';
// import { asyncHandler } from '../middlewares/errorMiddleware.js';
// import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHandler.js';
// import { sendEmail, emailTemplates } from '../utils/emailSender.js';
// import logger from '../utils/logger.js';

// export const submitClaim = asyncHandler(async (req, res) => {
//   const { policyId, description, claimAmount, currency } = req.body;

//   if (!policyId || !description || !claimAmount) {
//     return errorResponse(res, 'Please provide all required fields', 400);
//   }

//   const policy = await PolicyModel.findById(policyId).populate('companyId');
//   if (!policy) return errorResponse(res, 'Policy not found', 404);

//   if (policy.userId.toString() !== req.user._id.toString()) {
//     return errorResponse(res, 'Unauthorized to file claim on this policy', 403);
//   }

//   if (policy.status !== 'active') {
//     return errorResponse(res, 'Policy is not active', 400);
//   }

//   if (claimAmount > policy.coverageAmount) {
//     return errorResponse(res, 'Claim amount exceeds policy coverage', 400);
//   }

//   const claim = await Claim.create({
//     policyId,
//     filedBy: req.user._id,
//     description,
//     claimAmount,
//     currency: currency || policy.currency,
//     status: 'submitted'
//   });

//   await claim.addAudit('Claim submitted', req.user._id, 'Initial claim submission');

//   await sendEmail(
//     req.user.email,
//     'Claim Submitted Successfully',
//     emailTemplates.claimFiled(claim.claimNumber, policy.policyNumber, `${claim.claimAmount}`)
//   );

//   logger.info(`Claim submitted: ${claim.claimNumber}`);
//   successResponse(res, claim, 'Claim submitted successfully', 201);
// });

// export const getClaims = asyncHandler(async (req, res) => {
//   const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

//   const query = req.user.role !== 'admin' ? { filedBy: req.user._id } : {};
//   if (status) query.status = status;

//   const claims = await Claim.find(query)
//     .populate('policyId')
//     .populate('filedBy', 'username email')
//     .populate('reviewedBy', 'username email')
//     .sort(sort)
//     .limit(limit * 1)
//     .skip((page - 1) * limit);

//   const count = await Claim.countDocuments(query);

//   paginatedResponse(res, claims, page, limit, count, 'Claims retrieved successfully');
// });

// export const getClaimById = asyncHandler(async (req, res) => {
//   const claim = await Claim.findById(req.params.id)
//     .populate('policyId')
//     .populate('filedBy', 'username email')
//     .populate('reviewedBy', 'username email')
//     .populate('audit.performedBy', 'username');

//   if (!claim) return errorResponse(res, 'Claim not found', 404);

//   if (req.user.role !== 'admin' && claim.filedBy._id.toString() !== req.user._id.toString()) {
//     return errorResponse(res, 'Unauthorized to view this claim', 403);
//   }

//   successResponse(res, claim, 'Claim retrieved successfully');
// });

// export const reviewClaim = asyncHandler(async (req, res) => {
//   const { status, resolutionNotes, paidAmount } = req.body;

//   if (!status || !['approved', 'rejected'].includes(status)) {
//     return errorResponse(res, 'Valid status (approved/rejected) is required', 400);
//   }

//   const claim = await Claim.findById(req.params.id)
//     .populate('policyId')
//     .populate('filedBy', 'username email');

//   if (!claim) return errorResponse(res, 'Claim not found', 404);

//   if (claim.status !== 'submitted' && claim.status !== 'under_review') {
//     return errorResponse(res, 'Claim has already been reviewed', 400);
//   }

//   claim.status = status;
//   claim.resolutionNotes = resolutionNotes || '';
//   claim.reviewedBy = req.user._id;
//   claim.reviewedAt = new Date();

//   if (status === 'approved' && paidAmount) {
//     claim.paidAmount = paidAmount;
//     claim.paidAt = new Date();
//     claim.status = 'paid';
//   }

//   await claim.save();

//   await claim.addAudit(
//     `Claim ${status}`,
//     req.user._id,
//     resolutionNotes || `Claim ${status}`
//   );

//   if (status === 'approved') {
//     const policy = await PolicyModel.findById(claim.policyId);
//     policy.status = 'claimed';
//     await policy.save();
//   }

//   await sendEmail(
//     claim.filedBy.email,
//     `Claim ${status.charAt(0).toUpperCase() + status.slice(1)}`,
//     emailTemplates.claimDecision(claim.claimNumber, status, resolutionNotes, paidAmount ? `${paidAmount}` : null)
//   );

//   logger.info(`Claim ${status}: ${claim.claimNumber}`);
//   successResponse(res, claim, `Claim ${status} successfully`);
// });

// export const updateClaimStatus = asyncHandler(async (req, res) => {
//   const { status, notes } = req.body;

//   const claim = await Claim.findById(req.params.id);

//   if (!claim) return errorResponse(res, 'Claim not found', 404);

//   const oldStatus = claim.status;
//   claim.status = status;
//   await claim.save();

//   await claim.addAudit(
//     `Status changed from ${oldStatus} to ${status}`,
//     req.user._id,
//     notes || ''
//   );

//   logger.info(`Claim status updated: ${claim.claimNumber} from ${oldStatus} to ${status}`);

//   successResponse(res, claim, 'Claim status updated successfully');
// });