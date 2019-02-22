import * as account from "./account"

function schemaAdapter(model) {
    account.schemaAdapter(model);
}

function dbAdapter(sequelize, models) {
    account.dbAdapter(sequelize, models);
}

export {
    schemaAdapter,
    dbAdapter
}
