const express = require('express')
const {
    getAllUsers,
    updateUser,
    deleteUser,
} = require('../controllers/userController')
const { authenticateToken } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/', authenticateToken, getAllUsers)
router.put('/:username', authenticateToken, updateUser)
router.delete('/:username', authenticateToken, deleteUser)

module.exports = router
