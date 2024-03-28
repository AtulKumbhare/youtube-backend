import { isValidObjectId } from 'mongoose';
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

	const channel = await Subscription.findOneAndDelete(
		{ channel: channelId },
		{ new: true }
	);

	let data;
	if (channel) {
		data = await Subscription.findByIdAndDelete(channelId);
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

	const subscribers = await Subscription.find({ channel: channelId });

	if (!subscribers) {
		throw new ApiErrors(404, 'Subscribers not found');
	}

	res
		.status(200)
		.json(
			new ApiResponse(200, subscribers, 'Subscribers fetched successfully')
		);
});

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
	const { subscriberId } = req.params;

	if (!subscriberId) {
		throw new ApiErrors(400, 'subscriberId required');
	}

	if (!isValidObjectId(subscriberId)) {
		throw new ApiErrors(400, 'Invalid subscriberId');
	}

	const channels = await Subscription.find({ subscriber: subscriberId });

	if (!channels) {
		throw new ApiErrors(404, 'Channels not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, channels, 'Channels fetched successfully'));
});
