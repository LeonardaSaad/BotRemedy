const { DateTimeManager } = require("./DateTimeManager");
const { logError } = require("./logMessages");

const dtManager = new DateTimeManager();

async function getUser(client, user_id) {
    if (!user_id) {
        return logError(dtManager.getTime(), 'Error: the "user_id" not found.');
    }

    try {
        const user = await client.users.fetch(user_id);

        return user;
    } catch (error) {
        return logError(dtManager.getTime(), "Error: user not found.");
    }
}

module.exports = { getUser };
