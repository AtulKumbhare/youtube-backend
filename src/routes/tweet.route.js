import { Router } from 'express';
import { createTweet, deleteTweet, getAllTweets, getUserTweets, updateTweet } from '../controllers/tweet.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);
router.route('/create').post(createTweet);
router.route('/getAllTweets').get(getAllTweets);
router.route('/user/:userId').get(getUserTweets);
router.route('/update').patch(updateTweet)
router.route('/delete/:tweetId').delete(deleteTweet);

export default router;
