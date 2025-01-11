const Message = require('../models/Message')
const Channel = require('../models/Channel')

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        // Join a channel
        socket.on('joinChannel', ({ channelId, username }) => {
            socket.join(channelId)
            console.log(`${username} joined channel: ${channelId}`)
            socket.to(channelId).emit('userJoined', { username, channelId })
        })

        // Leave a channel
        socket.on('leaveChannel', ({ channelId, username }) => {
            socket.leave(channelId)
            console.log(`${username} left channel: ${channelId}`)
            socket.to(channelId).emit('userLeft', { username, channelId })
        })

        // Send a message
        socket.on('sendMessage', async ({ channelId, senderId, text }) => {
            try {
                const message = new Message({
                    channel: channelId,
                    sender: senderId,
                    content: text,
                })
                const channel = await Channel.findById(channelId)
                if (!channel) {
                    throw new Error('Channel not found')
                }
                channel.messages.push(message._id)
                await channel.save()
                await message.save()

                // Broadcast the message to everyone in the channel
                io.to(channelId).emit('newMessage', {
                    _id: message._id,
                    channelId: message.channelId,
                    senderId: message.senderId,
                    text: message.text,
                    timestamp: message.timestamp,
                })
            } catch (err) {
                console.error('Error saving message:', err.message)
            }
        })

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`)
        })
    })
}

module.exports = setupSocket
