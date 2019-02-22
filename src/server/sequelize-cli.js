// this file is only used by sequelize-cli
// allowing some pre-operations, do not edit
require("./boot")

const seqHelpers = require("@hw-core/node-platform/src/libs/seqHelpers");

// return confs after boot
module.exports = seqHelpers.bootCli('@this/conf/database');