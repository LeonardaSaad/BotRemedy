const { DateTimeManager } = require("../services/DateTimeManager");
const { getUser } = require("../services/getUser");
const { user_id } = require("../config.json");
const { logError, logInfo } = require("../logMessages");

const dtManager = new DateTimeManager();

/**
 *
 * @param {*} client
 * @param {*} message
 * @returns
 */
async function sendMessage(client, msgContent, emojis, gifFirst, timeout) {
    const user = await getUser(client, user_id);

    if (!user) {
        return {
            success: false,
            reason: "user_not_found",
            error: "User not found or inaccessible",
        };
    }

    try {
        let messageText;
        let gifURL = null;

        if (typeof msgContent === "string") {
            messageText = msgContent;
        } else if (
            Array.isArray(msgContent) &&
            msgContent[0] &&
            msgContent[0].message
        ) {
            messageText = msgContent[0].message;
            if (msgContent[0].gifURL) {
                gifURL = msgContent[0].gifURL;
            }
        } else {
            logError(`Message invalid format.`);
            return {
                success: false,
                reason: "invalid_message_format",
                error: "Invalid message format",
            };
        }

        if (gifFirst && gifURL) {
            await user.send(gifURL);
        }

        const message = await user.send(messageText);
        logInfo(`${msgContent} was sent.`)

        // React with emojis
        if (emojis && Array.isArray(emojis)) {
            for (const emoji of emojis) {
                await message.react(emoji);
            }
        }

        if (!gifFirst && gifURL) {
            await user.send(gifURL);
        }

        const collector = message.createReactionCollector({
            filter: (reaction, user) =>
                emojis.includes(reaction.emoji.name) && user.id === user_id,
            max: 1,
            time: timeout,
        });

        return new Promise((resolve) => {
            collector.on("collect", (reaction) => {
                logInfo(`User react with ${reaction.emoji.name}`);
                resolve({
                    success: true,
                    reaction: reaction.emoji.name,
                    message: message,
                });
            });

            collector.on("end", (collected, reason) => {
                if (collected.size === 0) {
                    resolve({
                        success: false,
                        reason: reason, // 'time' if timeout, 'limit' if max reached
                        message: message,
                    });
                }
            });
        });
    } catch (error) {
        logError(`Error sending message: ${error.message}`);
        return {
            success: false,
            reason: "send_error",
            error: error.message,
        };
    }
}

module.exports = { sendMessage };
