const User = require('../models/User')
const Workspace = require('../models/Workspace')
const Channel = require('../models/Channel')
const Message = require('../models/Message')
const getMessages = async (req, res, next) => {
    try {
        const { channelId } = req.params
        user = await User.findById(req.user._id)

        const channel = await Channel.findById(channelId)
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' })
        }

        if (!channel.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this channel' })
        }

        const messages = await Message.find({
            channel: channelId,
        }).populate('sender')

        res.json({
            messages: messages,
            message: 'Messages fetched successfully',
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getMessages,
}
