const { DateTimeManager } = require("./DateTimeManager");


const dtManager = new DateTimeManager();

const logInfo = (message, ...data) =>
    console.log(
        `\x1b[34m[INFO - ${dtManager.getTime()}]\x1b[0m ${message}`,
        ...data
    );
const logSuccess = (message, ...data) =>
    console.log(
        `\x1b[32m[SUCCESS - ${dtManager.getTime()}]\x1b[0m ${message}`,
        ...data
    );
const logWarning = (message, ...data) =>
    console.log(
        `\x1b[33m[WARN - ${dtManager.getTime()}]\x1b[0m ${message}`,
        ...data
    );
const logError = (message, ...error) =>
    console.error(
        `\x1b[31m[ERROR - ${dtManager.getTime()}]\x1b[0m ${message}`,
        ...error
    );

module.exports = { logInfo, logSuccess, logWarning, logError };
