const DirectMessage = require('../models/DirectMessage')
const User = require('../models/User')
const Workspace = require('../models/Workspace')

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

        const dm = new DirectMessage({
            workspace: workspaceId,
            participants: [recipientId, req.user._id],
        })

        await dm.save()

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
        const dms = await DirectMessage.find({
            workspace: workspaceId,
            participants: user.id,
        })

        res.json(dms)
    } catch (error) {
        next(error)
    }
}

// Delete a specific direct message
const deleteDM = async (req, res, next) => {
    try {
        const { dmId } = req.params

        const dm = await DirectMessage.findById(dmId)

        if (!dm) {
            return res
                .status(404)
                .json({ message: 'Direct message channel not found' })
        }

        if (!dm.participants.includes(req.user._id)) {
            return res
                .status(403)
                .json({
                    message:
                        'You are not a participant in this direct message channel',
                })
        }
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
