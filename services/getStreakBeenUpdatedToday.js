const { logWarning } = require("../logMessages");
const { lostStreak } = require("../services/lostStreak");
const { selectApi } = require("../db/selectApi");

/**
 * Check if the streak has been updated today or need wait next day.
 * @param {string} actualStreakId - The actual streak ID.
 * @param {DateTimeManager} dtManager - A class instance of DateTimeManager.
 * @returns {Promise<boolean>} Can return "streak_lost", "waited_for_next_day" or "today_not_computed".
 */
async function getStreakBeenUpdatedToday(actualStreakId, dtManager) {
    const firstDateObj = await selectApi(
        "streaks",
        "first_date",
        "streak_id",
        actualStreakId
    );

    const firstDate = firstDateObj[0].first_date;

    const lastDateObj = await selectApi(
        "streaks",
        "last_date",
        "streak_id",
        actualStreakId
    );

    const lastDate = lastDateObj[0].last_date;

    const currentDate = await dtManager.getDate();
    const currentDay = await dtManager.getCurrentDay();

    //SECTION - Has it been more than a day since the last date?
    if (lastDate !== null) {
        const lastDay = await dtManager.getDay(lastDate);

        const differenceInDays = currentDay - lastDay;

        if (differenceInDays >= 2) {
            logWarning(
                dtManager.getTime(),
                "The streak are lost.",
                differenceInDays
            );

            await lostStreak();

            return "streak_lost";
        }
    } else {
        const firstDay = await dtManager.getDay(firstDate);

        const differenceInDays = currentDay - firstDay;

        if (differenceInDays >= 2) {
            logWarning(
                "The streak are lost.",
                differenceInDays
            );

            await lostStreak();

            return "streak_lost";
        }
    }

    //SECTION - Today was computed?
    if (lastDate == currentDate) {
        // YES
        logWarning( "Today was computed");
        return "waited_for_next_day";
    } else {
        // NO
        logWarning( "Today wasn't computed");
        return "today_not_computed";
    }
}

module.exports = { getStreakBeenUpdatedToday };
