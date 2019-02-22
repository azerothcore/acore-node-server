import {
    isAllowed,
    sameUser,
    ROLES,
    cryptPass,
    applyMiddlewares,
    uploadFile,
    random
} from "@hw-core/node-platform/src/libs/apiHelpers";

import bcrypt from 'bcrypt';

import config from "@this/conf/conf.js"
import jsonwebtoken from 'jsonwebtoken';
import {
    Mailer
} from "@hw-core/node-platform";
import { server } from "@this/src/server/server";

const reference_folder = "upload/users"

/**
 * @instance
 * @param {Sequelize} sequelize 
 * @param {Sequelize} DataTypes 
 */
export default function (sequelize, DataTypes) {
    const mailer = new Mailer(config.mailer)
    const app = server.hwApolloServer.expressApp;

    /** @type {Sequelize.Model} */
    var User = sequelize.define('User', {

        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: '',
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            isEmail: true,
        },
        gender: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: '',
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        height: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        picture: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        // 0 -> registered user , 1 -> super admin
        role: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        hash: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        activationToken: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        recoveryToken: {
            type: DataTypes.STRING,
            defaultValue: '',
        },

    });

    User.graphql = {
        attributes: {
            exclude: { //changed
                create: ["hash", "role", "activationToken", "recoveryToken"],
                fetch: ["hash", "password", "activationToken", "recoveryToken"],
            },
            include: {
                picture: "pictureType"
            }
        },
        types: {
            login: {
                token: "String",
                role: "Int",
                id: "Int"
            },
            loginInput: {
                email: 'String!',
                password: 'String!'
            },
            recovery: {
                message: "String"
            },
            recoveryInput: {
                email: 'String!'
            }
        },
        before: {
            create: applyMiddlewares(
                async (obj, data, context, info) => {
                        //if(!captcha.verify()) throw new Error("Invalid Captcha"); 

                        var {
                            hash,
                            pass,
                            saltRounds,
                        } = await cryptPass(data.User.password);

                        data.User.hash = hash;
                        data.User.password = pass;

                        data.User.activationToken = await bcrypt.hash(data.User.email + ":" + data.User.hash, saltRounds); //hashes email token for activation
                        data.User.activationToken = data.User.activationToken.replace(/[/.]/g, ''); //to prevent slashes in the activation url

                        return Promise.resolve();
                    },
                    uploadFile("User", reference_folder)
            ),
            //add
            update: applyMiddlewares(
                isAllowed([ROLES.ROLE_USER, ROLES.ROLE_ADMIN], sameUser()),
                async (obj, data, context, info) => {
                        //if(!captcha.verify()) throw new Error("Invalid Captcha"); 
                        if (data.User.password) {
                            console.log("CRYPT OPERATION");
                            var {
                                hash,
                                pass,
                            } = await cryptPass(data.User.password);

                            data.User.hash = hash;
                            data.User.password = pass;
                        }

                        return Promise.resolve();
                    },
                    uploadFile("User", reference_folder)
            ),
            destroy: isAllowed([ROLES.ROLE_ADMIN]),
            fetch: isAllowed([ROLES.ROLE_USER, ROLES.ROLE_ADMIN], sameUser()),
        },
        extend: {
            create: async (obj, data, context, info) => {
                return mailer.sendConfirmation(obj.activationToken, obj.email);
            }
        },
        mutations: {
            login: {
                output: "login",
                input: "loginInput",
                resolver: async (obj, data, context, info) => {
                    var auth = false
                    //if(!captcha.verify()) throw new Error("Invalid Captcha");
                    var user = await User.findOne({
                        where: {
                            email: data.loginInput.email
                        },
                        attributes: ['password', 'hash', 'id', 'activationToken', "role"]
                    });

                    if (!user) throw new Error("Invalid Login");

                    var res = await bcrypt.compare(user.hash + ":" + data.loginInput.password, user.password);

                    if (!res) throw new Error("Invalid Login");
                    if (user.activationToken) throw new Error("Need activation");

                    var _token = jsonwebtoken.sign({
                        id: user.id
                    }, config.secret, {
                        expiresIn: '30d'
                    });
                    return {
                        token: _token,
                        role: user.role,
                        id: user.id
                    };
                }
            },
            userRecoverPass: {
                output: "recovery",
                input: "recoveryInput",
                resolver: async (obj, data, context, info) => {

                    const saltRounds = 8;
                    var user = await User.findOne({
                        where: {
                            email: data.recoveryInput.email
                        },
                        attributes: ['email', 'password', 'hash', 'id', 'activationToken', "role", "recoveryToken"]
                    });
                    if (!user) throw new Error("Invalid email");
                    if (user.activationToken) throw new Error("Account not actived yet");
                    user.recoveryToken = await bcrypt.hash(user.email + ":" + user.hash, saltRounds); //hashes email token for activation
                    user.recoveryToken = user.recoveryToken.replace(/[/.]/g, '').substring(0, 60); //to prevent slashes in the activation url
                    await User.update({
                        recoveryToken: user.recoveryToken
                    }, {
                        where: {
                            email: user.email
                        }
                    });

                    mailer.sendRecovery(user.recoveryToken, user.email);
                    return {
                        message: "Done"
                    };

                }


            }
        }
    };

    app.get("/activation/:email/:token", async (req, res) => {
        const prefix = "<body bgcolor='#eadbea'><br/><br/><br/><center><font size=5>";
        const suffix = "</font></center></body>"
        try {

            var user = await User.findOne({
                where: {
                    email: req.params.email
                },
                attributes: ['activationToken', 'hash']
            });

            if (!user) return res.send(prefix + "Error" + suffix);
            if (!user.activationToken) return res.send(prefix + "Already actived!" + suffix);
            if (req.params.token != user.activationToken) return res.send(prefix + "Error" + suffix);
            await User.update({
                activationToken: ""
            }, {
                where: {
                    email: req.params.email
                }
            })
        } catch (error) {
            console.log(error);
        }
        return res.send(prefix + "User activated successfully" + suffix);
    });

    //new rest function 
    app.get("/pass_recover/:email/:token", async (req, res) => {
        const prefix = "<body bgcolor='#eadbea'><br/><br/><br/><center><font size=5>";
        const suffix = "</font></center></body>"
        try {
            var user = await User.findOne({
                where: {
                    email: req.params.email
                },
                attributes: ['email', 'recoveryToken', 'hash']
            });

            if (!user) return res.send(prefix + "Error" + suffix);
            if (!user.recoveryToken) return res.send(prefix + "Already recovered!" + suffix);
            if (req.params.token != user.recoveryToken) return res.send(prefix + "Error" + suffix);
            var newPass = random();
            var {
                pass,
                hash
            } = await cryptPass(newPass);
            await User.update({
                recoveryToken: "",
                password: pass,
                hash: hash
            }, {
                where: {
                    email: req.params.email
                }
            })
        } catch (error) {
            console.log(error);
        }
        mailer.sendPassword(newPass, user.email);
        return res.send(prefix + " A new temporary password has been sent to your email" + suffix);
    });

    return User;
};