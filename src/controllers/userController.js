const User = require('../models/User')
const Workspace = require('../models/Workspace')

// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, { password: 0 }).populate(
            'workspaces'
        ) // Exclude password
        res.json(users)
    } catch (error) {
        next(error)
    }
}

// Update user
const updateUser = async (req, res, next) => {
    try {
        const { password, name } = req.body

        const user = await User.findOne({ _id: req.user.id })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (password && password.length > 4) {
            user.password = password
        }
        if (name && name.length > 0) {
            user.name = name
        }
        await user.save()

        res.json({ message: 'User updated successfully' })
    } catch (error) {
        next(error)
    }
}

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const result = await User.deleteOne({ _id: req.user.id })

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        next(error)
    }
}

// Get user with token
const getUserWithToken = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 }) // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json(user)
    } catch (error) {
        next(error)
    }
}

const searchAllUsers = async (req, res, next) => {
    try {
        const { query } = req.body
        if (!query) {
            return res
                .status(400)
                .send({ message: 'Query parameter is required.' })
        }

        const keywords = query.split(' ')

        const searchConditions = keywords.map((keyword) => ({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
            ],
        }))

        const users = await User.find(
            {
                $or: searchConditions,
            },
            { password: 0 }
        )

        res.json(users)
    } catch (error) {
        next(error)
    }
}

const searchUsersInWorkspace = async (req, res, next) => {
    try {
        const { query, workspaceId } = req.body
        if (!query) {
            return res
                .status(400)
                .send({ message: 'Query parameter is required.' })
        }

        const workspace = await Workspace.findById(workspaceId)
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' })
        }

        if (!workspace.members.includes(req.user._id)) {
            return res
                .status(403)
                .json({ message: 'You are not a member of this workspace' })
        }

        const keywords = query.split(' ')

        const searchConditions = keywords.map((keyword) => ({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
            ],
        }))

        const users = await User.find(
            {
                $and: [{ workspaces: workspaceId }],
                $or: searchConditions,
            },
            { password: 0 }
        )

        res.json(users)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    getUserWithToken,
    searchAllUsers,
    searchUsersInWorkspace,
}
