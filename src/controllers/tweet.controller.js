import { Tweet } from '../modals/tweet.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTweet = asyncHandler(async (req, res) => {
	const { content } = req.body;
	if (!content) {
		throw new ApiErrors(400, 'Tweet content required');
	}

	const tweet = await Tweet.create({
		content,
		owner: req.user?._id,
	});
	if (!tweet) {
		throw new ApiErrors(500, 'Something went wrong while creating tweet');
	}
	res
		.status(201)
		.json(new ApiResponse(201, tweet, 'Tweet created successfully'));
});

export const updateTweet = asyncHandler(async (req, res) => {
	const { id, content } = req.body;

	if (!id && !content) {
		throw new ApiErrors(400, 'Tweet id and content is required');
	}

	const tweet = await Tweet.findByIdAndUpdate(
		id,
		{
			content,
		},
		{ new: true }
	);

	if (!tweet) {
		throw new ApiErrors(400, 'Tweet not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, tweet, 'Tweet updated successfully'));
});

export const deleteTweet = asyncHandler(async (req, res) => {
	const { tweetId } = req.params;

	const tweet = await Tweet.findByIdAndDelete(tweetId, { new: true });

	if (!tweet) {
		throw new ApiErrors(400, 'Tweet not found');
	}

	res.status(200).json(new ApiResponse(200, [], 'Tweet deleted successfully'));
});

export const getUserTweets = asyncHandler(async (req, res) => {
	const tweet = await Tweet.find({ owner: req.user?._id });

	if (!tweet) {
		throw new ApiErrors(400, 'Tweet not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, tweet, 'Tweet fetched successfully'));
});

export const getAllTweets = asyncHandler(async (req, res) => {
	const tweets = await Tweet.find({});
	if (!tweets) {
		throw new ApiErrors(404, 'Tweets not found');
	}
	res
		.status(200)
		.json(new ApiResponse(200, tweets, 'Tweets fetched successfully'));
});
