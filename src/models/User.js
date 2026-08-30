import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        userName: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        userEmail: { type: String, required: true, unique: true },
        status: { type: Boolean, default: true },
        role: {
                type: String,
                enum: ['Admin', 'Organizer', 'User'],
                default: 'User'
            }
    },
    { timestamps: true }
)

export const UserModel = mongoose.model('user', userSchema);