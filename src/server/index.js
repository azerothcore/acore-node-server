// !!!DO NOT EDIT!!!
// this file is the bootstrap code for server

require("../../apps/installer/installer") // cannot use module alias here

require("./boot")

// Import the rest of our application.
module.exports = require('./master.js')