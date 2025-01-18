const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { validate_user_email, validate_name } = require('../utils/helpers')
const {
    generateAccessToken,
    generateRefreshToken,
} = require('../utils/tokenUtils')

const refreshTokens = []

// Register user
const register = async (req, res, next) => {
    try {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const { email, password, name } = req.body
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid Email Format.' })
        }
        const existing_user = await User.findOne({ email: email })
        if (existing_user) {
            return res
                .status(400)
                .json({ message: 'User is already registered with us.' })
        }

        if (password.length < 4) {
            return res.status(400).json({
                message: 'Password must be at least 4 characters long',
            })
        }
        if (!validate_name(name)) {
            return res.status(400).json({
                message:
                    'Name must be at least 1 character long and only contain letters',
            })
        }
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
