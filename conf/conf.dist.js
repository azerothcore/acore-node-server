export default {
    host: 'localhost',
    serverPort: 4000,
    clientPort: 3000,
    secret: "&$fx#W*!aRlh^LvfYA",
    captchaKey: "replace_key_here",
    express: {
        useCors: true,
        bodyParser: {
            json: {
                limit: '1mb'
            }
        }
    },
    mailer: {
        service: "gmail",
        port: 993,
        auth: {
            user: "",
            pass: ""
        }
    }
}
