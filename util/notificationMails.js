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

const sendEmail = async (name, email, message, type) => {
  try {
    let mailOptions;

    switch (type) {
      case 'newsletter':
        mailOptions = {
          from: 'chopanm093@gmail.com', // Your email (to send messages)
          to: email, // Subscriber's email
          subject: 'Newsletter', // Subject line
          html: `<p>Thanks for Subscribing to Our Newsletter</p>`, // HTML body
        };
        break;

      case 'blog':
        mailOptions = {
          from: 'chopanm093@gmail.com', // Your email (to send messages)
          to: email, // Subscriber's email
          subject: 'New Blog Post', // Subject line
          html: `<p>A new blog post has been published: ${message}</p>`, // HTML body
        };
        break;

      case 'product':
        mailOptions = {
          from: 'chopanm093@gmail.com', // Your email (to send messages)
          to: email, // Admin's email
          subject: 'Product Out of Stock', // Subject line
          html: `<p>The following products are out of stock: ${message}</p>`, // HTML body
        };
        break;

      default:
        throw new Error('Invalid email type');
    }

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Error sending email');
  }
};

module.exports = { sendEmail };
