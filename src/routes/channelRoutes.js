const express = require('express')
const {
    createChannel,
    getAllChannels,
    getChannel,
    updateChannel,
    deleteChannel,
    addMemberToChannel,
    removeMemberFromChannel,
} = require('../controllers/channelController')
const { authenticateToken } = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/', authenticateToken, createChannel)
router.get('/:workspaceId', authenticateToken, getAllChannels)
router.get('/detail/:channelId', authenticateToken, getChannel)
router.put('/:channelId', authenticateToken, updateChannel)
router.delete('/:channelId', authenticateToken, deleteChannel)
router.post('/:channelId/members', authenticateToken, addMemberToChannel)
router.delete('/:channelId/members', authenticateToken, removeMemberFromChannel)

module.exports = router
