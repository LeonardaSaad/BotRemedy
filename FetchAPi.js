require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://hkdgkaqdwfgcxgjyvnjo.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

const { DateTimeManager } = require("./DateTimeManager");
const dtManager = new DateTimeManager();

async function fetchApi() {
  try {
    if (!supabaseUrl) {
      console.error(
        `[${dtManager.getTime()}]`,
        'Error: "supabaseURL" not found!'
      );
    }
    if (!supabaseKey) {
      console.error(
        `[${dtManager.getTime()}]`,
        'Error: "supabaseKey" not found!'
      );
    }

    const supabase = await createClient(supabaseUrl, supabaseKey);

    return supabase;
  } catch (error) {
    console.error("Error fetchApi:", error);
    return error;
  }
}

module.exports = { fetchApi };
