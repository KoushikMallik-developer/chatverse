const User = require('../models/User')
const validate_user_email = async (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
        return false
    }
    const user = await User.findOne({ email: email })
    if (user) {
        return false
    }
    return true
}

const validate_name = (name) => {
    const nameRegex = /^[a-zA-Z\s]*$/
    if (!nameRegex.test(name)) {
        return false
    }
    return true
}

module.exports = { validate_user_email, validate_name }
