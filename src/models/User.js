const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true, default: '' },
        password: { type: String, required: true },
        profilePicture: { type: String }, // URL to profile picture
        workspaces: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
        ], // Many-to-Many with Workspace
    },
    { timestamps: true }
)

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
