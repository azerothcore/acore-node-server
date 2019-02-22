// it allows,  together with .babelrc, import/export ES6 syntax
// working on nodejs via babel.
// Waiting for full nodejs support.
function boot(babelConf = {}) {
    require('dotenv').config();

    require('module-alias/register');

    require("@babel/register")(babelConf)
}


module.exports = boot;
