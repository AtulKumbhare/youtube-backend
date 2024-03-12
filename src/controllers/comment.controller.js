import { Comment } from '../modals/comment.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createComment = asyncHandler(async (req, res) => {
	const { content, videoId } = req.body;
	if (!content && !videoId) {
		throw new ApiErrors(400, 'comment content and videoId is required');
	}

	const comment = await Comment.create({
		content,
		owner: req.user?._id,
		video: videoId,
	});

	if (!comment) {
		throw new ApiErrors(404, 'User or Video not found');
	}

	res
		.status(201)
		.json(new ApiResponse(201, comment, 'Comment created successfully'));
});

export const updateComment = asyncHandler(async (req, res) => {
	const { commentId, content } = req.body;
	if (!commentId && content) {
		throw new ApiErrors(404, 'CommentId and content are required');
	}

	const comment = await Comment.findByIdAndUpdate(
		commentId,
		{
			content,
		},
		{ new: true }
	);

	if (!comment) {
		throw new ApiErrors(404, 'Comment not found');
	}

	res
		.status(200)
		.json(new ApiResponse(201, comment, 'Comment updated successfully'));
});
export const deleteComment = asyncHandler(async (req, res) => {
	const { commentId } = req.params;

	if (!commentId) {
		throw new ApiErrors(400, 'commentId is required');
	}

	const comment = await Comment.findByIdAndDelete(commentId, { new: true });
	if (!comment) {
		throw new ApiErrors(404, 'Comment not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, [], 'Comment deleted successfully'));
});
export const getVideoComments = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	const { page = 1, limit = 10 } = req.query;

	if (!videoId) {
		throw new ApiErrors(400, 'videoId is required');
	}

	const comments = await Comment.find({ video: videoId }, null, {
		skip: (page - 1) * limit,
		limit,
	});
	if (!comments) {
		throw new ApiErrors(404, 'Comments not found');
	}
	res
		.status(200)
		.json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});
