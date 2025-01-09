const express = require('express')
const { authenticateToken } = require('../middlewares/authMiddleware')
const {
    createWorkspace,
    getAllWorkspaces,
    updateWorkspace,
    addMembersToWorkspace,
    removeMembersFromWorkspace,
    deleteWorkspace,
} = require('../controllers/workspaceController')

const router = express.Router()

router.post('/', authenticateToken, createWorkspace)
router.get('/', authenticateToken, getAllWorkspaces)
router.put('/:id', authenticateToken, updateWorkspace)
router.post('/add-members/:id', authenticateToken, addMembersToWorkspace)
router.post(
    '/remove-members/:id',
    authenticateToken,
    removeMembersFromWorkspace
)
router.delete('/:id', authenticateToken, deleteWorkspace)

module.exports = router
