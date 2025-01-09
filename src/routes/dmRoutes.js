const express = require('express')
const { createDM, getDMs, deleteDM } = require('../controllers/dmController')
const { authenticateToken } = require('../middlewares/authMiddleware')

const router = express.Router()

router.post('/', authenticateToken, createDM)
router.get('/:workspaceId', authenticateToken, getDMs)
router.delete('/:dmId', authenticateToken, deleteDM)

module.exports = router
