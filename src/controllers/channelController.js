const Channel = require('../models/Channel')
const Workspace = require('../models/Workspace')
const User = require('../models/User')

// Create a new channel
const createChannel = async (req, res, next) => {
    try {
        const { name, description, workspaceId, type, members } = req.body
        const workspace = await Workspace.findById(workspaceId)

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        // Check if the user is a member of the workspace
        if (!workspace.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this workspace' })
        }

        const member_list = [req.user._id]
        if (members) {
            for (const member_id of members) {
                const member = await User.findById(member_id)
                if (!member) {
                    return res.status(404).json({
                        message: 'Specified member is not a registered user',
                    })
                }
                member_list.push(member.id)
            }
        }
        var channel_type = ''
        if (!['public', 'private'].includes(type)) {
            channel_type = 'public'
        } else {
            channel_type = type
        }

        const channel = new Channel({
            name: name,
            description: description,
            type: channel_type,
            workspace: workspaceId,
        })
        if (channel_type === 'public') {
            for (const member of workspace.members) {
                member_details = await User.findById(member)
                channel.members.push(member_details.id)
            }
        } else {
            for (const member_id of member_list) {
                channel.members.push(member_id)
            }
        }

        await channel.save()

        // Add the channel to the workspace
        workspace.channels.push(channel._id)
        await workspace.save()

        res.status(201).json({
            message: 'Channel created successfully',
            channel,
        })
    } catch (error) {
        next(error)
    }
}

// Get all channels in a workspace
const getAllChannels = async (req, res, next) => {
    try {
        const { workspaceId } = req.params
        var workspace = {}
        try {
            workspace = await Workspace.findOne({
                _id: workspaceId,
                members: req.user.id,
            }).populate('channels')
        } catch (error) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (!workspace.members.includes(req.user.id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this workspace' })
        }

        const channels = await Channel.find({
            workspace: workspaceId,
            members: req.user.id,
        }).populate('members')

        res.json(channels)
    } catch (error) {
        next(error)
    }
}

// Get a specific channel
const getChannel = async (req, res, next) => {
    try {
        const { channelId } = req.params
        const channel = await Channel.findById(channelId)

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' })
        }

        if (!channel.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this channel' })
        }

        const updated_channel =
            await Channel.findById(channelId).populate('members')

        res.json({
            channel: updated_channel,
            message: 'Channel details fetched successfully',
        })
    } catch (error) {
        next(error)
    }
}

// Update a channel
const updateChannel = async (req, res, next) => {
    try {
        const { channelId } = req.params
        const { name, description } = req.body

        const channel = await Channel.findById(channelId)

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' })
        }

        if (name) channel.name = name
        if (description) channel.description = description

        await channel.save()

        const updated_channel =
            await Channel.findById(channelId).populate('members')

        res.json({
            channel: updated_channel,
            message: 'Channel updated successfully',
        })
    } catch (error) {
        next(error)
    }
}

// Delete a channel
const deleteChannel = async (req, res, next) => {
    try {
        const { channelId } = req.params
        const channel = await Channel.findById(channelId)
        const workspace = await Workspace.findById(channel.workspace)
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' })
        }

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (!workspace.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this workspace' })
        }

        if (!channel.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this Channel' })
        }

        // Remove the channel from the workspace
        await Workspace.findByIdAndUpdate(channel.workspace, {
            $pull: { channels: channelId },
        })

        await channel.deleteOne()

        res.json({ message: 'Channel deleted successfully' })
    } catch (error) {
        next(error)
    }
}

// Add a user to a channel
const addMemberToChannel = async (req, res, next) => {
    try {
        const { channelId } = req.params
        const { userId } = req.body

        const channel = await Channel.findById(channelId)
        const user = await User.findById(userId)
        workspace = await Workspace.findById(channel.workspace)

        if (!workspace.members.includes(user._id)) {
            return res
                .status(400)
                .json({ message: 'You are not a member of this channel' })
        }

        if (!channel || !user) {
            return res
                .status(404)
                .json({ message: 'Channel or User not found' })
        }

        if (channel.members.includes(userId)) {
            return res
                .status(400)
                .json({ message: 'User is already a member of the channel' })
        }

        channel.members.push(userId)
        await channel.save()

        const updated_channel =
            await Channel.findById(channelId).populate('members')

        res.json({
            message: 'User added to channel successfully',
            channel: updated_channel,
        })
    } catch (error) {
        next(error)
    }
}

// Remove a user from a channel
const removeMemberFromChannel = async (req, res, next) => {
    try {
        const { channelId } = req.params
        const { userId } = req.body

        const channel = await Channel.findById(channelId)

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' })
        }

        if (!channel.members.includes(userId)) {
            return res
                .status(400)
                .json({ message: 'User is not a member of the channel' })
        }

        channel.members.pull(userId)
        await channel.save()

        const updated_channel =
            await Channel.findById(channelId).populate('members')
        res.json({
            message: 'User removed from the channel successfully',
            channel: updated_channel,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createChannel,
    getAllChannels,
    getChannel,
    updateChannel,
    deleteChannel,
    addMemberToChannel,
    removeMemberFromChannel,
}
