import mongoose, { Schema, isValidObjectId } from 'mongoose';
import { Video } from '../modals/video.modal.js';
import { User } from '../modals/user.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const getAllVideos = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
	//TODO: get all videos based on query, sort, pagination

	const user = await User.findById(userId);

	if (!user) {
		throw new ApiErrors(404, 'User not found');
	}

	const aggregationResult = await Video.aggregate([
		{
			$match: {
				owner: new mongoose.Types.ObjectId(user?._id),
			},
		},
	]);
	const videos = await Video.aggregatePaginate(aggregationResult, {
		page,
		limit,
		sort: `${sortType === 'asc' ? '-' : ''}${sortBy}`,
	});

	res
		.status(200)
		.json(new ApiResponse(200, videos, 'Videos fetched successfully'));
});

export const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description } = req.body;
	const { videoFile, videoThumbnail } = req.files;
	if (!title && !description) {
		throw new ApiErrors(400, 'title and description are required');
	}

	const cloudinaryVideoLocalPath = videoFile?.[0]?.path;
	const cloudinaryThumbnailLocalPath = videoThumbnail?.[0]?.path;

	if (!cloudinaryVideoLocalPath && !cloudinaryThumbnailLocalPath) {
		throw new ApiErrors(404, 'videoFile or videoThumbnail file path mot found');
	}

	const cloudinaryVideoFileDetails = await uploadOnCloudinary(
		cloudinaryVideoLocalPath
	);
	const cloudinaryVideoThumbnailFileDetails = await uploadOnCloudinary(
		cloudinaryThumbnailLocalPath
	);

	if (!cloudinaryVideoFileDetails && !cloudinaryVideoThumbnailFileDetails) {
		throw new ApiErrors(500, 'Something went wrong while uploading files');
	}

	const video = await Video.create({
		title,
		description,
		duration: cloudinaryVideoFileDetails?.duration,
		videoFile: cloudinaryVideoFileDetails?.url,
		thumbnail: cloudinaryVideoThumbnailFileDetails?.url,
		owner: req.user?._id,
	});

	if (!video) {
		throw new ApiErrors(500, 'Something went wrong while publishing video');
	}
	res
		.status(201)
		.json(new ApiResponse(201, video, 'Video published successfully'));
});

export const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	//TODO: get video by id
	if (!videoId) {
		throw new ApiErrors(400, 'videoId is required');
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiErrors(400, 'Video not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, video, 'Video fetched successfully'));
});

export const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { title, description } = req.body;

	//TODO: update video details like title, description, thumbnail
	if (!videoId) {
		throw new ApiErrors(400, 'videoId is required');
	}

	if (!title && !description) {
		throw new ApiErrors(400, 'title and description are required');
	}

	const cloudinaryThumbnailDetails = await uploadOnCloudinary(req.file?.path);

	if (!cloudinaryThumbnailDetails) {
		throw new ApiErrors(500, 'Something went wrong while uploading thumbnail');
	}

	const video = await Video.findByIdAndUpdate(
		videoId,
		{
			title,
			description,
			thumbnail: cloudinaryThumbnailDetails?.url,
		},
		{ new: true }
	);

	if (!video) {
		throw new ApiErrors(500, 'Something went wrong while updating video');
	}
	res
		.status(200)
		.json(new ApiResponse(200, video, 'Video updated successfully'));
});

export const deleteVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!videoId) {
		throw new ApiErrors(400, 'videoId is required');
	}

	const video = await Video.findByIdAndDelete(videoId, { new: true });

	if (!video) {
		throw new ApiErrors(500, 'Video not found');
	}

	res.status(200).json(new ApiResponse(200, [], 'Video deleted successfully'));
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!videoId) {
		throw new ApiErrors(400, 'videoId is required');
	}

	const video = await Video.findById(videoId);

	const updatedVideo = await Video.findByIdAndUpdate(
		videoId,
		{
			isPublished: !video?.isPublished,
		},
		{ new: true }
	);

	if (!updatedVideo) {
		throw new ApiErrors(500, 'Video not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, updatedVideo, 'Video updated successfully'));
});

export const setVideoAsViewed = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!videoId) {
		throw new ApiErrors(400, 'videoId is required');
	}

	if (!isValidObjectId(videoId)) {
		throw new ApiErrors(400, 'Invalid videoId');
	}

	const video = await Video.findById(videoId);

	if (!video) {
		throw new ApiErrors(400, 'Video not found');
	}
	let updatedVideo;
	if (video?.owner !== req.user?._id) {
		const user = await User.findByIdAndUpdate(
			req.user?._id,
			{
				$addToSet: {
					watchHistory: videoId,
				},
			},
			{ new: true }
		);

		if(!user) {
			throw new ApiErrors(500, 'Something went wrong while updating watch history');
		}

		if (user?.watchHistory?.length === req.user?.watchHistory?.length) {
			return res
				.status(200)
				.json(new ApiResponse(200, {}, 'Video already viewed'));
		}

		updatedVideo = await Video.findByIdAndUpdate(
			videoId,
			{
				$set: {
					views: video.views + 1,
				},
			},
			{ new: true }
		);
	}

	res
		.status(200)
		.json(new ApiResponse(200, updatedVideo, 'Video views updated successfully'));
});
