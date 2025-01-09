const mongoose = require('mongoose')

const workspaceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }, // Owner of the workspace
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users in the workspace
        channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }], // Channels in the workspace
        dms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage' }], // DMs in the workspace
    },
    { timestamps: true }
)

module.exports = mongoose.model('Workspace', workspaceSchema)
