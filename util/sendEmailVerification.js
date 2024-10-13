const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Correct Gmail SMTP server
  port: 465, // Use port 465 for SSL or 587 for TLS
  secure: true, // Set to true for port 465 (SSL)
  auth: {
    user: 'chopanm093@gmail.com', // your SMTP username
    pass: 'tqgocvtxqsowakcj', // your SMTP password
  },
});

const sendEmail = async (email, subject, text) => {
  try {
    const mailOptions = {
      from: 'chopanm093@gmail.com', // Sender's email
      to: email, // Your email (to receive messages)
      subject: subject, // Subject line
      text: text, // Plain text body
    };

    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
  } catch (error) {
    console.log('Email not sent : ', error);
    console.error(error);
  }
};

module.exports = { sendEmail };
