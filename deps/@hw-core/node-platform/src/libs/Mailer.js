var nodemailer = require("nodemailer");

export default class Mailer {
    constructor(conf) {
        this.transporter = nodemailer.createTransport(conf);

        Object.freeze(this.transporter);
    }

    //change name of function sendMail in sendConfirmation
    sendConfirmation(_activationToken, _email) {
        try {
            const url = `http://${conf.host}:${conf.serverPort}/activation/${_email}/${_activationToken}`;

            let mailOptions = {
                subject: 'Confirmation Email',
                to: _email,
                from: '<demo@email.com>',
                html: `Hello, please click this <a href=${url}>confirmation link</a> to activate your account!`
            };

            return transporter.sendMail(mailOptions, (error, response) => {
                if (error) {
                    console.log(error + "\n");
                } else {
                    console.log("Email sent!");
                }
            })

        } catch (error) {
            console.log("Could not send activation mail: " + error);
        }
    }

    sendRecovery(_recoveryToken, _email) {
        try {
            const url = `http://${conf.host}:${conf.serverPort}/pass_recover/${_email}/${_recoveryToken}`;

            let mailOptions = {
                subject: 'Recovery password',
                to: _email,
                from: '<demo@email.com>',
                html: `Hello, please click this <a href=${url}>confirmation link</a> to change password for your account!`
            };

            return transporter.sendMail(mailOptions, (error, response) => {
                if (error) {
                    console.log(error + "\n");
                } else {
                    console.log("Email sent!");
                }
            })

        } catch (error) {
            console.log("Could not send recovery mail: " + error);
        }
    }


    sendPassword(pass, _email) {
        try {

            let mailOptions = {
                subject: 'New password changed',
                to: _email,
                from: '<demo@email.com>',
                html: `Hello, this is the new password <strong>${pass}</strong> for your account!`
            };

            return transporter.sendMail(mailOptions, (error, response) => {
                if (error) {
                    console.log(error + "\n");
                } else {
                    console.log("Email sent!");
                }
            })

        } catch (error) {
            console.log("Could not send new password mail: " + error);
        }
    }
}
