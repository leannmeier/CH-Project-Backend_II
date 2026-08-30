import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref:'user'}
    },
    { timestamps: true }
)

export const EventModel = mongoose.model('event', eventSchema);