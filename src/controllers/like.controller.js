import mongoose from 'mongoose';
import { Like } from '../modals/like.modal.js';
import { Video } from '../modals/video.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { populate } from 'dotenv';

export const toggleVideoLike = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	if (!videoId) {
		throw new ApiError(400, 'videoId required');
	}
	const isAlreadyLiked = await Like.findOne({
		video: videoId,
		likedBy: req.user._id,
	});
	let video;
	if (isAlreadyLiked) {
		video = await Like.deleteOne({
			video: videoId,
		});
	} else {
		video = await Like.create({
			video: videoId,
			likedBy: req.user?._id,
		});
	}

	// await Video.aggregate([
	// 	{
	// 		$lookup: {
	// 			from: 'likes',
	// 			localField: '_id',
	// 			foreignField: 'video',
	// 			as: 'LikedBy',
	// 		},
	// 	},
	// 	{
	// 		$addFields: {
	// 			totalLikes: {
	// 				$sum: 1,
	// 			},
	// 		},
	// 	},
	// ]);

	if (!video) {
		throw new ApiError(400, 'Video not found required');
	}

	res
		.status(isAlreadyLiked ? 200 : 201)
		.json(
			new ApiResponse(
				isAlreadyLiked ? 200 : 201,
				video,
				`Video ${isAlreadyLiked ? 'disliked' : 'liked'}`
			)
		);
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
	const { commentId } = req.params;
	if (!commentId) {
		throw new ApiError(400, 'commentId required');
	}

	const isCommentAlreadyLiked = await Like.findOne({
		comment: commentId,
		likedBy: req.user._id,
	});
	let comment;
	if (isCommentAlreadyLiked) {
		comment = await Like.deleteOne({ comment: commentId });
	} else {
		comment = await Like.create({ comment: commentId, likedBy: req.user?._id });
	}

	await Comment.aggregate([{}]);

	if (!comment) {
		throw new ApiError(400, 'comment not found');
	}

	res
		.status(isCommentAlreadyLiked ? 200 : 201)
		.json(
			new ApiResponse(
				isCommentAlreadyLiked ? 200 : 201,
				comment,
				`Comment ${isCommentAlreadyLiked ? 'disliked' : 'liked'}`
			)
		);
});

export const toggleTweetLike = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;
	if (!tweetId) {
		throw new ApiError(400, 'tweetId required');
	}

	const isTweetAlreadyLiked = await Like.findOne({
		tweet: tweetId,
		likedBy: req.user._id,
	});
	let tweet;
	if (isTweetAlreadyLiked) {
		tweet = await Like.deleteOne({ tweet: tweetId });
	} else {
		tweet = await Like.create({ tweet: tweetId, likedBy: req.user?._id });
	}

	if (!tweet) {
		throw new ApiError(400, 'tweet not found');
	}

	res
		.status(isTweetAlreadyLiked ? 200 : 201)
		.json(
			new ApiResponse(
				isTweetAlreadyLiked ? 200 : 201,
				tweet,
				`Tweet ${isTweetAlreadyLiked ? 'disliked' : 'liked'}`
			)
		);
});

export const getLikedVideos = asyncHandler(async (req, res) => {
	const likedVideos = await Like.find({
		likedBy: req.user._id,
		video: { $ne: null },
	})
		.populate({
			path: `video`,
			populate: {
				path: 'owner',
				select: '-password -refreshToken',
			},
		})
		.populate({
			path: 'comment',
		})
		.populate({
			path: 'tweet',
		})
		.select('video -_id')
		.exec();

	if (!likedVideos) {
		throw new ApiErrors(404, 'Liked videos not found');
	}

	res
		.status(200)
		.json(
			new ApiResponse(200, likedVideos, 'Liked videos fetched successfully')
		);
});
