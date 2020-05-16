import _confDef from './dist/conf.js';
import _dbConfDef from './dist/database.js';

import {object} from '@azerothcore/js-common';

/**
 * @param confPath
 * @param defConf
 */
function getUserConf(confPath, defConf) {
  /** @type {_confDef} */
  let mConf;
  try {
    // eslint-disable-next-line
    // @ts-ignore
    // eslint-disable-next-line
    const _conf = require(confPath);

    let toMerge;
    if (_conf.default) {
      toMerge = _conf.default;
    } else {
      toMerge = _conf;
    }

    delete _confDef.default;

    mConf = object.mergeDeep(defConf, toMerge);
  } catch (ex) {
    mConf = _confDef;
  }

  return mConf;
}

export const conf = getUserConf('./conf.js', _confDef);

export const dbConf = getUserConf('./database.js', _dbConfDef);


