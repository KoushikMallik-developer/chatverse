const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const authRoutes = require('./src/routes/authRoutes')
const userRoutes = require('./src/routes/userRoutes')
const errorHandler = require('./src/middlewares/errorHandler')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(bodyParser.json())

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

// Error handler middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})