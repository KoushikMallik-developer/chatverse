const express = require('express')
const { getMessages } = require('../controllers/messageController')
const { authenticateToken } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/:channelId', authenticateToken, getMessages)

module.exports = router
