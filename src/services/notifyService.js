const { sendMessage } = require("./messageService");
const { lastStreak } = require("../db/lastStreak.js");
const { updateApi } = require("../db/services.js");
const { sendEmail } = require("../services/sendEmail.js");

const { formatInTimeZone } = require("date-fns-tz");
const TZ = "America/Sao_Paulo";

async function sendMedicineReminder(client, userId) {
    while (true) {
        try {
            const now = new Date();
            const hour = parseInt(formatInTimeZone(now, TZ, "HH"));
            const nowDB = formatInTimeZone(now, TZ, "yyyy-MM-dd HH:mm:ssxxx");
            const nowLog = formatInTimeZone(now, TZ, "dd/MM/yyyy HH:mm:ss");

            const emojis = ["✅", "❌"];
            const duration = 60_000;
            const ltStreak = await lastStreak();
            const content = "💊 **Hora de tomar seu remédio!**\n\nResponda aqui quando tomar.";

            if (hour >= 16) {
                // console.log(`[${nowLog}] Horário encerrado, parando lembretes.`);
                return;
            }

            const message = await sendMessage(client, userId, content, emojis, duration);

            if (message.success && message.reaction === "✅") {
                const result = await updateApi(
                    "streaks",
                    { days_count: ltStreak.daysCount + 1, last_date: nowDB },
                    ["streak_id", ltStreak.id],
                );

                if (result?.error) throw new Error(`updateApi: ${result.error}`);

                console.log(`[${nowLog}] Remédio tomado!`);
                await sendMessage(client, userId, 'Parabéns!!! Você tomou o seu remédio!', null, null);
                return;
            }

            console.log(`[${nowLog}] Aguardando 10 minutos...`);
            await delay(10 * 60 * 1000);
        } catch (error) {
            const nowLog = formatInTimeZone(new Date(), TZ, "dd/MM/yyyy HH:mm:ss");
            console.error(`[${nowLog} - sendMedicineReminder] ${error}`);
            await sendEmail(`[${nowLog}] sendMedicineReminder: ${error}`);
            return;
        }
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { sendMedicineReminder };
