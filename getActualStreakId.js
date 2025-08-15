const { logError } = require("./logMessages");
const { DateTimeManager } = require("./DateTimeManager");
const { selectApi } = require("./selectApi");


async function getActualStreakId() {
    const medicationStreaks = await selectApi(
        "medication_streaks",
        "actual_streak_id"
    );
    const actualStreaksId = medicationStreaks[0].actual_streak_id;

    // Actual id exist in 'streaks' table?
    const actualStreakObj = await selectApi(
        "streaks",
        null,
        "streak_id",
        actualStreaksId
    );

    //SECTION - Exist streak?
    if (actualStreaksId == null || actualStreakObj.length == 0) {
        // NO
        // The actual_streak_id or streaks.streak_id don't exist.
        // Change the "actual_streak_id"

        logError(`Actual streak don't exist`);

        return false;
    } else {
        // YES
        return true;
    }
}

module.exports = { getActualStreakId };
