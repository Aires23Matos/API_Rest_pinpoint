export const VERIFICATION_EMAIL_TEMPLATE=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifique o seu e-mail</title>
</head>
<body style="font-family:Arial, sans-serif; line-height: 1.6; color:#333; max-width: 600px; margin:0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; ">Verifique o seu e-mail</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <p>Olá,</p>
        <p>Obrigado por se inscrever! O seu código de verificação é:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4caf50;">{verificationCode}</span>
        </div>
        <p>Introduza este código na página de verificação para concluir o seu registo.</p>
        <p>Este código expirará em 15 minutos por razões de segurança.</p>
        <p>Se você não criou uma conta conosco, ignore este e-mail.</p>
        <p>Best regards,<br>A sua Equipa de Aplicação</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size:0.8em;">
        <p>Esta é uma mensagem automatizada, por favor, não responda a este e-mail.</p>
    </div>
</body></html>`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de senha bem-sucedida</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4caf50, #49a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Redefinição de senha bem-sucedida</h1>
    </div>
    <div style="background-color: #f9f9ff; padding: 20px; border-radius: 0 0 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <p>Hello,</p>
        <p>Estamos escrevendo para confirmar que sua senha foi redefinida com sucesso.</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #4caf50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size:  30px;">
                ✔️
            </div>
        </div>
        <p>Se você não iniciou essa redefinição de senha, por favor, cintact nossa equipe de suporte imediatamente.</p>
        <p>Por razões de suceridade, recomendamos que você:</p>
        <ul>
            <li>Use uma senha forte e exclusiva</li>
            <li>Habilite a autenticação de dois fatores, se disponível</li>
            <li>Evite usar a mesma senha em vários sites</li>
        </ul>
        <p>Obrigado por nos ajudar a proteger a sua conta.</p>
        <p>Best regards, <br>A sua Equipa de Aplicação</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>Esta é uma mensagem automatizada, por favor, não responda a este e-mail.</p>
    </div>
</body>
</html>`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir sua senha</title>
</head>
<body style="font-family: Arial,sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding:  20px;">
    <div style="background: linear-gradient(to right, #4caf50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Redefinir sua senha</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <p>Olá,</p>
        <p>Recebemos um pedido para redefinir sua senha. Se você não fez este pedido, por favor, ignore este pedido, por favor ignore este e-mail.</p>
        <p>Para redefinir sua senha, clique no botão abaixo: </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{resetURL}" style="background-color: #4caf50; color: white; padding: 12px 20px; text-decoration: none;
            border-radius: 5px; font-weight: bold; ">Redefinir senha</a>
        </div>
        <p>Este link expirará em 1 hora por motivos de segurança.</p>
        <p>Best regards,<br>A sua Equipa de Aplicação</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>Esta é uma mensagem automatizada, por favor, não responda a este e-mail.</p>
    </div>
</body>
</html>;`
