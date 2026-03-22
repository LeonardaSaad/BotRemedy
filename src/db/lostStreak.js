const { formatInTimeZone } = require("date-fns-tz");
const { lastStreak } = require("./lastStreak");
const { getApi, insertApi, updateApi } = require("./services");
const { sendEmail } = require("../services/sendEmail.js");

const TZ = "America/Sao_Paulo";

async function lostStreak() {
    const now = new Date();
    const nowDB = formatInTimeZone(now, TZ, "yyyy-MM-dd HH:mm:ssxxx");
    const nowLog = formatInTimeZone(now, TZ, "dd/MM/yyyy HH:mm:ss");

    try {
        const { data } = await getApi("streaks");
        const maxId = Math.max(...data.map((s) => s.streak_id));
        const newStreakId = maxId + 1;

        const { error: errorInsert } = await insertApi("streaks", {
            streak_id: newStreakId,
            days_count: 0,
            first_date: nowDB,
            last_date: null,
        });

        if (errorInsert) throw new Error(`insertApi: ${errorInsert}`);

        const medicationColumnId = process.env.MEDICATION_STREAK_ID;
        const { error: errorUpdate } = await updateApi(
            "medication_streaks",
            { actual_streak_id: newStreakId },
            ["id", medicationColumnId],
        );

        if (errorUpdate) throw new Error(`updateApi: ${errorUpdate}`);

        console.log(`[${nowLog}] Streak resetado. Novo ID: ${newStreakId}`);
    } catch (error) {
        console.error(`[${nowLog} - lostStreak] ${error.message}`);
        await sendEmail(`[${nowLog}] lostStreak: ${error.message}`);
    }
}

module.exports = { lostStreak };
