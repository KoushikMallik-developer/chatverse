const jwt = require('jsonwebtoken')

// Middleware to authenticate access token
const authenticateToken = (req, res, next) => {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token)
        return res.status(401).json({ message: 'Access token required' })

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' })
        req.user = user
        next()
    })
}

module.exports = { authenticateToken }
