import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
	addVideoToPlaylist,
	createPlaylist,
	deletePlaylist,
	getPlaylistById,
	getUserPlaylists,
	removeVideoFromPlaylist,
	updatePlaylist,
} from '../controllers/playlist.controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/create').post(createPlaylist);
router.route('/user/:userId').get(getUserPlaylists);
router.route('add/:playlistId/:videoId').post(addVideoToPlaylist);
router.route('remove/:playlistId/:videoId').post(removeVideoFromPlaylist);
router.route('/:playlistId').get(getPlaylistById).patch(updatePlaylist).delete(deletePlaylist);

export default router;
