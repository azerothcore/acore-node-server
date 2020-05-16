// import fs from 'fs';
// import path from 'path';

/**
 * README:
 * If you need to change some configuration in a safe way, please use
 * the .env file
 *
 * However, if you want to need the full control, you can copy this file
 * inside the /conf/ folder. The default export will be merged with
 * values of /conf/dist/conf.js, so you can also directly change the
 * needed variables without copying the entire content of this file.
 */
const serviceName = process.env.SERVICE_NAME || 'acore-node-server';
const apiPrefix = process.env.API_PREFIX || '/';

const conf = {
  serviceName,
  apiPrefix,
  ssl: {
    enabled:
      process.env.HTTPS === '1' && process.env.NODE_ENV === 'development',
  },
  express: {
    useCors: true,
    bodyParser: {
      json: {
        limit: '1mb',
      },
    },
  },
  mailer: {
    service: 'gmail',
    port: 993,
    auth: {
      user: '',
      pass: '',
    },
  },
  port: parseInt(process.env.PORT) || 0, // 0 to automatically assign a port
  fastifyConf: {
    get https() {
      return conf.ssl.enabled ?
        {
          // key: fs.readFileSync(path.join(__dirname, remoteHost + '.pkey')).toString(),
          // cert: fs.readFileSync(path.join(__dirname, remoteHost + '.crt')).toString(),
          allowHTTP1: true,
        } :
        undefined;
    },
  },
};

export default conf;
