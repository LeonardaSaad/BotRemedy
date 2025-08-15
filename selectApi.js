// require("dotenv").config();

const { DateTimeManager } = require("./DateTimeManager");
const { fetchApi } = require("./fetchApi");

const dtManager = new DateTimeManager();

// table - table
/*
 * Select ->
 * Column -> Filter
 * valueColumn -> value filter
 */
/**
 *
 * @param {*} table
 * @param {*} select Specific columns to show
 * @param {*} column Filter
 * @param {*} valueColumn Value filter
 * @returns
 */
async function selectApi(table, select, column, valueColumn) {
    try {
        const supabase = await fetchApi();

        if (!supabase) {
            console.error(
                `[${dtManager.getTime()}]`,
                "Error selectApi: supabase not work"
            );
            return {
                data: null,
                error: new Error("Supabase client not initialized."),
            };
        }

        if (!table) {
            console.error(
                `[${dtManager.getTime()}]`,
                'Error selectApi: "table" not found!'
            );
            return;
        }

        if (column && valueColumn) {
            const { data, error } = await supabase
                .from(table)
                .select(select ? select : "")
                .eq(column, valueColumn);

            if (error) {
                console.error(
                    `[${dtManager.getTime()}]`,
                    "Error to fetch api: selectApi",
                    error
                );
                return { data: null, error: error };
            }

            return data;
        } else {
            const { data, error } = await supabase
                .from(table)
                .select(select ? select : "");

            if (error) {
                console.error(
                    `[${dtManager.getTime()}]`,
                    "Error to fetch api:",
                    error
                );
                return { data: null, error: error };
            }

            return data;
        }
    } catch (error) {
        console.error("Error selectApi:", error);
        return error;
    }
}

module.exports = { selectApi };
