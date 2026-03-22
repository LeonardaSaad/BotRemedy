require("dotenv").config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  userId: process.env.USER_ID,
  // reminderCron: process.env.REMINDER_CRON || "0 8,12,20 * * *"
  reminderCron: process.env.REMINDER_CRON || "*/1 * * * *",
  supabaseEmail: process.env.SUPABASE_EMAIL,
  supabasePassword: process.env.SUPABASE_PASSWORD,
};

