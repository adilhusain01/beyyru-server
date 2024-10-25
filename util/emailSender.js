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

const sendEmail = async (name, email, message, isNewsLetter) => {
  try {
    // If isNewsLetter is provided, send a thank you email to User only
    if (isNewsLetter) {
      const thankYouMailOptions = {
        from: 'chopanm093@gmail.com', // Your email (to send messages)
        to: email, // Subscriber's email
        subject: 'NewsLetter', // Subject line
        html: `<p>Thanks for Subscribing to Our NewsLetter</p>`, // HTML body
      };

      await transporter.sendMail(thankYouMailOptions);
      console.log('Thank you email sent to: ' + email);
    } else {
      //SEND THE EMAIL TO ADMIN AND USER
      const mailOptionsToUser = {
        from: 'chopanm093@gmail.com', // Sender's email
        to: email, // Your email (to receive messages)
        subject: `Thanks ${name} for contact Beyyru`, // Subject line
        text: message, // Plain text body
        html: `<p>We will reach you out as soon as possible</p>`, // HTML body
      };

      const mailOptionsToAdmin = {
        from: email, // Sender's email
        to: 'chopanm093@gmail.com', // Your email (to receive messages)
        subject: `Message from ${name}`, // Subject line
        text: message, // Plain text body
        html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`, // HTML body
      };

      // Send email
      const info1 = await transporter.sendMail(mailOptionsToAdmin);
      const info2 = await transporter.sendMail(mailOptionsToUser);
      console.log('Email sent to Admin: ' + info1.response);
      console.log('Email sent to User: ' + info2.response);
    }
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
  }
};

module.exports = { sendEmail };
