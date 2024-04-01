import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../modals/video.modal.js';
import { Subscription } from '../modals/subscription.modal.js';
import { Like } from '../modals/like.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getChannelStats = asyncHandler(async (req, res) => {
	// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
	const { channelId } = req.params;

	if (!channelId) {
		throw new ApiErrors(400, 'channelId required');
	}
	if (!isValidObjectId(channelId)) {
		throw new ApiErrors(400, 'Invalid channelId');
	}

	const totalLikes = await Like.aggregate([
		{
			$match: {
				likedBy: new mongoose.Types.ObjectId(channelId),
			},
		},
		{
			$group: {
				_id: null,
				likedVideos: {
					$sum: {
						$cond: [{ $ifNull: ['$video', false] }, 1, 0],
					},
				},
				likedComments: {
					$sum: {
						$cond: [{ $ifNull: ['$comment', false] }, 1, 0],
					},
				},
				likedTweets: {
					$sum: {
						$cond: [{ $ifNull: ['$tweet', false] }, 1, 0],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				likedVideos: 1,
				likedComments: 1,
				likedTweets: 1,
			},
		},
	]);

	const totalVideoViews = await Video.aggregate([
		{
			$match: {
				owner: new mongoose.Types.ObjectId(channelId),
			},
		},
		{
			$group: {
				_id: null,
				totalViews: { $sum: '$views' },
			},
		},
		{
			$project: {
				_id: 0,
				totalViews: 1,
			},
		},
	]);

	const totalVideos = await Video.aggregate([
		{
			$match: {
				owner: new mongoose.Types.ObjectId(channelId),
			},
		},
		{
			$count: 'video',
		},
	]);

	const totalSubscribers = await Subscription.aggregate([
		{
			$match: {
				channel: new mongoose.Types.ObjectId(channelId),
			},
		},
		{
			$count: 'subscribers',
		},
	]);
	const responseObj = {
		...totalLikes[0],
		totalVideoViews: totalVideoViews[0]?.totalViews || 0,
		totalVideos: totalVideos[0]?.video || 0,
		totalSubscribers: totalSubscribers[0]?.subscribers || 0,
	};
	res.status(200).json(new ApiResponse(200, responseObj, 'Stats fetched successfully'));
});

export const getChannelVideos = asyncHandler(async (req, res) => {
	// TODO: Get all the videos uploaded by the channel
	const { channelId } = req.params;

	if (!channelId) {
		throw new ApiErrors(400, 'channelId required');
	}

	if (!isValidObjectId(channelId)) {
		throw new ApiErrors(400, 'Invalid channelId');
	}

	const videos = await Video.find({
		owner: new mongoose.Types.ObjectId(channelId),
	});

	if (!videos) {
		throw new ApiErrors(404, 'Videos not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, videos, 'Videos fetched successfully'));
});
