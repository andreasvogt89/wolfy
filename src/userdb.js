const { User } = require('./mongodb');
const bcrypt = require('bcrypt');
const logger = require('./serverlog/logger');
require('dotenv').config();
const roles = {
    ADMIN: "Admin",
    USER: "User"
}

async function createUser() {
    try {
        const user = {
            username: process.env.NEW_USER,
            password: await bcrypt.hash(process.env.NEW_USER_PW, 10),
            role: roles.ADMIN
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