const Workspace = require('../models/Workspace')
const User = require('../models/User')

// Create a new workspace
const createWorkspace = async (req, res, next) => {
    try {
        const { name, description } = req.body
        const owner = req.user.id
        const user = await User.findById(owner)
        const members = [owner]
        const workspace = new Workspace({ name, description, owner, members })
        await workspace.save()
        user.workspaces.push(workspace._id)
        await user.save()

        res.status(201).json({
            message: 'Workspace created successfully',
            workspace,
        })
    } catch (error) {
        next(error)
    }
}

// Get all workspaces for the authenticated user
const getAllWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Workspace.find({
            $or: [{ owner: req.user._id }, { members: req.user._id }],
        }).populate({
            path: 'members',
            select: 'email profilePicture name', // Specify the fields to populate
        })

        res.json(workspaces)
    } catch (error) {
        next(error)
    }
}

// Update a workspace
const updateWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, description } = req.body

        const workspace = await Workspace.findById(id).populate('members')
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found.' })
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to update this workspace.',
            })
        }

        workspace.name = name || workspace.name
        workspace.description = description || workspace.description

        await workspace.save()
        res.json({ message: 'Workspace updated successfully.', workspace })
    } catch (error) {
        next(error)
    }
}

const addMembersToWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params
        const { members } = req.body

        const workspace = await Workspace.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message:
                    'You are not authorized to add members to this workspace',
            })
        }

        if (members) {
            for (const member_email of members) {
                const member = await User.findOne({ email: member_email })
                if (!member) {
                    return res.status(404).json({
                        message: 'Specified member is not a registered user',
                    })
                }
                if (member.workspaces.includes(workspace.id)) {
                    return res.status(400).json({
                        message: 'User is already a member of the workspace',
                    })
                }
                if (workspace.members.includes(member.id)) {
                    return res.status(400).json({
                        message: 'User is already a member of the workspace',
                    })
                }
                workspace.members.push(member.id)
                member.workspaces.push(workspace.id)
                await member.save()
            }
        }
        await workspace.save()
        res.json({ message: 'Members added successfully', workspace })
    } catch (error) {
        next(error)
    }
}

const removeMembersFromWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params
        const { members } = req.body

        const workspace = await Workspace.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message:
                    'You are not authorized to add members to this workspace.',
            })
        }

        if (members) {
            for (const member_id of members) {
                if (member_id.toString() === workspace.owner.toString()) {
                    return res.status(403).json({
                        message: 'Owner can not be removed from the workspace.',
                    })
                }
                const member = await User.findById(member_id)
                if (!member) {
                    return res.status(404).json({
                        message: 'Specified member is not a registered user.',
                    })
                }
                if (member.workspaces.includes(workspace.id)) {
                    workspace.members.pull(member.id)
                    member.workspaces.pull(workspace.id)
                    await member.save()
                } else {
                    return res.status(404).json({
                        message:
                            'Specified member is not a member of the workspace.',
                    })
                }
            }
            await workspace.save()
            res.json({ message: 'Members removed successfully.', workspace })
        }
    } catch (error) {
        next(error)
    }
}

// Delete a workspace
const deleteWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params

        const workspace = await Workspace.findById(id)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to delete this workspace',
            })
        }
        for (const member_id of workspace.members) {
            const member = await User.findById(member_id)
            member.workspaces.pull(workspace.id)
            await member.save()
        }
        await Workspace.findByIdAndDelete(id)
        res.json({ message: 'Workspace deleted successfully' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createWorkspace,
    getAllWorkspaces,
    updateWorkspace,
    addMembersToWorkspace,
    removeMembersFromWorkspace,
    deleteWorkspace,
}
