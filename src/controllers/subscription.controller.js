import mongoose, { isValidObjectId } from 'mongoose';
import { Subscription } from '../modals/subscription.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const toggleSubscription = asyncHandler(async (req, res) => {
	const { channelId } = req.params;

	if (!channelId) {
		throw new ApiErrors(400, 'channelId required');
	}

	if (!isValidObjectId(channelId)) {
		throw new ApiErrors(400, 'Invalid channelId');
	}

	const channel = await Subscription.findOne({
		channel: channelId,
		subscriber: req?.user?._id,
	});

	let data;
	if (channel) {
		data = await Subscription.findOneAndDelete({
			channel: channelId,
			subscriber: req?.user?._id,
		});
	} else {
		data = await Subscription.create({
			subscriber: req.user?._id,
			channel: channelId,
		});
	}

	res
		.status(201)
		.json(
			new ApiResponse(
				201,
				data,
				`${channel ? 'Unsubscribed' : 'Subscribed'} successfully`
			)
		);
});

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
	const { channelId } = req.params;

	if (!channelId) {
		throw new ApiErrors(400, 'channelId required');
	}

	if (!isValidObjectId(channelId)) {
		throw new ApiErrors(400, 'Invalid channelId');
	}

	const subscribers = await Subscription.aggregate([
		{
			$match: {
				channel: new mongoose.Types.ObjectId(channelId),
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: 'subscriber',
				foreignField: '_id',
				as: 'subscribers',
			},
		},
		{
			$unwind: {
				path: '$subscribers',
			},
		},
		{
			$group: {
				_id: new mongoose.Types.ObjectId(channelId),
				subscribers: { $push: '$subscribers' },
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: '_id',
				foreignField: '_id',
				as: 'channelDetails',
			},
		},
		{
			$addFields: {
				channelDetails: {
					$first: '$channelDetails',
				},
			},
		},
		{
			$project: {
				_id: 1,
				'subscribers.username': 1,
				'subscribers.email': 1,
				'subscribers.fullName': 1,
				'subscribers.avatar': 1,
				'subscribers.coverImage': 1,
				'channelDetails.username': 1,
				'channelDetails.email': 1,
				'channelDetails.fullName': 1,
				'channelDetails.avatar': 1,
				'channelDetails.coverImage': 1,
			},
		},
	]);

	if (!subscribers) {
		throw new ApiErrors(404, 'Subscribers not found');
	}

	res
		.status(200)
		.json(
			new ApiResponse(200, subscribers?.[0], 'Subscribers fetched successfully')
		);
});

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
	// const channels = await Subscription.find({ subscriber: req.user?._id })
	// 	.populate('channel')
	// 	.select('channel -_id');
	const channels = await Subscription.aggregate([
		{
			$match: {
				subscriber: new mongoose.Types.ObjectId(req.user?._id),
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: 'channel',
				foreignField: '_id',
				as: 'channelsSubscribed',
			},
		},
		{
			$unwind: '$channelsSubscribed',
		},
		{
			$group: {
				_id: null,
				channelsSubscribed: { $push: '$channelsSubscribed' },
			},
		},
		{
			$project: {
				_id: 0,
				'channelsSubscribed.username': 1,
				'channelsSubscribed.email': 1,
				'channelsSubscribed.fullName': 1,
				'channelsSubscribed.avatar': 1,
				'channelsSubscribed.coverImage': 1,
			},
		},
	]);
	if (!channels) {
		throw new ApiErrors(404, 'Channels not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, channels?.[0], 'Channels fetched successfully'));
});
