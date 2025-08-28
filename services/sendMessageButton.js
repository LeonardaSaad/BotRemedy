const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");
const { getUser } = require("../services/getUser");
const { logError } = require("../logMessages");
const { user_id } = require("../config.json");

async function sendMessageButton(client, message) {
    const user = await getUser(client, user_id);

    if (!user) {
        return {
            success: false,
            reason: "user_not_found",
            message: "User not found!",
        };
    }

    try {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("5min")
                .setLabel("5 minutos")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("10min")
                .setLabel("10 minutos")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("20min")
                .setLabel("20 minutos")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("30min")
                .setLabel("30 minutos")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("13h30")
                .setLabel("Me lembre às 13h30")
                .setStyle(ButtonStyle.Primary)
        );

        const msg = await user.send({
            content: message[0].message,
            components: [row],
        });

        const timeConfig = {
            "5min": { timeout: 5, unit: "minutes" },
            "10min": { timeout: 10, unit: "minutes" },
            "20min": { timeout: 20, unit: "minutes" },
            "30min": { timeout: 30, unit: "minutes" },
            "13h30": { timeout: null, time: "13h30", unit: "specific_time" },
        };

        function handleTimeSelection(customId) {
            const config = timeConfig[customId];

            if (!config) {
                return Promise.resolve({
                    success: true,
                    timeout: null,
                    message: "Invalid Option",
                });
            }

            const messageText = config.time
                ? `Notification scheduled for ${config.time}`
                : `Notification scheduled in ${config.timeout} ${config.unit}`;

            return {
                success: true,
                timeout: config.timeout,
                customId: customId,
                message: messageText,
            };
        }

        const collectorTimeout = 60_000 * 10;

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            max: 1,
            time: collectorTimeout,
        });

        return new Promise((resolve, reject) => {
            collector.on("collect", async (i) => {
                try {
                    const result = handleTimeSelection(i.customId);
                    // Properly reply to the interaction
                    await i.reply({
                        content: result.message,
                        flags: 64
                    });
                    collector.stop('completed');
                    resolve(result);
                } catch (error) {
                    reject({
                        success: false,
                        reason: "interaction_error",
                        message: "Error processing button interaction",
                    });
                }
            });

            collector.on("end", (collected, reason) => {
                if (collected.size === 0) {
                    resolve({
                        success: false,
                        reason: reason,
                        message: message,
                    });
                }
            });
        });
    } catch (error) {
        logError("Error to send message with button", error);
        return {
            success: false,
            reason: "error_to_send_message_button",
            error: error.message,
        };
    }
}

module.exports = { sendMessageButton };
