import {object} from '@azerothcore/js-common';
import _confDef from './dist/conf.js';

/** @type {_confDef} */
let mConf;
try {
  // eslint-disable-next-line
  // @ts-ignore
  // eslint-disable-next-line
  const _conf = require('./conf.js');

  let toMerge;
  if (_conf.default) {
    toMerge = _conf.default;
  } else {
    toMerge = _conf;
  }

  delete _confDef.default;

  mConf = object.mergeDeep(_confDef, toMerge);
} catch (ex) {
  mConf = _confDef;
}

export const conf = mConf;

export const noderouter = mConf.noderouter;
