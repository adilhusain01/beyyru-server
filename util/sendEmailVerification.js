const nodeMailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.MAILGUN_HOST,
      port: process.env.MAILGUN_PORT,
      secure: false,
      auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASS,
      },
    });

    await transporter.sendMail({
      from: 'postmaster@adilhusain.live',
      to: email,
      subject: subject,
      text: text,
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.log('Email not sent : ', error);
    console.error(error);
  }
};

module.exports = sendEmail;
