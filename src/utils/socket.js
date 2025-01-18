const Message = require('../models/Message')
const Channel = require('../models/Channel')

const onlineUsers = new Map()
const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`)

        socket.on('user_online', async (user) => {
            console.log(user + ' is online')
            onlineUsers.set(socket.id, user)
            io.emit('online_users', Array.from(onlineUsers.values()))
        })

        const isMemberOfRoom = (roomName) => {
            return socket.rooms.has(roomName)
        }
        // Join a channel
        socket.on('joinChannel', async ({ channelId, user }) => {
            if (!isMemberOfRoom(channelId)) {
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
                        socket.to(channelId).emit('notification', {
                            sender: senderId,
                            message: content,
                            channelId: channelId,
                        })
                    }
                }
            } catch (err) {
                console.error('Error saving message:', err.message)
            }
        })

        // Handle user disconnecting
        socket.on('disconnect', async () => {
            const user = onlineUsers.get(socket.id)
            if (user) {
                onlineUsers.delete(socket.id)
                io.emit('online_users', Array.from(onlineUsers.values()))
            }
            console.log('A user disconnected:', socket.id)
        })
    })
}

module.exports = setupSocket
