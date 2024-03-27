import { Playlist } from '../modals/playlist.modal.js';
import { ApiErrors } from '../utils/apiErrors.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPlaylist = asyncHandler(async (req, res) => {
	const { name, description } = req.body;

	if (!name && !description) {
		throw new ApiErrors(400, 'name and description is required');
	}

	const playList = await Playlist.create({
		name,
		description,
		owner: req?.user?.id,
	});

	if (!playList) {
		throw new ApiErrors(400, 'Video not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, playList, 'Playlist created successfully'));

	//TODO: create playlist
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
	const { userId } = req.params;

	if (!userId) {
		throw new ApiErrors(400, 'userId is required');
	}

	const userPlaylists = await Playlist.find({ owner: userId }).populate('videos');

	if (!userPlaylists.length) {
		throw new ApiErrors(400, 'Playlist not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, userPlaylists, 'Playlist fetched successfully'));

	//TODO: get user playlists
});

export const getPlaylistById = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;

	if (!playlistId) {
		throw new ApiErrors(400, 'playlistId is required');
	}

	const playlist = await Playlist.findById(playlistId).populate('videos');

	if (!playlist) {
		throw new ApiErrors(400, 'Playlist not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, playlist, 'Playlist fetched successfully'));

	//TODO: get playlist by id
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req.params;

	if (!playlistId || !videoId) {
		throw new ApiErrors(400, 'playlistId and videoId is required');
	}

	const playlist = await Playlist.findByIdAndUpdate(
		playlistId,
		{
			$addToSet: {
				videos: videoId,
			},
		},
		{ new: true }
	);

	if (!playlist) {
		throw new ApiErrors(400, 'Playlist not found');
	}

	res
		.status(200)
		.json(
			new ApiResponse(200, playlist, 'Video added to playlist successfully')
		);
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
	const { playlistId, videoId } = req.params;

	if (!playlistId || !videoId) {
		throw new ApiErrors(400, 'playlistId and videoId is required');
	}

	const playlist = await Playlist.findByIdAndUpdate(
		playlistId,
		{
			$pull: {
				videos: videoId,
			},
		},
		{ new: true }
	);

	if (!playlist) {
		throw new ApiErrors(400, 'Playlist not found');
	}

	res
		.status(200)
		.json(
			new ApiResponse(200, playlist, 'Video removed from playlist successfully')
		);

	// TODO: remove video from playlist
});

export const deletePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;

	if (!playlistId) {
		throw new ApiErrors(400, 'playlistId is required');
	}

	const playlist = await Playlist.findByIdAndDelete(playlistId);

	if (!playlist) {
		throw new ApiErrors(400, 'Playlist not found');
	}

	res.json(new ApiResponse(200, [], 'Playlist deleted successfully'));
	// TODO: delete playlist
});

export const updatePlaylist = asyncHandler(async (req, res) => {
	const { playlistId } = req.params;
	const { name, description } = req.body;

	if (!playlistId) {
		throw new ApiErrors(400, 'playlistId is required');
	}

	if (!name && !description) {
		throw new ApiErrors(400, 'name and description are required');
	}

	const playlist = await Playlist.findByIdAndUpdate(playlistId, {
		name,
		description,
	});

	if (!playlist) {
		throw new ApiErrors(400, 'Playlist not found');
	}

	res
		.status(200)
		.json(new ApiResponse(200, playlist, 'Playlist updated successfully'));
	//TODO: update playlist
});
