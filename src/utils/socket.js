const Message = require('../models/Message')
const Channel = require('../models/Channel')

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        // Join a channel
        socket.on('joinChannel', async ({ channelId, user }) => {
            const channel = await Channel.findById(channelId)
            if (channel) {
                if (channel.members.includes(user._id)) {
                    socket.join(channelId)
                    const user_name = user.name
                    console.log(`${user_name} joined channel: ${channelId}`)
                    socket
                        .to(channelId)
                        .emit('userJoined', { user_name, channelId })
                }
            }
        })

        // Leave a channel
        socket.on('leaveChannel', ({ channelId, user }) => {
            const user_name = user.name
            socket.to(channelId).emit('userLeft', { user_name, channelId })
            socket.leave(channelId)
            console.log(`${user_name} left channel: ${channelId}`)
        })

        // Send a message
        socket.on('sendMessage', async ({ channelId, senderId, content }) => {
            try {
                const message = new Message({
                    channel: channelId,
                    sender: senderId,
                    content: content,
                })
                const channel = await Channel.findById(channelId)

                if (channel) {
                    if (channel.members.includes(senderId)) {
                        channel.messages.push(message._id)
                        await channel.save()
                        await message.save()

                        // Broadcast the message to everyone in the channel
                        const new_message = await Message.findById(
                            message._id
                        ).populate('sender')
                        io.to(channelId).emit('newMessage', new_message)
                    }
                }
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
