import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{email}];

  try{
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verifique o seu e-mail',
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Verificação de e-mail"
    }).then(console.log, console.error);

    console.log("E-mail enviado com sucesso", response);
  }catch(error){
    console.log(`Erro ao enviar verificação`, error);

    throw new Error(`Erro ao enviar e-mail de verificação: ${error}`);
  }
}

export const sendWelcomeEmail = async(email, name) => {
  const recipient = [{email}];
  try{
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: process.env.MAILTRAP_TOKEN,
      template_variables: {
        company_info_name: "Test_Company_info_name",
        name: name
      }

    }).then(console.log, console.error);

    console.log("Email de boas-vindas enviado com sucesso", response);
  }catch(error){
    console.log(`Erro ao enviar verificação`, error);

    throw new Error(`Erro ao enviar e-mail de verificação: ${error}`);
  }
}

export const sendPasswordResetEmail = async(email, resetURL) => {
  const recipient = [{email}];

  try{
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset"
    })

    console.log("Redefinir enviado com êxito", response);
  }catch(error){
    console.error(`Erro ao enviar e-mail de redefinição de senha`, error);

    throw new Error(`Erro ao enviar e-mail de redefinição de senha: ${error}`);

  }
}

export const sendResetSuccessEmail = async(email) => {
  const recipient = [{email}];

  try{
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    })

    console.log("Com sucesso", response);
  }catch(error){
    console.error(`Erro ao reenviar e-mail de redefinição de senha`, error);

    throw new Error(`Erro ao reenviar e-mail de redefinição de senha: ${error}`);
  }
}
