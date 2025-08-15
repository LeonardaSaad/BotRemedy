const { createStreak } = require("./createStreak");
const { getLastId } = require("./getLastId");
const { updateApi } = require("./updateApi");

async function lostStreak() {
    // Create new streak
    await createStreak();

    const lastId = await getLastId();

    // Update the 'actual_streak_id'
    await updateApi(
        "medication_streaks",
        "id",
        "c276cc79-dfd4-4daa-bb73-0ab8ea81b1d0",
        {actual_streak_id: lastId}
    );
}

module.exports = { lostStreak };
