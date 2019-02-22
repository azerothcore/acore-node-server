import express from 'express';

import path from 'path';
import bodyParser from "body-parser"
import cors from "cors"

/**
 * 
 * @param {*} conf 
 * @returns {express.Express}
 */
function appFactory(conf) {
    var app = express();

    if (conf.useCors)
        app.use(cors());

    app.use(bodyParser.json(conf.bodyParser.json));

    // Static path for uploads
    app.use(express.static(path.resolve() + '/srv'));
    return app;
}

export default appFactory;
