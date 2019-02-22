require('dotenv').config();

require('module-alias/register');

require("@babel/register")({})


// Import the rest of our application.
module.exports = require('./generator.js')
