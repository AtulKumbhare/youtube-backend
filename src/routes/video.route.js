import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
	deleteVideo,
	getAllVideos,
	getVideoById,
	publishAVideo,
	setVideoAsViewed,
	updateVideo,
} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/publish').post(
	upload.fields([
		{
			name: 'videoFile',
			maxCount: 1,
		},
		{
			name: 'videoThumbnail',
			maxCount: 1,
		},
	]),
	publishAVideo
);
router
	.route('/update/:videoId')
	.patch(upload.single('videoThumbnail'), updateVideo);
router.route('/').get(getAllVideos);
router
	.route('/:videoId')
	.get(getVideoById)
	.patch(setVideoAsViewed)
	.delete(deleteVideo);

export default router;
