import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async localFilePath => {
	try {
		if (!localFilePath) return null; // If file path not find on server then stop execution
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: 'auto',
		}); // Upload file to cloudinary
		console.log('File uploaded successfully', response.url);
		fs.unlinkSync(localFilePath);
		return response;
	} catch (error) {
		fs.unlinkSync(localFilePath);
		return null;
	}
};