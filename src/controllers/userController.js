const User = require('../models/User')

// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, { password: 0 }) // Exclude password
        res.json(users)
    } catch (error) {
        next(error)
    }
}

// Update user
const updateUser = async (req, res, next) => {
    try {
        const { username } = req.params
        const { password } = req.body

        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        user.password = password
        await user.save()

        res.json({ message: 'User updated successfully' })
    } catch (error) {
        next(error)
    }
}

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { username } = req.params
        const result = await User.deleteOne({ username })

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        next(error)
    }
}

module.exports = { getAllUsers, updateUser, deleteUser }
