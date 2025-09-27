import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();
const TOKEN = "4ecc8fa8698648d18620ee191de0d057";

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "PINPOINT",
};

// const recipients = [
//   {
//     email: "airesmatos54@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
