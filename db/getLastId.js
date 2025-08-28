const { logError } = require("../logMessages");
const { selectApi } = require("./selectApi");

async function getLastId() {
    const streaks = await selectApi("streaks", "streak_id");

    if (!streaks) {
        logError( `getLastId error in selectApi`, null);
    }

    const greaterStreakId = streaks.reduce((maxId, currentItem) => {
        return Math.max(maxId, currentItem.streak_id);
    }, -Infinity);

    return greaterStreakId;
}

module.exports = { getLastId };
