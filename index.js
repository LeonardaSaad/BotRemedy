const { Client, Events, GatewayIntentBits } = require("discord.js");

const { token, user_id } = require("./config.json");
const Messages = require("./messages.json");

const { getUser } = require("./services/getUser");
const { DateTimeManager } = require("./services/DateTimeManager");
const { getActualStreakId } = require("./db/getActualStreakId");
const { getStreakBeenUpdatedToday } = require("./services/getStreakBeenUpdatedToday");
const { selectApi } = require("./db/selectApi");
const { getLastId } = require("./db/getLastId");
const { updateApi } = require("./db/updateApi");
const { sendMessage } = require("./services/sendMessage");
const { logInfo, logError, logWarning, logSuccess } = require("./logMessages");
const { sendMessageButton } = require("./services/sendMessageButton");
const { isTimeForMedicine } = require("./services/isTimeForMedicine");

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessagePolls,
        GatewayIntentBits.MessageContent,
    ],
});

const dtManager = new DateTimeManager();



async function startBotMonitoringLoop() {
    logInfo("Start bot monitoring loop.");

    while (true) {
        const medicationStreaks = await selectApi(
            "medication_streaks",
            "actual_streak_id"
        );
        const actualStreaksId = medicationStreaks[0].actual_streak_id;

        const actualStreakIdStatus = await getActualStreakId();

        if (!actualStreakIdStatus) {
            logError("Actual streak id don't exist");

            const lastId = await getLastId();

            await updateApi(
                "medication_streaks",
                "id",
                "c276cc79-dfd4-4daa-bb73-0ab8ea81b1d0",
                { actual_streak_id: lastId }
            );

            continue;
        }

        const streakStatus = await getStreakBeenUpdatedToday(
            actualStreaksId,
            dtManager
        );

        if (streakStatus == "streak_lost") {
            //SECTION - Now is more then 16h
            //* Lost Streak
            logWarning(`It's past time to take the medicine.`);

            const daysCountResult = await selectApi(
                "streaks",
                "days_count",
                "streak_id",
                actualStreaksId
            );
            const daysCount = daysCountResult[0].days_count;
            await sendMessage(client, Messages.lostStreak, null, true, 100);
            await sendMessage(
                client,
                `Uma pena, mas sua streak era: ${daysCount}.`,
                null,
                null,
                100
            );
            await dtManager.awaitUntilNextDay();
            continue;
        } else if (streakStatus == "waited_for_next_day") {
            logSuccess(`Today was computed!`)
            await dtManager.awaitUntilNextDay();
            continue;
        } else if (streakStatus === "today_is_not_computed") {
            //SECTION - Check if it is time to take medicine
            // Call function
            const timeForMedicine = await isTimeForMedicine();

            



            continue;
        }

        if (
            dtManager.getTime() >= "10:00:00" &&
            dtManager.getTime() <= "16:00:00"
        ) {
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
                continue;
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
                    continue;
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

                continue;
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
                    continue;
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

                continue;
            }
        } else if (dtManager.getTime() < "10:00:00") {
            //SECTION - Lost streak
            logInfo(`Waiting for the right hour.`);
            const waitTime = 60000 * 10;
            await sleep(waitTime);

            continue;
        } else {
            continue;
        }
    }
}

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const user = getUser(client, user_id);

    if (!user) {
        console.log(`[${dtManager.getTime()}]`, "error to get the user");
    }

    logInfo(`User founded: ${user.username}`);

    startBotMonitoringLoop();
});

client.login(token);
