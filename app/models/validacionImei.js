import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    description: String,
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

var PostMessage = mongoose.model('ImeiLogitech', postSchema);

export default PostMessage;