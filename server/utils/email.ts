import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // TLS = false, STARTTLS activé
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

export const sendConfirmationEmail = async (to: string, token: string) => {
  const confirmationUrl = `http://localhost:5001/api/v1/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.DEFAULT_FROM_EMAIL,
    to,
    subject: "Confirmez votre inscription - AgriSem",
    html: `
      <h2>Bienvenue sur AgriSem </h2>
      <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour confirmer votre compte :</p>
      <a href="${confirmationUrl}" target="_blank">Confirmer mon compte</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `http://localhost:5000/auth/reset?token=${token}`;
  const mailOptions = {
    from: process.env.DEFAULT_FROM_EMAIL,
    to,
    subject: "Réinitialisation de votre mot de passe - AgriSem",
    html: `
      <h2>Réinitialisation du mot de passe</h2>
      <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
      <a href="${resetUrl}" target="_blank">Réinitialiser mon mot de passe</a>
      <p><small>Ce lien expire dans 1 heure.</small></p>
    `,
  };
  await transporter.sendMail(mailOptions);
};
