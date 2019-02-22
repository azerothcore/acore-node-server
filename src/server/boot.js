// use this file to configure boot process with babel and other
// dependencies that must run at very first start
// it allows,  together with .babelrc, import/export ES6 syntax
// working on nodejs via babel.
// Waiting for full nodejs support.

const path = require("path")

const rootPath=path.join(__dirname, "../../");

require("@hw-core/node-platform/src/server/boot")({
    root: rootPath,
    extends: './.babelrc',
})
