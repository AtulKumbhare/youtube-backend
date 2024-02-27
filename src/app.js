import express from 'express';
import cors from 'cors';

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
); // To allow the cross origin requests
app.use(express.json({ limit: '16kb' })); // To accept json data in express app
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // To accept data in request url
app.use(express.static('public')); // To serve the static assets from public folder

export { app };
