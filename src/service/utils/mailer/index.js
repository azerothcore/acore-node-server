import nodemailer from 'nodemailer';
import {config} from '@config';
import ejs from 'ejs';

export var mailer = null;

export default class Mailer {
  constructor(config) {
    this.transporter = nodemailer.createTransport(config);

    Object.freeze(this.transporter);
  }

  static getInstance() {
    if (!mailer) {
      throw Error('No mailer found!');
    }
    return mailer;
  }

  static initialize(config) {
    mailer = new Mailer(config);
  }

  // change name of function sendMail in sendConfirmation
  sendConfirmation(
      _activationToken,
      _email,
      _id,
      activationPage = 'activation',
  ) {
    try {
      const url = `${conf.clientUrl}/${activationPage}/${_id}/${_activationToken}`;

      const mailOptions = {
        subject: 'Confirmation Email',
        to: _email,
        from: '<demo@email.com>',
        html: `Hello, please click the confirmation link below to activate your account! <br>
                        ${url}`,
      };

      return this.transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          console.log(error + '\n');
        } else {
          console.log('An Email has been sent to ' + _email);
        }
      });
    } catch (error) {
      console.log('Could not send activation mail: ' + error);
    }
  }

  sendRecovery(_recoveryToken, _email, _recoveryPage = 'pass_recover') {
    try {
      const url = `${conf.clientUrl}/${_recoveryPage}/${_email}/${_recoveryToken}`;

      const mailOptions = {
        subject: 'Recovery password',
        to: _email,
        from: '<demo@email.com>',
        html: `Hello,  please click the confirmation link below to change password for your account! <br>
                        ${url}`,
      };

      return this.transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          console.log(error + '\n');
        } else {
          console.log('An Email has been sent to ' + _email);
        }
      });
    } catch (error) {
      console.log('Could not send recovery mail: ' + error);
    }
  }

  async sendPassword(pass, _email) {
    const data = await ejs.renderFile(
        __dirname + '/templates/newPassword.ejs',
        {
          password: pass,
        },
    );

    try {
      const mailOptions = {
        subject: 'New password changed',
        to: _email,
        from: '<demo@email.com>',
        html: data,
      };

      return this.transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          console.log(error + '\n');
        } else {
          console.log('An Email has been sent to ' + _email);
        }
      });
    } catch (error) {
      console.log('Could not send new password mail: ' + error);
    }
  }

  sendMail(name, message, fromEmail, toEmail) {
    try {
      const mailOptions = {
        subject: 'Contact Form',
        to: toEmail,
        from: fromEmail,
        html: `New message from: ${name}<br/>Email ${fromEmail}<br/>Message: ${message}`,
      };

      return this.transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          console.log(error + '\n');
        } else {
          console.log('Contact form email sent');
        }
      });
    } catch (error) {
      console.log('Could not send new password mail: ' + error);
    }
  }
}
