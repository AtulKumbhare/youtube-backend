import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { User } from '../modals/user.modal.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';

const generateAccessAndRefreshToken = user => {
	const accessToken = user.generateAccessToken();
	const refreshToken = user.generateRefreshToken();
	user.refreshToken = refreshToken;
	user.save({ validateBeforeSave: false });
	return {
		accessToken,
		refreshToken,
	};
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
	}).select('-password -refreshToken');

	if (!user) {
		throw new ApiErrors(404, 'User does not exists');
	}

	const isPasswordCorrect = await user.isPasswordCorrect(password);
	if (!isPasswordCorrect) {
		throw new ApiErrors(401, 'Invalid user credentials');
	}
	const { accessToken, refreshToken } = generateAccessAndRefreshToken(user);
	const cookieOptions = {
		httpOnly: true,
		secure: true,
	};
	return res
		.status(200)
		.cookie('accessToken', accessToken, cookieOptions)
		.cookie('refreshToken', refreshToken, cookieOptions)
		.json(
			new ApiResponse(
				200,
				{ user, accessToken, refreshToken },
				'User logged in successfully'
			)
		);
});

export const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req?.user?._id,
		{
			$set: { refreshToken: undefined },
		},
		{ new: true }
	);
	const cookieOptions = {
		httpOnly: true,
		secure: true,
	};
	res
		.status(200)
		.clearCookie('accessToken', cookieOptions)
		.clearCookie('refreshToken', cookieOptions)
		.json(new ApiResponse(200, {}, 'User logged out successfully'));
});
