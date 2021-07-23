const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9c80f586af8744",
      pass: "e8b69e565b1e7b",
    },
  });

  const mailOptions = {
    from: "priyamkhatri1998@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  try {
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendMail;
