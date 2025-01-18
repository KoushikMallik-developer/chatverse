const mongoose = require('mongoose')

const reactionSchema = new mongoose.Schema(
    {
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        }, // Message being reacted to
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }, // Who reacted
        emoji: { type: String, required: true }, // The reaction (e.g., 👍, ❤️)
    },
    { timestamps: true }
)

module.exports = mongoose.model('Reaction', reactionSchema)
