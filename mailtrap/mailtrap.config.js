import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();
const TOKEN = process.env.MAILTRAP_TOKEN_PINPOINT;

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "geral@pinpoitech.com",
  name: "PINPOINT",
};

// const recipients = [
//   {
//     email: "airesmatos54@gmail.com",
//   }
// ];

// mailtrapClient
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
