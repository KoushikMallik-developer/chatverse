const express = require('express')
const {
    getAllUsers,
    updateUser,
    deleteUser,
    getUserWithToken,
} = require('../controllers/userController')
const { authenticateToken } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/', authenticateToken, getAllUsers)
router.get('/me', authenticateToken, getUserWithToken)
router.put('/', authenticateToken, updateUser)
router.delete('/', authenticateToken, deleteUser)

module.exports = router
