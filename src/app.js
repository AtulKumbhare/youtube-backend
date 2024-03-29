import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
); // To allow the cross origin requests
app.use(express.json({ limit: '16kb' })); // To accept json data in express app
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // To accept data in request url
app.use(express.static('/public/temp')); // To serve the static assets from public folder
app.use(cookieParser()); //To work with cookies

//Router imports
import UserRouter from './routes/user.route.js';
import TweetRouter from './routes/tweet.route.js';
import CommentRouter from './routes/comment.route.js';
import VideoRouter from './routes/video.route.js';
import LikeRouter from './routes/like.route.js';
import PlaylistRoute from './routes/playlist.route.js';
import SubscriptionRoute from './routes/subscription.route.js';
import dashboardRoute from './routes/dashboard.route.js';

//Route Declaration
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/tweets', TweetRouter);
app.use('/api/v1/comments', CommentRouter);
app.use('/api/v1/videos', VideoRouter);
app.use('/api/v1/likes', LikeRouter);
app.use('/api/v1/playlist', PlaylistRoute);
app.use('/api/v1/subscription', SubscriptionRoute);
app.use('/api/v1/dashboard', dashboardRoute);

export { app };
