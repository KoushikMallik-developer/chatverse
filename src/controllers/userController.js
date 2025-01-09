const User = require('../models/User')

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

module.exports = { getAllUsers, updateUser, deleteUser }
