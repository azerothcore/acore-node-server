import _confDef from './dist/conf.js';
import _conf from './conf.js';

import _dbConfDef from './dist/database.js';
import _dbConf from './database.js';

// avoid circular error
delete _confDef.default;
delete _conf.default;

delete _dbConfDef.default;
delete _dbConf.default;

/**
 * @param item
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * @param target
 * @param source
 */
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, {[key]: source[key]});
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, {[key]: source[key]});
      }
    });
  }
  return output;
}

export const conf = mergeDeep(_confDef, _conf);
export const dbConf = mergeDeep(_dbConfDef, _dbConf);
