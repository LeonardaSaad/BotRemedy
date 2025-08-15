const { fetchApi } = require("./fetchApi");
const { DateTimeManager } = require("./DateTimeManager");
const { getLastId } = require("./getLastId");

const dtManager = new DateTimeManager();

async function createStreak() {
    try {
        const supabase = await fetchApi();

        if (!supabase) {
            console.error(
                `[${dtManager.getTime()}]`,
                "Error createStreak: supabase not work"
            );
        }

        const lastId = await getLastId();

        if (!lastId) {
            console.error(
                `[${dtManager.getTime()}]`,
                'Error createStreak: "last_id" not found'
            );
        }

        const newStreakId = lastId + 1;

        const { data, error } = await supabase
            .from("streaks")
            .insert({
                streak_id: newStreakId,
                days_count: 0,
                first_date: dtManager.getDate(),
                last_date: null,
            })
            .select();

        if (error) {
            console.error(
                `[${dtManager.getTime()}]`,
                "Error createStreak: ",
                error
            );
            return;
        }

        console.log(`[${dtManager.getTime()}]`, "Create new Streak:", data);

        return data;
    } catch (error) {
        console.error("Error createStreak:", error);
        return error;
    }
}

module.exports = { createStreak };
