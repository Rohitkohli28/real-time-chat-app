const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, text, html }) => {
  try {
    // For production, use a real SMTP service (SendGrid, AWS SES, Gmail App Passwords)
    // For now, we will assume standard SMTP configuration via env vars
    
    // Fallback to ethereal if no config is provided (for dev)
    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Generate test SMTP service account from ethereal.email
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      console.warn("Using Ethereal Email for dev! Setup SMTP env vars for production.");
    }

    const info = await transporter.sendMail({
      from: `"ChatApp Auth" <no-reply@chatapp.com>`,
      to: email,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error("Email send failed: ", error);
    return false;
  }
};

module.exports = sendEmail;
