const { v2: cloudinary } = require('cloudinary');

// Cloudinary official Node SDK docs:
// - Configuration: https://cloudinary.com/documentation/node_integration#configuration
// - Upload API (upload_stream): https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters
// - Deletion API: https://cloudinary.com/documentation/image_upload_api_reference#destroy

// Configure using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Destination folder in Cloudinary
 * @param {object} options - Additional Cloudinary options
 * @returns {Promise<object>} Cloudinary upload result
 */
function uploadFromBuffer(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = { folder, resource_type: 'auto', ...options };
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

/**
 * Delete an asset by public_id.
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<object>} Destroy API result
 */
async function deleteAsset(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

module.exports = {
  cloudinary,
  uploadFromBuffer,
  delete: deleteAsset
};


