const User = require('../models/User')
const jwt = require('jsonwebtoken')
const {
    generateAccessToken,
    generateRefreshToken,
} = require('../utils/tokenUtils')

const refreshTokens = []

// Register user
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body
        const user = new User({ email: email, password: password, name: name })
        await user.save()
        res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
        next(error)
    }
}

// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: email })

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user, refreshTokens)

        res.json({ accessToken, refreshToken })
    } catch (error) {
        next(error)
    }
}

// Refresh token
const refreshToken = (req, res, next) => {
    const { token } = req.body
    if (!token || !refreshTokens.includes(token)) {
        return res.status(403).json({ message: 'Invalid refresh token' })
    }

    try {
        const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        const accessToken = generateAccessToken({ id: user.id })
        res.json({ accessToken })
    } catch (err) {
        next(err)
    }
}

// Logout user
const logout = (req, res, next) => {
    const { token } = req.body
    const index = refreshTokens.indexOf(token)
    if (index > -1) refreshTokens.splice(index, 1)
    res.json({ message: 'Logged out successfully' })
}

module.exports = { register, login, refreshToken, logout }
