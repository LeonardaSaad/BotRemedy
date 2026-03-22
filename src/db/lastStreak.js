const { getApi } = require("./services");
const { streak } = require("../classes/Streak");

/**
 * The function `lastStreak` retrieves the last medication streak from an API and returns information
 * about it.
 * @returns The `lastStreak` function is returning the last streak object fetched from the API, which
 * includes properties such as `streak_id`, `days_count`, `first_date`, and `last_date`. If there are
 * any errors during the API calls, the function will log the error and return it.
 */
async function lastStreak() {
    let lastStreak;

    try {
        const {data, error} = await getApi('medication_streaks', 'actual_streak_id');
        
        if (error) {
            console.error(error);
            return error;
        }
        
        const lastId = data[0].actual_streak_id;
        
        try {
            const {data, error}= await getApi('streaks', undefined, 'streak_id', lastId);

            if (error) {
                console.error(error);
                return error;
            }

            lastStreak = new streak(data[0].streak_id, data[0].days_count, data[0].first_date, data[0].last_date);
            
            return lastStreak
        } catch (error) {
            console.error("lastStreak: " + error);
        }

    } catch (error) {
        console.error("lastStreak: " + error);
    }
}


module.exports = { lastStreak }