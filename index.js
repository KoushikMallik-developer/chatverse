const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./src/routes/authRoutes')
const userRoutes = require('./src/routes/userRoutes')
const errorHandler = require('./src/middlewares/errorHandler')
const workspaceRoutes = require('./src/routes/workspaceRoutes')
const channelRoutes = require('./src/routes/channelRoutes')
const dmRoutes = require('./src/routes/dmRoutes')
const messageRoutes = require('./src/routes/messageRoutes')
const setupSocket = require('./src/utils/socket')

dotenv.config()
const PORT = process.env.PORT || 8000

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow requests from any origin
    },
})

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(errorHandler)

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/DMs', dmRoutes)
app.use('/api/messages', messageRoutes)

setupSocket(io)

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})
