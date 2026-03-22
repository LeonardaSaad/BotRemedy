const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseEmail = process.env.SUPABASE_EMAIL;
const supabasePassword = process.env.SUPABASE_PASSWORD;

async function fetchApi() {
    try {
        if (!supabaseKey || !supabaseUrl) {
            console.error("Erro no fetchApi. Faltam parêmetros");
        }

        const supabase = await createClient(supabaseUrl, supabaseKey);

        // Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: supabaseEmail,
            password: supabasePassword,
        });

        if (error) {
            console.error("[authApi] %d", error);
        }

        const accessToken = data.session["access_token"];
        const refreshToken = data.session["refresh_token"];

        await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        
        return supabase;
    } catch (error) {
        console.error("Error fetchApi:", error);
        return error;
    }
}

module.exports = { fetchApi };
