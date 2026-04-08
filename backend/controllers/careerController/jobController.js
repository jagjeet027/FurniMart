import Job from '../../models/career/job.js';
import Application from '../../models/career/careerApplication.js';

export const getAllJobs = async (req, res) => {
  try {
    const { department, location, experience, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Build search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (experience) {
      query.experience = experience;
    }
    
    // Fixed: Proper population and aggregation for application count
    const jobs = await Job.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'applications', // Collection name in MongoDB
          localField: '_id',
          foreignField: 'jobId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationsCount: { $size: '$applications' }
        }
      },
      {
        $sort: { urgency: -1, postedDate: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          applications: 0 // Remove applications array from response for performance
        }
      }
    ]);
    
    const totalJobs = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: parseInt(page),
      totalJobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Get single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id)
      .populate('postedBy', 'name email')
      .populate('applications');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (!job.isActive) {
      return res.status(410).json({ message: 'This job posting is no longer active' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job details', error: error.message });
  }
};

// Create new job (Admin only)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      type,
      salary,
      experience,
      urgency,
      description,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline,
      tags,
      remoteOptions
    } = req.body;
    
    const newJob = new Job({
      title,
      department,
      location,
      type,
      salary,
      experience,
      urgency,
      description,
      requirements,
      responsibilities,
      benefits,
      applicationDeadline,
      tags,
      remoteOptions,
      // postedBy: req.user.id // Assuming user is authenticated
    });
    
    const savedJob = await newJob.save();
    
    res.status(201).json({
      message: 'Job created successfully',
      job: savedJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job', error: error.message });
  }
};

// Update job (Admin only)
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { ...updateData, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

// Delete/Deactivate job (Admin only)
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting isActive to false
    const deletedJob = await Job.findByIdAndUpdate(
      id,
      { isActive: false, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({
      message: 'Job deactivated successfully',
      job: deletedJob
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// Get job statistics
export const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    
    const departmentStats = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const urgencyStats = await Job.aggregate([
      { $match: { isActive: true, urgency: { $ne: '' } } },
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);
    
    const locationStats = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalJobs,
      totalApplications,
      departmentStats,
      urgencyStats,
      locationStats
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Get departments for filter dropdown
export const getDepartments = async (req, res) => {
  try {
    const departments = await Job.distinct('department', { isActive: true });
    res.json(departments.sort());
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};
