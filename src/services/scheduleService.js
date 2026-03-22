const cron = require("node-cron");
const { sendMedicineReminder } = require("./notifyService.js");
const { lastStreak } = require("../db/lastStreak.js");
const { lostStreak } = require("../db/lostStreak.js");

async function startScheduler(client, userId, cronExpression) {
    console.log("[Scheduler] Iniciado com expressão:", cronExpression);

    cron.schedule(
        cronExpression,
        async () => {
            const now = new Date();
            const ltStreak = await lastStreak();
            
            if (!ltStreak) {
                console.error(
                    "[Scheduler] lastStreak retornou undefined, pulando ciclo.",
                );
                return;
            }

            const lastDt = ltStreak.lastDt ? new Date(ltStreak.lastDt) : null;
            const firstDt = new Date(ltStreak.firstDt);
            const refDt = lastDt ?? firstDt;

            const takedToday =
                refDt.toDateString() === now.toDateString() &&
                ltStreak.daysCount != 0;

            const oneDayAgo = new Date(Date.now() - 86400000);
            const isLate = refDt < oneDayAgo && !takedToday;

            if (isLate) {
                console.log(`[Scheduler] Streak desatualizada, resetando...`);
                await lostStreak();
            }

            if (!takedToday) {
                await sendMedicineReminder(client, userId);
            }
        },
        {
            timezone: "America/Sao_Paulo",
        },
    );
}

module.exports = { startScheduler };
