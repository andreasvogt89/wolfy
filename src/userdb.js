const { User } = require('./mongodb');
const bcrypt = require('bcrypt');
const logger = require('./serverlog/logger');
const roles = {
    ADMIN: "Admin",
    USER: "User"
}

async function createUser() {
    try {
        const user = {
            username: "",
            password: await bcrypt.hash("", 10),
            role: roles.USER
        }
        logger.info(`Create user: ${JSON.stringify(user)}`);
        User.create(user);
        return "Successful created user: " + user.username;
    } catch (e) {
        return new Error(`Create user failed: ${e}`)
    }
}
module.exports = {
    createUser,
    roles,
}