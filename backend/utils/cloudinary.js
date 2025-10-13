import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image', 'video', 'raw', 'auto'
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (filePath, folder = 'posts', resourceType = 'auto') => {
  try {
    const options = {
      folder: folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true
    };

    // Add specific options for images
    if (resourceType === 'image' || resourceType === 'auto') {
      options.transformation = [
        { quality: 'auto', fetch_format: 'auto' }
      ];
    }

    const result = await cloudinary.uploader.upload(filePath, options);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file paths
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image', 'video', 'raw', 'auto'
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleToCloudinary = async (files, folder = 'posts', resourceType = 'auto') => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file, folder, resourceType)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload files to Cloudinary');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicIdOrUrl - Public ID or full URL of the resource
 * @param {string} resourceType - 'image', 'video', 'raw'
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicIdOrUrl, resourceType = 'image') => {
  try {
    let publicId = publicIdOrUrl;

    // Extract public_id from URL if full URL is provided
    if (publicIdOrUrl.includes('cloudinary.com')) {
      const urlParts = publicIdOrUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1) {
        // Get everything after 'upload' and version (vXXXXXXXXXX)
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));
      }
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} publicIdsOrUrls - Array of public IDs or URLs
 * @param {string} resourceType - 'image', 'video', 'raw'
 * @returns {Promise<Array>} Array of deletion results
 */
export const deleteMultipleFromCloudinary = async (publicIdsOrUrls, resourceType = 'image') => {
  try {
    const deletePromises = publicIdsOrUrls.map(id => 
      deleteFromCloudinary(id, resourceType)
    );
    
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Multiple delete error:', error);
    throw new Error('Failed to delete files from Cloudinary');
  }
};

/**
 * Get optimized image URL
 * @param {string} url - Original image URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');
  
  // Insert transformation into URL
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Generate thumbnail URL
 * @param {string} url - Original image URL
 * @param {number} size - Thumbnail size (width and height)
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (url, size = 150) => {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    quality: 'auto',
    format: 'auto',
    crop: 'thumb'
  });
};

export default {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getOptimizedImageUrl,
  getThumbnailUrl
};