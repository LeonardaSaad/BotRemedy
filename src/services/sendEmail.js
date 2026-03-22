const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_APIKEY);

async function sendEmail(error) {
    const html = `${error}`;

    try {
        resend.emails.send({
            from: "onboarding@resend.dev",
            to: "leonardassaad777@gmail.com",
            subject: "BotRemedy Error",
            html: html,
        });
    } catch (error) {
        console.error(error);
    }
}

module.exports = {sendEmail};
