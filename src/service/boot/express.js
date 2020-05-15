import {config} from '@config';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(bodyParser.json(config.express.bodyParser));
if (config.express.cors) {
  app.use(cors());
}


app.get('/', function(req, res) {
  console.log(req);
  res.send('Hello World!');
});


export {app};
