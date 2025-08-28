
// import  { Manufacturer }  from "../models/manufacturer.js";
// import AppError from "../utils/appError.js";
// import catchAsync from "../utils/catchAsync.js";
// import mongoose from "mongoose";
// import { User } from '../models/Users.js'; 
// import dotenv from 'dotenv';
// dotenv.config()

// const manufacturerController = {
//   registerManufacturer: catchAsync(async (req, res, next) => {
//     if (!req.user) {
//       return next(new AppError("User not authenticated", 401));
//     }
  
//     const { 
//       businessName, registrationNumber, businessType, yearEstablished,
//       streetAddress, city, state, postalCode, country,
//       contactPerson, email, phone 
//     } = req.body;
  
//     console.log("Registering manufacturer:", req.body);
//     console.log("Request User:", req.user);
    
//     if (![businessName, registrationNumber, businessType, yearEstablished, streetAddress, city, state, postalCode, country, contactPerson, email, phone].every(Boolean)) {
//       return next(new AppError("All fields are required", 400));
//     }
  
//     const user = req.user;
  
//     if (user.isManufacturer) {
//       return next(new AppError("User is already registered as a manufacturer", 400));
//     }
  
//     // Check if manufacturer with same email exists
//     const existingManufacturer = await Manufacturer.findOne({ "contact.email": email });
//     if (existingManufacturer) {
//       return next(new AppError("A manufacturer with this email already exists", 400));
//     }
  
//     const session = await mongoose.startSession();
//     session.startTransaction();
  
//     try {
//       const documents = {
//         businessLicense: req.files?.businessLicense?.[0] ? {
//           filename: req.files.businessLicense[0].filename,
//           path: req.files.businessLicense[0].path
//         } : undefined,
//         taxCertificate: req.files?.taxCertificate?.[0] ? {
//           filename: req.files.taxCertificate[0].filename,
//           path: req.files.taxCertificate[0].path
//         } : undefined,
//         qualityCertifications: req.files?.qualityCertifications ? req.files.qualityCertifications.map(file => ({
//           filename: file.filename,
//           path: file.path,
//           certificationType: "Additional Certification"
//         })) : []
//       };
  
//       const manufacturer = await Manufacturer.create([{
//         userId: user._id,
//         businessName,
//         registrationNumber,
//         businessType,
//         yearEstablished,
//         address: { streetAddress, city, state, postalCode, country },
//         contact: { contactPerson, email, phone },
//         documents,
//         status: "pending"
//       }], { session });
  
//       await User.findByIdAndUpdate(user._id, {
//         isManufacturer: true,
//         manufacturerProfile: manufacturer[0]._id
//       }, { session, new: true });
  
//       await session.commitTransaction();
  
//       res.status(201).json({
//         success: true,
//         message: "Manufacturer registered successfully",
//         data: {
//           manufacturer: manufacturer[0],
//           user: { id: user._id, email: user.email, isManufacturer: true }
//         }
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       session.endSession();
//     }
//   }),

//   getManufacturerById: catchAsync(async (req, res, next) => {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return next(new AppError("Invalid manufacturer ID", 400));
//     }

//     const manufacturer = await Manufacturer.findById(req.params.id).select(
//       "-__v"
//     );

//     if (!manufacturer) {
//       return next(new AppError("Manufacturer not found", 404));
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         manufacturer: {
//           id: manufacturer._id,
//           businessName: manufacturer.businessName,
//           registrationNumber: manufacturer.registrationNumber,
//           businessType: manufacturer.businessType,
//           yearEstablished: manufacturer.yearEstablished,
//           address: {
//             streetAddress: manufacturer.address.streetAddress,
//             city: manufacturer.address.city,
//             state: manufacturer.address.state,
//             postalCode: manufacturer.address.postalCode,
//             country: manufacturer.address.country,
//             fullAddress: manufacturer.fullAddress,
//           },
//           contact: {
//             contactPerson: manufacturer.contact.contactPerson,
//             email: manufacturer.contact.email,
//             phone: manufacturer.contact.phone,
//           },
//           documents: {
//             businessLicense: {
//               filename: manufacturer.documents.businessLicense.filename,
//               path: manufacturer.documents.businessLicense.path,
//               uploadDate: manufacturer.documents.businessLicense.uploadDate,
//             },
//             taxCertificate: {
//               filename: manufacturer.documents.taxCertificate.filename,
//               path: manufacturer.documents.taxCertificate.path,
//               uploadDate: manufacturer.documents.taxCertificate.uploadDate,
//             },
//             qualityCertifications:
//               manufacturer.documents.qualityCertifications.map((cert) => ({
//                 filename: cert.filename,
//                 path: cert.path,
//                 certificationType: cert.certificationType,
//                 uploadDate: cert.uploadDate,
//               })),
//           },
//           status: manufacturer.status,
//           createdAt: manufacturer.createdAt,
//           updatedAt: manufacturer.updatedAt,
//         },
//       },
//     });
//   }),

// getAllManufacturers: catchAsync(async (req, res, next) => {
//   const { page = 1, limit = 10, search, status, sort = '-createdAt' } = req.query;
  
//   // Build query
//   const query = {};
  
//   if (search) {
//     query.$or = [
//       { businessName: { $regex: search, $options: 'i' } },
//       { registrationNumber: { $regex: search, $options: 'i' } },
//       { 'contact.email': { $regex: search, $options: 'i' } },
//       { 'contact.contactPerson': { $regex: search, $options: 'i' } }
//     ];
//   }

//   if (status && status !== 'all') {
//     query.status = status;
//   }

//   // Execute query with pagination
//   const skip = (parseInt(page) - 1) * parseInt(limit);
  
//   const [manufacturers, total] = await Promise.all([
//     Manufacturer
//       .find(query)
//       .sort(sort)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .select('-__v'),
//     Manufacturer.countDocuments(query)
//   ]);

//   res.status(200).json({
//     status: 'success',
//     results: manufacturers.length,
//     total,
//     data: {
//       manufacturers: manufacturers.map(m => ({
//         id: m._id,
//         businessName: m.businessName,
//         registrationNumber: m.registrationNumber,
//         businessType: m.businessType,
//         yearEstablished: m.yearEstablished,
//         address: {
//           streetAddress: m.address.streetAddress,
//           city: m.address.city,
//           state: m.address.state,
//           postalCode: m.address.postalCode,
//           country: m.address.country,
//           fullAddress: m.fullAddress
//         },
//         contact: {
//           contactPerson: m.contact.contactPerson,
//           email: m.contact.email,
//           phone: m.contact.phone
//         },
//         documents: {
//           businessLicense: {
//             filename: m.documents.businessLicense.filename,
//             path: m.documents.businessLicense.path,
//             uploadDate: m.documents.businessLicense.uploadDate
//           },
//           taxCertificate: {
//             filename: m.documents.taxCertificate.filename,
//             path: m.documents.taxCertificate.path,
//             uploadDate: m.documents.taxCertificate.uploadDate
//           },
//           qualityCertifications: m.documents.qualityCertifications.map(cert => ({
//             filename: cert.filename,
//             path: cert.path,
//             certificationType: cert.certificationType,
//             uploadDate: cert.uploadDate
//           }))
//         },
//         status: m.status,
//         createdAt: m.createdAt,
//         updatedAt: m.updatedAt
//       }))
//     }
//   });
// }),

// getManufacturerById: catchAsync(async (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return next(new AppError('Invalid manufacturer ID', 400));
//   }

//   const manufacturer = await Manufacturer.findById(req.params.id).select('-__v');

//   if (!manufacturer) {
//     return next(new AppError('Manufacturer not found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       manufacturer: {
//         id: manufacturer._id,
//         businessName: manufacturer.businessName,
//         registrationNumber: manufacturer.registrationNumber,
//         businessType: manufacturer.businessType,
//         yearEstablished: manufacturer.yearEstablished,
//         address: {
//           streetAddress: manufacturer.address.streetAddress,
//           city: manufacturer.address.city,
//           state: manufacturer.address.state,
//           postalCode: manufacturer.address.postalCode,
//           country: manufacturer.address.country,
//           fullAddress: manufacturer.fullAddress
//         },
//         contact: {
//           contactPerson: manufacturer.contact.contactPerson,
//           email: manufacturer.contact.email,
//           phone: manufacturer.contact.phone
//         },
//         documents: {
//           businessLicense: {
//             filename: manufacturer.documents.businessLicense.filename,
//             path: manufacturer.documents.businessLicense.path,
//             uploadDate: manufacturer.documents.businessLicense.uploadDate
//           },
//           taxCertificate: {
//             filename: manufacturer.documents.taxCertificate.filename,
//             path: manufacturer.documents.taxCertificate.path,
//             uploadDate: manufacturer.documents.taxCertificate.uploadDate
//           },
//           qualityCertifications: manufacturer.documents.qualityCertifications.map(cert => ({
//             filename: cert.filename,
//             path: cert.path,
//             certificationType: cert.certificationType,
//             uploadDate: cert.uploadDate
//           }))
//         },
//         status: manufacturer.status,
//         createdAt: manufacturer.createdAt,
//         updatedAt: manufacturer.updatedAt
//       }
//     }
//   });
// }),
// updateManufacturerById: catchAsync(async (req, res, next) => {
//   console.log('Updating manufacturer:', req.params.id);
  
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       throw new AppError('Invalid manufacturer ID', 400);
//     }

//     // Handle file upload
//     await uploadPromise(req, res);

//     const manufacturer = await Manufacturer.findById(req.params.id);
    
//     if (!manufacturer) {
//       throw new AppError('Manufacturer not found', 404);
//     }

//     // Validate year established if provided
//     if (req.body.yearEstablished) {
//       const currentYear = new Date().getFullYear();
//       const yearEstablished = parseInt(req.body.yearEstablished);
//       if (yearEstablished < 1800 || yearEstablished > currentYear) {
//         throw new AppError('Invalid year established', 400);
//       }
//     }

//     // Update basic information
//     const updateData = {
//       businessName: req.body.businessName || manufacturer.businessName,
//       businessType: req.body.businessType || manufacturer.businessType,
//       yearEstablished: req.body.yearEstablished || manufacturer.yearEstablished,
//       address: {
//         streetAddress: req.body.streetAddress || manufacturer.address.streetAddress,
//         city: req.body.city || manufacturer.address.city,
//         state: req.body.state || manufacturer.address.state,
//         postalCode: req.body.postalCode || manufacturer.address.postalCode,
//         country: req.body.country || manufacturer.address.country
//       },
//       contact: {
//         contactPerson: req.body.contactPerson || manufacturer.contact.contactPerson,
//         email: req.body.email || manufacturer.contact.email,
//         phone: req.body.phone || manufacturer.contact.phone
//       }
//     };

//     // Handle document updates
//     if (req.files) {
//       if (req.files.businessLicense) {
//         await deleteFile(manufacturer.documents.businessLicense.path);
//         updateData['documents.businessLicense'] = {
//           filename: req.files.businessLicense[0].filename,
//           path: req.files.businessLicense[0].path,
//           uploadDate: Date.now()
//         };
//       }

//       if (req.files.taxCertificate) {
//         await deleteFile(manufacturer.documents.taxCertificate.path);
//         updateData['documents.taxCertificate'] = {
//           filename: req.files.taxCertificate[0].filename,
//           path: req.files.taxCertificate[0].path,
//           uploadDate: Date.now()
//         };
//       }

//       if (req.files.qualityCertifications) {
//         for (const cert of manufacturer.documents.qualityCertifications || []) {
//           await deleteFile(cert.path);
//         }
//         updateData['documents.qualityCertifications'] = req.files.qualityCertifications.map(cert => ({
//           filename: cert.filename,
//           path: cert.path,
//           certificationType: req.body.certificationTypes?.[cert.fieldname] || 'general',
//           uploadDate: Date.now()
//         }));
//       }
//     }

//     const updatedManufacturer = await Manufacturer.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Manufacturer updated successfully',
//       data: {
//         manufacturer: updatedManufacturer
//       }
//     });

//   } catch (error) {
//     // Clean up uploaded files on error
//     if (req.files) {
//       Object.values(req.files).flat().forEach(file => {
//         deleteFile(file.path);
//       });
//     }
//     console.error('Error updating manufacturer:', error);
//     next(error);
//   }
// }),

// updateManufacturerStatus: catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   if (!['pending', 'approved', 'rejected'].includes(status)) {
//     throw new AppError('Invalid status value', 400);
//   }

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     throw new AppError('Invalid manufacturer ID', 400);
//   }

//   const manufacturer = await Manufacturer.findByIdAndUpdate(
//     id,
//     { status },
//     { new: true, runValidators: true }
//   );

//   if (!manufacturer) {
//     throw new AppError('Manufacturer not found', 404);
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       manufacturer: {
//         id: manufacturer._id,
//         businessName: manufacturer.businessName,
//         status: manufacturer.status,
//         email: manufacturer.contact.email,
//         registrationNumber: manufacturer.registrationNumber,
//         businessType: manufacturer.businessType,
//         createdAt: manufacturer.createdAt
//       }
//     }
//   });
// }),

// deleteManufacturer: catchAsync(async (req, res, next) => {
//   console.log('Deleting manufacturer:', req.params.id);
  
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       throw new AppError('Invalid manufacturer ID', 400);
//     }

//     const manufacturer = await Manufacturer.findById(req.params.id);

//     if (!manufacturer) {
//       throw new AppError('Manufacturer not found', 404);
//     }

//     // Delete associated files
//     await deleteFile(manufacturer.documents.businessLicense.path);
//     await deleteFile(manufacturer.documents.taxCertificate.path);
    
//     if (manufacturer.documents.qualityCertifications) {
//       for (const cert of manufacturer.documents.qualityCertifications) {
//         await deleteFile(cert.path);
//       }
//     }

//     // Delete manufacturer
//     await Manufacturer.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       success: true,
//       message: 'Manufacturer deleted successfully',
//       data: null
//     });
//   } catch (error) {
//     console.error('Error deleting manufacturer:', error);
//     next(error);
//   }
// }),

// getManufacturerStats: catchAsync(async (req, res, next) => {
//   console.log('Fetching manufacturer statistics...');
  
//   try {
//     const [stats, totalManufacturers, monthlyRegistrations] = await Promise.all([
//       Manufacturer.aggregate([
//         {
//           $group: {
//             _id: '$status',
//             count: { $sum: 1 },
//             averageYearEstablished: { $avg: '$yearEstablished' }
//           }
//         }
//       ]),
//       Manufacturer.countDocuments(),
//       Manufacturer.aggregate([
//         {
//           $group: {
//             _id: {
//               year: { $year: '$createdAt' },
//               month: { $month: '$createdAt' }
//             },
//             count: { $sum: 1 }
//           }
//         },
//         { $sort: { '_id.year': -1, '_id.month': -1 } },
//         { $limit: 12 }
//       ])
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalManufacturers,
//         statusStats: stats,
//         monthlyRegistrations
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching manufacturer statistics:', error);
//     next(error);
//   }
// })
// };

// // export default manufacturerController;