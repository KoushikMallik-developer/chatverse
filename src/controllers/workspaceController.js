const Workspace = require('../models/Workspace')
const User = require('../models/User')
const Channel = require('../models/Channel')

// Create a new workspace
const createWorkspace = async (req, res, next) => {
    try {
        const { name, description } = req.body
        const owner = req.user.id
        const user = await User.findById(owner)
        if (!name || !description || name === '' || description === '') {
            return res
                .status(400)
                .json({ message: 'Name and description are required.' })
        }
        const members = [owner]
        const workspace = new Workspace({ name, description, owner, members })
        await workspace.save()
        user.workspaces.push(workspace._id)
        await user.save()

        const updated_workspace = await Workspace.findById(workspace._id)
            .populate({
                path: 'members',
                select: 'email profilePicture name', // Specify the fields to populate
            })
            .populate('channels')

        res.status(201).json({
            message: 'Workspace created successfully',
            workspace: updated_workspace,
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
        })
            .populate({
                path: 'members',
                select: 'email profilePicture name', // Specify the fields to populate
            })
            .populate('channels')

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
        const updated_workspace = await Workspace.findById(id).populate({
            path: 'members',
            select: 'email profilePicture name', // Specify the fields to populate
        })
        res.json({
            message: 'Workspace updated successfully.',
            workspace: updated_workspace,
        })
    } catch (error) {
        next(error)
    }
}

const addMembersToWorkspace = async (req, res, next) => {
    try {
        const { id } = req.params //WorkspaceID
        const { members } = req.body

        const workspace = await Workspace.findById(id).populate('channels')
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
            for (const member_id of members) {
                const member = await User.findById(member_id)
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
                for (const channel of workspace.channels) {
                    if (channel.type === 'public') {
                        channel.members.push(member.id)
                        await channel.save()
                    }
                }
                member.workspaces.push(workspace.id)
                await member.save()
            }
        }
        await workspace.save()
        const updated_workspace = await Workspace.findById(id)
            .populate({
                path: 'members',
                select: 'email profilePicture name', // Specify the fields to populate
            })
            .populate('channels')
        res.json({
            message: 'Members added successfully',
            workspace: updated_workspace,
        })
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

        if (
            !(
                members.length === 1 &&
                req.user.id.toString() === members[0].toString()
            )
        ) {
            if (workspace.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message:
                        'You are not authorized to remove members from this workspace.',
                })
            }
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
                    // Remove all DM channels related to the removed member
                    const dm_channels = await Channel.deleteMany({
                        type: 'dm',
                        members: { $in: [member.id] },
                        workspace: workspace.id,
                    })
                    const channels = await Channel.find({
                        workspace: workspace.id,
                        members: member.id,
                    })
                    for (const channel of channels) {
                        channel.members.pull(member.id)
                        await channel.save()
                    }
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
            const updated_workspace = await Workspace.findById(id)
                .populate({
                    path: 'members',
                    select: 'email profilePicture name', // Specify the fields to populate
                })
                .populate('channels')
            res.json({
                message: 'Members removed successfully.',
                workspace: updated_workspace,
            })
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
