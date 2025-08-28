const { fetchApi } = require("../db/fetchApi");
const { DateTimeManager } = require("../services/DateTimeManager");
const { logError, logInfo } = require("../logMessages");



/**
 *
 * @param {*} table
 * @param {*} primaryKeyColumn Primary Key column name
 * @param {*} id Id of row to be changed
 * @param {*} updateObject Object with the new information. {days_count: 15}
 * @returns
 */
async function updateApi(table, primaryKeyColumn, id, updateObject) {
    try {
        const supabase = await fetchApi();

        if (!supabase) {
            logError("Error supabase");
            return { success: false, error: "supabase_connection_failed" };
        }

        if (!table || !id || !updateObject) {
            logError("Error updateApi: problem in parameters");
            return { success: false, error: "invalid_parameters" };
        }

        const { data, error } = await supabase
            .from(table)
            .update(updateObject)
            .eq(primaryKeyColumn, id)
            .select();

        if (error) {
            logError("Error updateApi:", error);
            return { success: false, error };
        }

        if (!data || data.length === 0) {
            logError(`Update executed but no rows affected`);

            // Vamos verificar se o registro ainda existe após o update
            const { data: checkData } = await supabase
                .from(table)
                .select("*")
                .eq(primaryKeyColumn, id);

            logInfo(
                `Record check after failed update: ${JSON.stringify(checkData)}`
            );

            return { success: false, error: "no_rows_updated" };
        }

        logInfo(`UpdateApi SUCCESS - ${table}.${id} -> ${updateObject}`);
        logInfo(`Updated data: ${JSON.stringify(data)}`);

        return { success: true, data };
    } catch (error) {
        logError("Error updateApi exception:", error);
        return { success: false, error: error.message };
    }
}

module.exports = { updateApi };
