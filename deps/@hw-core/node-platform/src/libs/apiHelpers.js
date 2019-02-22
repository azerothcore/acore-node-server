import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

import toArray from 'stream-to-array';
import util from "util";
import fs from "fs";
import base64ToImage from 'base64-to-image';

import * as sys from "./sysUtil"

export const ROLES = {
    ROLE_USER: 0,
    ROLE_ADMIN: 1
}

const srvfolder = "srv/";
const validMimeType = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp'];

function checkLevel(user, levels) {
    return levels.indexOf(user.role) >= 0;
}

function getToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer g1jipjgi1ifjioj
        // Handle token presented as a Bearer token in the Authorization header
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        // Handle token presented as URI param
        return req.query.token;
    } else if (req.cookies && req.cookies.token) {
        // Handle token presented as a cookie parameter
        return req.cookies.token;
    }
}

export function verifyToken(req, secret) {
    let token = getToken(req);

    if (!token) {
        return null;
    }

    return jwt.verify(token, secret, (err, decoded) => {
        if (err) throw new Error('Fail to Authentication. Error -> ' + err);

        return decoded;
    });
}

export function ownDataFilter(models, relModel, userKey, relKey) {
    return async function (obj, data, context, info) {
        let id = data.where ? data.where.id : data.id;

        if (sys.noAuth || checkLevel(context.user, [ROLES.ROLE_ADMIN]))
            return Promise.resolve();

        if (!id) {
            if (obj && obj.constructor.name == relModel && obj[relKey])
                id=obj[relKey];
            else
                return Promise.reject("You cannot see all data of this query, use a specific id!");
        }

        let res = await models[relModel].findOne({
            where: {
                [userKey]: context.user.id,
                [relKey]: id
            }
        });

        if (!res)
            return Promise.reject("This element is not for you!");

        return Promise.resolve();
    }
}
/**
 * Middleware for SequelizeGraphql scheme
 *
 * @async
 * @callback SGSMiddleware
 * @param {Object} obj
 * @param {Object} data
 * @param {Object} context
 * @param {Object} info
 * @returns {Promise} Promise object representing the resolve/rejection result
 */

/**
 * Middleware for sequelize-graphql-schema hooks
 * @param {ROLES[]} roles 
 * @param {SGSMiddleware} [filter=undefined] - function to filter isAllowed result
 */
export function isAllowed(roles, filter) {
    return async (obj, data, context, info) => {
        if (sys.noAuth)
            return Promise.resolve();

        if (!context.user) throw Error("User not found");
        if (!checkLevel(context.user, roles)) throw Error("Permission denied for user:" + context.user.id);

        if (filter) {
            return await filter(obj, data, context, info);
        }

        return Promise.resolve();
    }
}

/**
 * Function rebuild an image from a Stream and 
 * it checks if the mime type is correct
 * Images can be a base64 String or Graphql Upload type
 * 
 * filename:  img-<userid>-<timestamp>.<ext>
 * 
 * @param {string}   model          name of the model.
 * @param {string}   path           path where to save the file.
 */
export function uploadFile(model, path) {

    // init folder if not exists
    fs.mkdir(srvfolder+path, { recursive: true }, (err) => {
        if (err) throw err;
    });

    return async (obj, data, context, info) => {
        if (data[model].picture) {
            var _filename = 'img' + '-' + context.user.id + '-' + Date.now();

            if (data[model].picture.file) {
                const {
                    createReadStream,
                    filename,
                    mimetype,
                    encoding
                } = await data[model].picture.file;

                if (!validMimeType.includes(mimetype)) {
                    throw new Error('Wrong image type');
                }

                // extract file extension from filename
                let ext = '.' + filename.substr(filename.lastIndexOf('.') + 1);
                _filename += ext;

                var buf = "";

                var parts = await toArray(createReadStream())
                const buffers = parts
                    .map(part => util.isBuffer(part) ? part : Buffer.from(part));
                buf = Buffer.concat(buffers);

                await fs.writeFile(srvfolder + path + _filename, buf, (err) => {
                    if (err) throw err;
                    console.log(_filename + ' has been saved!');
                });

                data[model].picture = path + _filename;
            } else if (data[model].picture.encoded) {
                base64ToImage(data[model].picture.encoded, srvfolder + path, {
                    'fileName': _filename,
                    'error': (err) => {
                        if (err) throw err;
                    }
                });
                let ext = data[model].picture.encoded.substring("data:image/".length, data[model].picture.encoded.indexOf(";base64"));
                data[model].picture = path + _filename + '.' + ext;
            } else if (data[model].picture.encoded == '') {
                throw "Encoded string empty";
            }

        }
        return Promise.resolve();
    }
}

/**
 * 
 * @param  {...SGSMiddleware} middlewares - List of middlewares as a promise chain
 * @returns {Promise}
 */
export function applyMiddlewares(...middlewares) {
    return async (obj, data, context, info) => {
        try {
            for (let k in middlewares) {
                let mid = middlewares[k];
                await mid(obj, data, context, info);
            };
        } catch (err) {
            return Promise.reject(err);
        }

        return Promise.resolve();
    }
}

/**
 * @typedef {Object} cryptPassResult
 * @property {string} hash - Hash concat. with password
 * @property {string} pass - Crypted password
 * @property {number} saltRound - crypting rounds
 */
/**
 * 
 * @param {string} password 
 * @returns {cryptPassResult}
 */
export async function cryptPass(password) {
    const saltRounds = 8;

    const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var pass = hash + ":" + password;
    //async
    pass = await bcrypt.hash(pass, saltRounds); //hashed password

    return {
        hash,
        pass,
        saltRounds,
    }
}


/**
 * This filter check if the user set in server context (logged with jwt) is the same
 * subject of the query/mutation. It allows you to avoid fetching/editing of data not
 * owned by the user.
 * 
 * @param {string} [model=undefined] : model name where get the field about user id (field parameter)
 * @param {string} [field=undefined] : you can specify model and field where retrieve userid from mutation data,
 *  otherwise it tries to get from where
 * @returns {SGSMiddleware} Middleware for graphql hooks/api
 */
export function sameUser(model, field) {
    return (obj, data, context, info) => {
        let id;
        if (model && field && data[model][field]) {
            id = data[model][field];
        } else {
            id = data.where ? (field ? data.where[field] : data.where.id) : data.id;
        }

        if (sys.noAuth || checkLevel(context.user, [ROLES.ROLE_ADMIN]) || context.user.id == id) {
            return Promise.resolve();
        }

        throw Error("Only admin or owner are authorized here!");
    }
}


/**
 * This function create a 8 characters random string
 * 
 * @param {}
 * 
 * @returns {String} 8 char string
 */
export function random() {
    var anysize = 8;
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; //from where to create
    var result = "";
    for (var i = 0; i < anysize; i++)
        result += charset[Math.floor(Math.random() * charset.length)];

    return result;
}