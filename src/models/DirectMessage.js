const mongoose = require('mongoose')

const dmSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            }, // Two participants in the DM
        ],
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // Messages exchanged in the DM
    },
    { timestamps: true }
)

module.exports = mongoose.model('DirectMessage', dmSchema)