import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { User } from '../modals/user.modal.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async user => {
	try {
		const accessToken = await user.generateAccessToken();
		const refreshToken = await user.generateRefreshToken();
		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });
		return {
			accessToken,
			refreshToken,
		};
	} catch (error) {
		throw new ApiErrors(
			500,
			'Something went wrong while generate accessToken and refreshToken'
		);
	}
};

export const registerUser = asyncHandler(async (req, res, next) => {
	//1. Take data from the frontend req -- Done
	//2. validate the data for empty fields -- Done
	//3. check if the user is already registered -- Done
	//4. check images avatar and cover image and validate avatar image
	//5. upload images to cloudinary
	//6. create user object and store in db
	//7. remove password and refresh token from the response
	//8. check if user is created
	//9. return the response

	const { username, email, fullName, password } = req.body;

	if (
		[username, email, fullName, password].some(field => field.trim() === '')
	) {
		throw new ApiErrors(400, 'All the fields are required');
	}

	const existingUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existingUser) {
		throw new ApiErrors(
			409,
			'User with same email or username already registered'
		);
	}

	const avatarImageLocalPath = req?.files?.avatar?.[0]?.path;
	const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;
	if (!avatarImageLocalPath) {
		throw new ApiErrors(400, 'avatar image is required');
	}
	const cloudinaryAvatarImageData =
		await uploadOnCloudinary(avatarImageLocalPath);
	const cloudinaryCoverImageData =
		await uploadOnCloudinary(coverImageLocalPath);
	if (!cloudinaryAvatarImageData) {
		throw new ApiErrors(400, 'avatar image is required');
	}

	const user = await User.create({
		username,
		email,
		fullName,
		password,
		avatar: cloudinaryAvatarImageData?.url,
		coverImage: cloudinaryCoverImageData?.url,
	});

	const createdUser = await User.findById(user?._id).select(
		'-password -refreshToken'
	);
	if (!createdUser) {
		throw new ApiErrors(500, 'Something went wrong while registering the user');
	}
	res
		.status(201)
		.json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

export const loginUser = asyncHandler(async (req, res) => {
	//1. req.body -> data
	//2. validate fields
	//3. check if user exists
	//4. check if password matches
	//5. generate jwt token and refresh token and store in db
	//6. send in cookies

	const { email, username, password } = req.body;

	if (!email || !username) {
		throw new ApiErrors(400, 'Email or Username is required');
	}

	const user = await User.findOne({
		$or: [{ email }, { username }],
	});

	if (!user) {
		throw new ApiErrors(404, 'User does not exists');
	}

	const isPasswordCorrect = await user.isPasswordCorrect(password);
	if (!isPasswordCorrect) {
		throw new ApiErrors(401, 'Invalid user credentials');
	}
	const { accessToken, refreshToken } =
		await generateAccessAndRefreshToken(user);
	const cookieOptions = {
		httpOnly: true,
		// secure: true,
		secure: false,
	};
	const data = user.toObject();
	delete data.password;
	delete data.refreshToken;
	return res
		.status(200)
		.cookie('accessToken', accessToken, cookieOptions)
		.cookie('refreshToken', refreshToken, cookieOptions)
		.json(
			new ApiResponse(
				200,
				{ data, accessToken, refreshToken },
				'User logged in successfully'
			)
		);
});

export const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req?.user?._id,
		{
			$unset: { refreshToken: 1 },
		},
		{ new: true }
	);
	const cookieOptions = {
		httpOnly: true,
		// secure: true,
		secure: false,
	};
	res
		.status(200)
		.clearCookie('accessToken', cookieOptions)
		.clearCookie('refreshToken', cookieOptions)
		.json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies?.refreshToken ||
		req.header('Authorization') ||
		req?.body?.refreshToken;
	if (!incomingRefreshToken) {
		throw new ApiErrors(401, 'Unauthorized request');
	}
	const decodedToken = jwt.verify(
		incomingRefreshToken,
		process.env.REFRESH_TOKEN_SECRET
	);
	const user = await User.findById(decodedToken?._id);
	if (!user) {
		throw new ApiErrors(401, 'Invalid access token');
	}

	const { accessToken, refreshToken } =
		await generateAccessAndRefreshToken(user);

	const cookieOptions = {
		httpOnly: true,
		// secure: true,
		secure: false,
	};

	return res
		.status(200)
		.cookie('accessToken', accessToken, cookieOptions)
		.cookie('refreshToken', refreshToken, cookieOptions)
		.json(
			new ApiResponse(
				200,
				{ accessToken, refreshToken },
				'Access token refreshed'
			)
		);
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;

	const user = await User.findById(req?.user?._id);
	const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
	if (!isPasswordCorrect) {
		throw new ApiErrors(400, 'Incorrect password');
	}
	user.password = newPassword;
	await user.save({ validateBeforeSave: false });
	res
		.status(200)
		.json(new ApiResponse(200, {}, 'Password changed successfully'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
	res
		.status(200)
		.json(new ApiResponse(200, req.user, 'LoggedIn user fetched successfully'));
});

export const updateUserDetails = asyncHandler(async (req, res) => {
	const { fullName, username, email } = req.body;

	if ([fullName, username, email].every(field => field === '')) {
		throw new ApiErrors(400, 'At least one field is required');
	}
	const user = req.user;
	user.username = username || user.username;
	user.email = email || user.email;
	user.fullName = fullName || user.fullName;
	const updatedUser = await user.save({ validateBeforeSave: false });
	//You can use this code as well not much of a difference in operating time
	// const updatedUser = await User.findByIdAndUpdate(
	// 	user?._id,
	// 	{
	// 		$set: {
	// 			...(username ? { username } : {}),
	// 			...(email ? { email } : {}),
	// 			...(fullName ? { fullName } : {}),
	// 		},
	// 	},
	// 	{ new: true }
	// ).select('-password -refreshToken');
	res
		.status(200)
		.json(
			new ApiResponse(200, updatedUser, 'User details updated successfully')
		);
});

export const updateAvatarAndCoverImage = asyncHandler(async (req, res) => {
	const { avatar, coverImage } = req.files; // If we want to upload only one file then we use req.file and while injecting upload multer middleware we use upload.single which takes only single file object
	const avatarImageLocalPath = avatar?.[0]?.path;
	const coverImageLocalPath = coverImage?.[0]?.path;
	if (!avatarImageLocalPath && !coverImageLocalPath) {
		throw new ApiErrors(400, 'avatarImage or coverImage is required');
	}
	const avatarImageCloudinaryUrl = avatarImageLocalPath
		? (await uploadOnCloudinary(avatarImageLocalPath)).url
		: '';
	const coverImageCloudinaryUrl = coverImageLocalPath
		? (await uploadOnCloudinary(coverImageLocalPath)).url
		: '';
	if (!avatarImageCloudinaryUrl && !coverImageCloudinaryUrl) {
		throw new ApiErrors(500, 'Something went wrong while uploading images');
	}
	req.user.avatarImage = avatarImageCloudinaryUrl || req.user.avatarImage;
	req.user.coverImage = coverImageCloudinaryUrl || req.user.coverImage;
	const updatedUser = await req.user.save({ validateBeforeSave: false });
	res
		.status(200)
		.json(new ApiResponse(200, updatedUser, 'Images uploaded successfully'));
});

export const deleteUser = asyncHandler(async (req, res) => {
	await User.findByIdAndDelete(req?.user?._id);
	res.status(200).json(new ApiResponse(200, {}, 'User deleted successfully'));
});
