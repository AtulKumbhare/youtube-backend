import { Schema, model, Types } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		duration: {
			type: Number,
			required: true,
			trim: true,
		},
		views: {
			type: Number,
			default: 0,
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		videoFile: {
			type: String,
		},
		thumbnail: {
			type: String,
		},
		owner: {
			type: Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
);
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model('Video', videoSchema);
