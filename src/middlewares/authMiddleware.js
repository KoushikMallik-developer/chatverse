const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Middleware to authenticate access token
const authenticateToken = (req, res, next) => {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token)
        return res.status(401).json({ message: 'Access token required' })

    jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' })
        const user_obj = await User.findOne({ _id: user.id }, { password: 0 })
        if (!user_obj) {
            return res.status(404).json({ message: 'User not found' })
        }
        req.user = user_obj
        next()
    })
}

module.exports = { authenticateToken }
