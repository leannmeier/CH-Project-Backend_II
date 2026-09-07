import mongoose from 'mongoose';

let userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        role: {
                type: String,
                enum: ['admin', 'organizer', 'user'],
                default: 'user'
            }
    },
    { timestamps: true }
)

userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    }
});

export const UserModel = mongoose.model('user', userSchema);