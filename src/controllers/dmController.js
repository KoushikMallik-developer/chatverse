const User = require('../models/User')
const Workspace = require('../models/Workspace')
const Channel = require('../models/Channel')

// Create a new direct message
const createDM = async (req, res, next) => {
    try {
        const { recipientId, workspaceId } = req.body

        const recipient = await User.findById(recipientId)

        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' })
        }

        workspace = await Workspace.findById(workspaceId)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (
            !workspace.members.includes(req.user._id) ||
            !workspace.members.includes(recipientId)
        ) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this workspace' })
        }

        const dm = new Channel({
            name: 'Direct Message: ' + recipient._id + ' & ' + req.user.id,
            type: 'dm',
            workspace: workspaceId,
            members: [recipientId, req.user._id],
        })

        await dm.save()

        workspace.channels.push(dm.id)
        await workspace.save()

        res.status(201).json({
            message: 'Direct Message Channel created successfully',
            dm,
        })
    } catch (error) {
        next(error)
    }
}

// Get all direct messages between two users
const getDMs = async (req, res, next) => {
    try {
        const { workspaceId } = req.params
        user = await User.findById(req.user._id)

        workspace = await Workspace.findById(workspaceId)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (!workspace.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this workspace' })
        }

        const dms = await Channel.find({
            workspace: workspaceId,
            members: user.id,
            type: 'dm',
        })
            .populate('members')
            .populate('messages')

        res.json(dms)
    } catch (error) {
        next(error)
    }
}

// Delete a specific direct message
const deleteDM = async (req, res, next) => {
    try {
        const { dmId } = req.params

        const dm = await Channel.findById(dmId)

        if (!dm) {
            return res
                .status(404)
                .json({ message: 'Direct message channel not found' })
        }
        workshop = await Workspace.findById(dm.workspace)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (!workspace.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this workspace' })
        }

        if (!dm.members.includes(req.user._id)) {
            return res.status(403).json({
                message:
                    'You are not a participant in this direct message channel',
            })
        }

        workshop.channels.pull(dm.id)
        await workshop.save()

        await dm.deleteOne()

        res.json({ message: 'Direct message channel deleted successfully' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createDM,
    getDMs,
    deleteDM,
}
