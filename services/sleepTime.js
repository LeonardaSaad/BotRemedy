async function sleepTime(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { sleepTime };
