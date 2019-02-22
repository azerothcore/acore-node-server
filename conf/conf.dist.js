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
    },
    databases: {
        default_auth: {
            include: ["account.js", "account_access.js"],
            exclude: ["version_db_auth.js"],
            adapters: "default_auth", // can be omitted, default will be used
            name: "azth_1_auth",
            user: "root",
            pass: "root",
        },
        default_world: {
            include: [],
            exclude: ["version_db_world.js","event_scripts.js", "spell_custom_attr.js", "spell_scripts.js"],
            adapters: "default_world", // can be omitted, default will be used
            name: "azth_1_world",
            user: "root",
            pass: "root",
        },
        default_chars: {
            include: [],
            exclude: ["version_db_characters.js", "account_data.js", "character_account_data.js", "quest_tracker.js"],
            adapters: "default_chars", // can be omitted, default will be used
            name: "azth_1_chars",
            user: "root",
            pass: "root"
        },
    },
    realms: [
        // realm 1 - malrag
        {
            id: 0,
            name: "default",
            dbconn: {
                "auth": "default_auth",
                "world": "default_world",
                "chars": "default_chars"
            }
        },
        {
            id: 1,
            name: "malrag",
            dbconn: {
                "auth": "ms_auth",
                "world": "ms_world",
                "chars": "ms_chars"
            }
        }
    ],
    modules: {
        exclude: []
    }
}
