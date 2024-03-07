import { User } from '../modals/user.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = async (req, _, next) => {
	try {
		const token =
			req.cookies?.accessToken ||
			req?.header('Authorization')?.replace('Bearer ', '');
		if (!token) {
			throw new ApiErrors(401, 'Unauthorized request');
		}

		const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		const user = await User.findById(decodedToken?._id).select(
			'-password -refreshToken'
		);

		if (!user) {
			throw new ApiErrors(401, 'Invalid access token');
		}

		req.user = user;
		next();
	} catch (error) {
		throw new ApiErrors(401, error?.message || 'Invalid access token');
	}
};
