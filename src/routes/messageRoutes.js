const express = require('express')
const {
    getMessages,
    searchMessages,
} = require('../controllers/messageController')
const { authenticateToken } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/:channelId', authenticateToken, getMessages)
router.post('/search', authenticateToken, searchMessages)

module.exports = router
