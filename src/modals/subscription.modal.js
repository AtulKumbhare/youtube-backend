import { Schema, model, Types } from 'mongoose';

const subscriptionSchema = new Schema(
	{
		subscriber: {
			type: Types.ObjectId, //User who is subscribing
			ref: 'User',
		},
		channel: {
			type: Types.ObjectId, //User who has a channel which get subscribed by other users
			ref: 'User',
		},
	},
	{ timestamps: true }
);

export const Subscription = model('Subscription', subscriptionSchema);
