const nodemailer = require('nodemailer');

// Configure the transporter for SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Correct Gmail SMTP server
    port: 465, // Use port 465 for SSL or 587 for TLS
    secure: true, // Set to true for port 465 (SSL)
    auth: {
        user: 'chopanm093@gmail.com', // your SMTP username
        pass: 'tqgocvtxqsowakcj', // your SMTP password
  },
  
});

const sendEmail = async (name, email, message) => {
  try {
    const mailOptions = {
      from: email, // Sender's email
      to: 'chopanm093@gmail.com', // Your email (to receive messages)
      subject: `Message from ${name}`, // Subject line
      text: message, // Plain text body
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`, // HTML body
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
  }
};

module.exports = { sendEmail };
