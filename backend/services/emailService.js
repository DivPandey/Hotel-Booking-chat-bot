const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendConfirmationEmail(email, bookingDetails) {
  const { bookingId, fullName } = bookingDetails;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Booking Confirmation',
    text: `Thank you for your booking! Your booking details:\n\nBooking ID: ${bookingId}\nGuests: ${fullName.join(', ')}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

module.exports = { sendConfirmationEmail };
