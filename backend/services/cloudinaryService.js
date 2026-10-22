const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Save file locally as fallback when Cloudinary fails or is unconfigured
 */
const saveFileLocally = (fileBuffer, folder = 'invoices') => {
    try {
        const ext = 'jpg';
        const fileName = `${Date.now()}-${uuidv4()}.${ext}`;
        const targetPath = path.join(uploadsDir, fileName);
        fs.writeFileSync(targetPath, fileBuffer);
        const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fileUrl = `${serverUrl}/uploads/${fileName}`;
        console.log(`[Upload Fallback] Saved file locally: ${fileUrl}`);
        return { url: fileUrl, public_id: fileName };
    } catch (err) {
        console.error('Failed local file save fallback:', err);
        throw err;
    }
};

/**
 * Upload a file buffer to Cloudinary with automatic local disk fallback
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} folder - Cloudinary folder (e.g. 'loan-verification/invoices')
 * @param {string} resourceType - 'image' | 'raw' | 'auto'
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'image') => {
    // If credentials are placeholders, bypass Cloudinary immediately and save locally
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_KEY === '123456789' || process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
        console.log('[Upload] Demo Cloudinary keys detected. Using local storage fallback.');
        return Promise.resolve(saveFileLocally(fileBuffer, folder));
    }

    return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) {
                    console.warn(`[Cloudinary Warning] ${error.message}. Falling back to local storage.`);
                    return resolve(saveFileLocally(fileBuffer, folder));
                }
                resolve({ url: result.secure_url, public_id: result.public_id });
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete an asset by public_id
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        if (fs.existsSync(path.join(uploadsDir, publicId))) {
            fs.unlinkSync(path.join(uploadsDir, publicId));
            return { result: 'ok' };
        }
        return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
        console.warn('Delete warning:', err.message);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
