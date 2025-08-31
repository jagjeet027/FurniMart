import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Organization from '../../models/career/organization.js';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  addCandidate,
  updateCandidate,
  removeCandidate,
  getCandidatesByOrganization,
  getDashboardStats
} from '../../controllers/careerController/organizationController.js';
// import { validateOrganization, validateCandidate } from '../../middleware/validation.js';

const router = express.Router();

// Get current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Dashboard statistics route
router.get('/dashboard/stats', getDashboardStats);

// Organization CRUD routes
router.get('/', getAllOrganizations);
router.get('/:id', getOrganizationById);
router.post('/', upload.single('logo'),  createOrganization);
router.put('/:id', upload.single('logo'),  updateOrganization);
router.delete('/:id', deleteOrganization);

// Candidate routes
router.get('/:id/candidates', getCandidatesByOrganization);
router.post('/:id/candidates', addCandidate);
router.put('/:id/candidates/:candidateId', updateCandidate);
router.delete('/:id/candidates/:candidateId', removeCandidate);
// Bulk operations
router.post('/:id/candidates/bulk', async (req, res) => {
  try {
    const { id } = req.params;
    const { candidates } = req.body;

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Candidates array is required and cannot be empty'
      });
    }

    const organization = await Organization.findById(id);
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    // Process each candidate
    for (let i = 0; i < candidates.length; i++) {
      try {
        await organization.addCandidate(candidates[i]);
        results.success.push({
          index: i,
          candidate: candidates[i]
        });
      } catch (error) {
        results.failed.push({
          index: i,
          candidate: candidates[i],
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk operation completed. ${results.success.length} candidates added, ${results.failed.length} failed.`,
      results
    });

  } catch (error) {
    console.error('Bulk add candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk candidate addition'
    });
  }
});

// Export candidates
router.get('/:id/candidates/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;

    const organization = await Organization.findById(id);
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const candidates = organization.candidates;

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Name,Roll No,Email,Phone,Branch,Specialization,Year,CGPA,Skills\n';
      const csvData = candidates.map(candidate => {
        const skills = candidate.skills.join(';');
        return `"${candidate.name}","${candidate.rollNo}","${candidate.email || ''}","${candidate.phone || ''}","${candidate.branch}","${candidate.specialization || ''}","${candidate.year || ''}","${candidate.cgpa || ''}","${skills}"`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${organization.name}-candidates.csv"`);
      res.send(csvHeader + csvData);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          organization: {
            name: organization.name,
            type: organization.type,
            location: organization.location
          },
          candidates,
          exportedAt: new Date().toISOString(),
          totalCandidates: candidates.length
        }
      });
    }
  } catch (error) {
    console.error('Export candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export candidates'
    });
  }
});

// Search candidates across all organizations
router.get('/search/candidates', async (req, res) => {
  try {
    const { query, branch, year, cgpaMin, cgpaMax, skills, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }

    const matchStage = {
      isActive: true
    };

    const pipeline = [
      { $match: matchStage },
      { $unwind: '$candidates' }
    ];

    // Build candidate filter
    const candidateFilter = {};

    if (query) {
      candidateFilter.$or = [
        { 'candidates.name': { $regex: query, $options: 'i' } },
        { 'candidates.rollNo': { $regex: query, $options: 'i' } },
        { 'candidates.email': { $regex: query, $options: 'i' } }
      ];
    }

    if (branch) {
      candidateFilter['candidates.branch'] = branch;
    }

    if (year) {
      candidateFilter['candidates.year'] = year;
    }

    if (cgpaMin || cgpaMax) {
      candidateFilter['candidates.cgpa'] = {};
      if (cgpaMin) candidateFilter['candidates.cgpa'].$gte = parseFloat(cgpaMin);
      if (cgpaMax) candidateFilter['candidates.cgpa'].$lte = parseFloat(cgpaMax);
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      candidateFilter['candidates.skills'] = { $in: skillsArray };
    }

    if (Object.keys(candidateFilter).length > 0) {
      pipeline.push({ $match: candidateFilter });
    }

    pipeline.push(
      {
        $project: {
          candidate: '$candidates',
          organization: {
            id: '$_id',
            name: '$name',
            type: '$type',
            location: '$location'
          }
        }
      },
      { $limit: parseInt(limit) }
    );

    const results = await Organization.aggregate(pipeline);

    res.json({
      success: true,
      data: results,
      query: {
        searchTerm: query,
        filters: { branch, year, cgpaMin, cgpaMax, skills },
        totalResults: results.length
      }
    });
  } catch (error) {
    console.error('Search candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search candidates'
    });
  }
});

export default router;