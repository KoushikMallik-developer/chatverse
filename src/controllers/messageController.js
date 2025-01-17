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

const searchMessages = async (req, res, next) => {
    try {
        const { query } = req.body // Get the search query from the request
        const { channelId } = req.body

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' })
        }

        const channel = await Channel.findById(channelId)
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' })
        }

        if (!channel.members.includes(req.user.id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this channel' })
        }

        // Search using case-insensitive regular expression
        const messages = await Message.find({
            channel: channelId,
            content: { $regex: query, $options: 'i' },
        }).populate('sender')

        return res.status(200).json({ success: true, messages: messages })
    } catch (error) {
        console.error('Error searching messages:', error)
        return res.status(500).json({ success: false, error: 'Server error' })
    }
}

module.exports = {
    getMessages,
    searchMessages,
}
