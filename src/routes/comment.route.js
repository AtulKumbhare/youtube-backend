import { Router } from 'express';
import {
	createComment,
	deleteComment,
	getVideoComments,
	updateComment,
} from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/create').post(createComment);
router.route('/update').patch(updateComment);
router.route('/delete/:commentId').delete(deleteComment);
router.route('/video/:videoId').get(getVideoComments);

export default router;
