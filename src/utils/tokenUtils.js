const jwt = require('jsonwebtoken')
// Generate access token
const generateAccessToken = (user) => {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    return jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: '24h',
    })
}

// Generate refresh token
const generateRefreshToken = (user, refreshTokens) => {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    return refreshToken
}

module.exports = { generateAccessToken, generateRefreshToken }
