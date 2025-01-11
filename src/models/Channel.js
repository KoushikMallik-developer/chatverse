const mongoose = require('mongoose')

const channelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        type: {
            type: String,
            enum: ['public', 'private', 'dm'],
            default: 'public',
        }, // Public or Private
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        }, // Belongs to a workspace
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users in the channel
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // Messages in the channel
    },
    { timestamps: true }
)

module.exports = mongoose.model('Channel', channelSchema)
