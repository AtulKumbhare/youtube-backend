import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({ path: './.env' });

connectDB()
	.then(() => {
		app.listen(process.env.PORT || 8000, () => {
			console.log(`App is listening on port ${process.env.PORT}`);
		});
		app.on('error', error => {
			console.error('Express app failed', error);
		});
	})
	.catch(err => {
		console.error('MongoDB Connection Failed!!!', err);
	});
