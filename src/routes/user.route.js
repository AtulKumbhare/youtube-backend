import { Router } from 'express';
import {
	changeCurrentPassword,
	deleteUser,
	getCurrentUser,
	getUserChannelProfile,
	getWatchHistory,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	updateAvatarAndCoverImage,
	updateUserDetails,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
	upload.fields([
		{
			name: 'avatar',
			maxCount: 1,
		},
		{
			name: 'coverImage',
			maxCount: 1,
		},
	]),
	registerUser
);

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/changePassword').post(verifyJWT, changeCurrentPassword);
router.route('/getLoggedInUser').get(verifyJWT, getCurrentUser);
router.route('/updateUser').patch(verifyJWT, updateUserDetails);
router.route('/updateAvatarAndCoverImage').patch(
	verifyJWT,
	upload.fields([
		// we can use upload.single to upload only one image and while extracting in request we can use req.file
		{ name: 'avatar', maxCount: 1 },
		{ name: 'coverImage', maxCount: 1 },
	]),
	updateAvatarAndCoverImage
);
router.route('/deleteUser').post(verifyJWT, deleteUser);
router
	.route('/getUserChannelProfile/:username')
	.get(verifyJWT, getUserChannelProfile);
router.route('/getWatchHistory').get(verifyJWT, getWatchHistory);
export default router;
