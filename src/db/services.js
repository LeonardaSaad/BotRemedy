const { fetchApi } = require('./fetchApi');


/**
 * Get method.
 *
 * @param {String} table Database table name.
 * @param {String} select Column to extract value.
 * @param {String} column [Optional] Used to select a specific column to select a value.
 * @param {String} value [Optional] The reference value in the selected column.
 * @throws {TypeError}  
 * @returns {Object} Api response.
 */
async function getApi(table, select, column, value) {
    if (!table) {
        console.error('[getApi] Incorrect values');
        return { data: null, error: 'Table is required' };
    }

    try {
        const supabase = await fetchApi();

        let query = supabase
            .from(table)
            .select(select ? select : '');

        if (column && value) {
            query = query.eq(column, value);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[getApi] Error to fetch api:', error);
            return { data: null, error };
        }

        return { data, error: null };

    } catch (err) {
        console.error('[getApi] Unexpected error:', err);
        return { data: null, error: err };
    }
}


/**
 * Function to insert in database.
 * @param {String} table Database table name.
 * @param {Object} insert Object to be insert in database. { id: 1, name: 'Mordor' }
 */
async function insertApi(table, insert) {
    const api = await fetchApi();

    try {
        const { error } = await api.from(table).insert(insert);

        if (error) {
            console.error('[insertApi] Error: ', error);
        }

        return { error };
    } catch (error) {
        console.error('[insertApi] Error: ', error);
        return { error };
    }
}


/**
 * The function `updateDb` asynchronously updates a specified column with a new value in a specified
 * table based on a given ID using an API.
 * @param table - The `table` parameter represents the name of the database table you want to update.
 * @param {Object} column - The `column` parameter in the `updateDb` function represents the specific column in
 * the database table that you want to update with a new value. { name: 'piano' }
 * @param {Array} id - The `id` parameter in the `updateDb` function represents the unique identifier of the
 * record in the database that you want to update. It is used to specify which record should be updated
 * with the new value for the specified column. ['id', 1]
 */
async function updateApi(table, object, idArr) {
    if (!idArr || idArr.length < 2) throw new Error('[updateApi] idArr must be [column, value]');
    const api = await fetchApi();

    try {
        const { error } = await api
            .from(table)
            .update(object)
            .eq(idArr[0], idArr[1]); 

        if (error) console.error('[updateApi] ', error);

        return {error}
        
    } catch (error) {
        console.error('[updateApi] ', error);
        return {error}
    }
}


module.exports = { getApi, insertApi, updateApi };