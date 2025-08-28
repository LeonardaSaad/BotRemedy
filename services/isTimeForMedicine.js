const { DateTimeManager } = require("./DateTimeManager");
const { logInfo, logWarning } = require("../logMessages");
const { lostStreak } = require("./lostStreak");
const { sleepTime } = require("./sleepTime");

const dtManager = new DateTimeManager();

async function isTimeForMedicine(params) {
    //SECTION - Check if it is time to take medicine
    if (
        dtManager.getTime() >= "10:00:00" &&
        dtManager.getTime() <= "16:00:00"
    ) {
        // TRUE - Send message
        const emojis = ["✅", "❌"];

        const notificationTimeout = 60000 * 15;

        
        const notification = await sendMessage(
            client,
            Messages.notification,
            emojis,
            false,
            notificationTimeout
        );


        if (
            //* If the user takes the medicine
            notification.success === true &&
            notification.reaction == "✅"
        ) {
            const daysCountResult = await selectApi(
                "streaks",
                "days_count",
                "streak_id",
                actualStreaksId
            );
            const daysCount = daysCountResult[0].days_count;

            const newDaysCount = daysCount + 1;
            const lastDate = dtManager.getDate();

            const updateObject = {
                days_count: newDaysCount,
                last_date: lastDate,
            };

            await updateApi(
                "streaks",
                "streak_id",
                actualStreaksId,
                updateObject
            );

            await sendMessage(
                client,
                Messages.congratulations,
                null,
                true,
                100
            );

            await sendMessage(
                client,
                `Hoje você completa *${newDaysCount}* dias tomando remédio direto!!`,
                null,
                null,
                100
            );

            await dtManager.awaitUntilNextDay();
        } else if (
            notification.success === true &&
            notification.reaction == "❌"
        ) {
            //* If the user don't takes the medicine
            //* The user will choose the waiting time

            logInfo("Waiting 10 minutes!");
            await sendMessage(client, Messages.forgot, null, null, 1_000);
            const messageButton = await sendMessageButton(
                client,
                Messages.forgotPart2
            );

            //* Check if we have response
            if (
                messageButton.success == false &&
                messageButton.reason == "time"
            ) {
                logWarning(messageButton.message);
            }

            logInfo(messageButton.message);

            //* Wait the time selected by user
            if (messageButton.success === true) {
                if (messageButton.customId === "13h30") {
                    const now = new Date();
                    const targetTime = new Date();
                    targetTime.setHours(13, 30, 0, 0);

                    // If 13:30 already passed today, schedule for tomorrow
                    if (targetTime <= now) {
                        //FIXME - use the waitNextDay function of DateTimeManager
                        targetTime.setDate(targetTime.getDate() + 1);
                    }

                    const waitTime = targetTime.getTime() - now.getTime();

                    logInfo(
                        `Scheduling reminder for 13:30 (in ${Math.round(
                            waitTime / 1000 / 60
                        )} minutes)`
                    );

                    await sleep(waitTime);
                    setTimeout(async () => {
                        logInfo("Reminder: It's 13:30!");
                    }, waitTime);
                } else {
                    // Handle minutes (5min, 10min, etc.)
                    const waitTime = messageButton.timeout * 60 * 1000;

                    logInfo(
                        `Scheduling reminder for ${messageButton.timeout} minutes`
                    );

                    await sleep(waitTime);
                    logInfo(
                        `Reminder: ${messageButton.timeout} minutes have passed!`
                    );
                    logInfo(waitTime);
                }
            }
        } else if (notification.reason == "time") {
            logInfo("Timeout!");

            //* Send the menu
            const messageButton = await sendMessageButton(
                client,
                Messages.waitingMenu
            );

            //* Check if we have response
            if (
                messageButton.success == false &&
                messageButton.reason == "time"
            ) {
                logWarning(messageButton.message);
            }

            logInfo(messageButton.message);

            //* Wait the time selected by user
            if (messageButton.success === true) {
                if (messageButton.customId === "13h30") {
                    // Calculate time until 13:30
                    const now = new Date();
                    const targetTime = new Date();
                    targetTime.setHours(13, 30, 0, 0);

                    // If 13:30 already passed today, schedule for tomorrow
                    if (targetTime <= now) {
                        //FIXME - use the waitNextDay function of DateTimeManager
                        targetTime.setDate(targetTime.getDate() + 1);
                    }

                    const waitTime = targetTime.getTime() - now.getTime();

                    logInfo(
                        `Scheduling reminder for 13:30 (in ${Math.round(
                            waitTime / 1000 / 60
                        )} minutes)`
                    );

                    await sleep(waitTime);
                    setTimeout(async () => {
                        logInfo("Reminder: It's 13:30!");
                    }, waitTime);
                } else {
                    // Handle minutes (5min, 10min, etc.)
                    const waitTime = messageButton.timeout * 60 * 1000;

                    logInfo(
                        `Scheduling reminder for ${messageButton.timeout} minutes`
                    );

                    await sleep(waitTime);
                    logInfo(
                        `Reminder: ${messageButton.timeout} minutes have passed!`
                    );
                    logInfo(waitTime);
                }
            }
        }
    } else if (dtManager.getTime() > "16:00:00") {
        // FALSE - Check if time passed
        // TRUE (passed) - Lost streak
        logWarning("Lost Streak - Pass time");
        await lostStreak();
        return "time_passed";
    } else {
        // FALSE (not passed) - Wait the right hour
        logInfo(`Wait the right hour`);

        const waitTime = 60000 * 10;
        await sleepTime(waitTime);

        return "wait_right_hour";
    }
}

module.exports = { isTimeForMedicine };
