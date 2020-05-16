import {CustomErrors} from '@/logic/CustomErrors';

/**
 * @param _appModels
 * @param _id
 * @param _recoveryToken
 * @param _activationToken
 */
export async function syncWithGame(_appModels, _id, _recoveryToken, _activationToken) { // must be moved in a common file
  const exist = await _appModels.User.findOne({
    where: {
      id: _id,
    },
  });
  if (exist) {
    return await _appModels.User.update({
      id: _id,
      recoveryToken: _recoveryToken,
      activationToken: _activationToken,
    });
  } else {
    return await _appModels.User.create({
      id: _id,
      recoveryToken: _recoveryToken,
      activationToken: _activationToken,
    });
  }
}

/**
 * @param pass
 */
export function isPasswordValid(pass) {
  if (pass.length < 5) throw new Error(CustomErrors.invalidPasswordFormat_Small);
  else if (pass.length > 16) throw new Error(CustomErrors.invalidPasswordFormat_Long);
}

/**
 * @param username
 */
export function isUsernameValid(username) {
  if (username.length < 4) throw new Error(CustomErrors.invalidUsernameFormat_Small);
  else if (username.length > 16) throw new Error(CustomErrors.invalidUsernameFormat_Long);
}

/**
 * @param email
 */
export function isEmailValid(email) {
  if (email.length < 5) throw new Error(CustomErrors.invalidEmailFormat_Small);
  else if (email.length > 64) throw new Error(CustomErrors.invalidEmailFormat_Long);
}

/**
 * @param str
 */
export function normalizeCredentials(str) { // "città" ---> "CITTà"
  let newStr = '';
  for (let i = 0; i < str.length; i++) {
    newStr += str[i].match(/[A-Za-z]/g) ? str[i].toUpperCase() : str[i];
  }
  return newStr;
}
