require('module-alias/register');

require("@babel/register")({})

require('child_process').execSync(
    'npx sequelize db:create',
    { stdio: 'inherit' }
);

require("./bootstrap.js");