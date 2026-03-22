const { formatInTimeZone } = require("date-fns-tz");
const TZ = "America/Sao_Paulo";

async function sendMessage(
    client,
    userId,
    content,
    emojis,
    duration,
    options = {},
) {
    const nowLog = formatInTimeZone(new Date(), TZ, "dd/MM/yyyy HH:mm:ss");

    try {
        const user = await client.users.fetch(userId); 

        const message = await user.send({ content, ...options });

        if (emojis && Array.isArray(emojis)) {
            for (const emoji of emojis) {
                await message.react(emoji);
            }
        }

        console.log(
            `[${nowLog} - sendMessage] Mensagem enviada para ${userId}`,
        );

        const filter = (reaction, user) =>
            emojis.includes(reaction.emoji.name) && user.id === userId;

        const collector = message.createReactionCollector({
            filter,
            time: duration,
            max: 1,
        });

        return new Promise((resolve) => {
            collector.on("collect", (reaction, user) => {
                console.log(
                    `[${nowLog} - sendMessage] ${user.username}: ${reaction.emoji.name}`,
                );
                resolve({
                    success: true,
                    reaction: reaction.emoji.name,
                    message,
                });
            });

            collector.on("end", (collected) => {
                if (collected.size === 0) {
                    console.log(
                        `[${nowLog} - sendMessage] Timeout, nenhuma reação coletada.`,
                    );
                    resolve({ success: false, reason: "timeout", message });
                }
            });
        });
    } catch (error) {
        console.error(`[${nowLog} - sendMessage] ${error.message}`);
        await sendEmail(`[${nowLog}] sendMessage: ${error.message}`);
        return { success: false, reason: "send_failed", error: error.message };
    }
}

module.exports = { sendMessage };
