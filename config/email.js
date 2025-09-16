// config/email.js
const nodemailer = require("nodemailer");

let transporter = null;
const useEthereal = process.env.USE_ETHEREAL === "true";

async function getTransporter() {
  if (transporter) return transporter;

  if (useEthereal) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return transporter;
}

/**
 * sendEmail({to, subject, text, html})
 * returns { info, previewUrl } (previewUrl present only for Ethereal)
 */
async function sendEmail({ to, subject, text, html }) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });

  let previewUrl;
  if (useEthereal) {
    previewUrl = nodemailer.getTestMessageUrl(info); // xem preview (dev)
  }

  return { info, previewUrl };
}

module.exports = { sendEmail };
