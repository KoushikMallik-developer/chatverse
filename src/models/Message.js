const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }, // Who sent the message
        channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }, // Belongs to a channel (optional)
        reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }], // Reactions to this message
    },
    { timestamps: true }
)

module.exports = mongoose.model('Message', messageSchema)
