/**
 * @typedef Db
 * @property {import("sequelize").Model[]} models - models
 * @instance
 * @property {import("sequelize")} sequelize - sequelize
 */

/**
 * Middleware for SequelizeGraphql scheme
 *
 * @async
 * @callback SGSMiddleware
 * @param {Object} obj
 * @param {Object} data
 * @param {Object} context
 * @param {Object} info
 * @returns {Promise} Promise object representing the resolve/rejection result
 */

/**
 * @typedef {number} ROLES_ENUM
 **/

/**
 * @enum {ROLES_ENUM}
 */
import {ApolloError} from 'apollo-server';
import errors from './errors';

export const ROLES = {
  ROLE_USER: 0,
  ROLE_ADMIN: 1,
  ROLE_SUPERADMIN: 2,
};

const sys = {
  noAuth: false,
};

class ACL {
  constructor(field = 'role', roles) {
    this.field = field;
    this.roles = roles;
    const arr = Object.values(roles);
    this.min = Math.min(...arr);
  }

  setLimit(globalLimit) {
    // limit queries
    return async (obj, data, context, info) => {
      const limit = data.limit;

      if (limit <= globalLimit) return Promise.resolve();
      else if (!limit || limit >= globalLimit) {
        data.limit = globalLimit;
        return Promise.resolve();
      }

      throw Error('Limit exceeded');
    };
  }

  checkLevel(user, levels) {
    if (!Array.isArray(levels)) {
      return this.getLevel(user) >= levels;
    }

    return levels.indexOf(this.getLevel(user)) >= 0;
  }

  getLevel(user) {
    return user[this.field];
  }

  /**
   * This filter check if the user set in server context (logged with jwt) is the same
   * subject of the query/mutation. It allows you to avoid fetching/editing of data not
   * owned by the user.
   *
   * @param {string} [model=undefined] : model name where get the field about user id (field parameter)
   * @param {string} [field=undefined] : you can specify model and field where retrieve userid from mutation data,
   *  otherwise it tries to get from where
   * @returns {SGSMiddleware} Middleware for graphql hooks/api
   */
  sameUser(model, field) {
    return (obj, data, context, info) => {
      let id;
      if (model && field && data[model][field]) {
        id = data[model][field];
      } else {
        id = data.where ?
          field ?
            data.where[field] :
            data.where.id :
          data[field] ?
          data[field] :
          data.id;
      }

      if (context.user.id == id) {
        return Promise.resolve();
      }

      throw Error('Only admin or owner are authorized here!');
    };
  }

  /**
   * Middleware for sequelize-graphql-schema hooks
   *
   * @param {number[]|number} roles
   * @param {SGSMiddleware} [filter=undefined] - function to filter isAllowed result
   */
  isAllowed(roles, filter) {
    return async (obj, data, context, info) => {
      if (sys.noAuth) {
        return Promise.resolve();
      }

      if (!context.user) throw Error('User not found');
      if (!this.checkLevel(context.user, roles)) {
        throw Error('Permission denied for user:' + context.user.id);
      }

      if (filter) {
        return await filter(obj, data, context, info);
      }

      return Promise.resolve();
    };
  }

  /**
   * restric access to certain fields
   *
   * @param roles
   * @param inclusive
   * @param fields
   * @param roles
   * @param inclusive
   * @param fields
   * @param roles
   * @param inclusive
   * @param fields
   */
  fieldAccess(roles, inclusive, fields) {
    return async (obj, data, context, info) => {
      if (sys.noAuth) {
        return Promise.resolve();
      }
      if (!context.user) throw Error('User not found');
      if (!this.checkLevel(context.user, roles)) {
        throw Error('Permission denied for user:' + context.user.id);
      }

      const args = info.fieldNodes[0].selectionSet.selections.map(
          (selection) => selection.name.value,
      );
      if (inclusive) {
        // fields should contain all fields
        const intersec = fields.filter((value) => -1 !== args.indexOf(value));
        if (intersec.length === args.length) {
          return Promise.resolve();
        }
      } else {
        // fields contains banned fields
        const intersec = fields.filter((value) => -1 !== args.indexOf(value));
        if (intersec.lenght === 0) return Promise.resolve();
      }
      throw new ApolloError(
          errors.permission.message,
          `${errors.permission.code}`,
      ); // throw Error("You can't see these fields");
    };
  }

  sameUserHierachy(model, field, data, context) {
    console.log(data);
    console.log(model);
    console.log(field);
    let id;
    if (data && data.id) {
      id = data.id;
    } else if (model && field && data[model] && data[model][field]) {
      id = data[model][field];
    } else {
      id = data.where ?
        field ?
          data.where[field] :
          data.where.id :
        data[field] ?
        data[field] :
        data.id;
    }

    if (context.user.id == id) {
      return Promise.resolve();
    }

    throw Error('Only admin or owner are authorized here!');
  }

  checkPerm(perm, userRole, info, data, context) {
    let returnValue = false;
    if (perm[userRole]) {
      // fields requested
      const args = [];
      const s = info.fieldNodes[0].selectionSet.selections;
      for (const k in s) {
        if (!Object.prototype.hasOwnProperty.call(s, k)) continue;

        const selection = s[k];
        if (!selection.selectionSet) args.push(selection.name.value);
      }
      /*
            hotfix: only working if requesting value in 1 layer nested queries, in a 2nd layer query we would have the 3rd requested query name as field
            //it could be used in permission to determine if a user can or can not see a whole query under another
            if (args[0] === "edges") {
                args = info.fieldNodes[0].selectionSet.selections[0].selectionSet.selections[0].selectionSet.selections.map(selection => selection.name.value)
            }*/

      const publicInclusive = perm[userRole].public.inclusive;
      const publicFields = perm[userRole].public.fields;
      let intersec;
      if (publicInclusive) {
        // publicFields should contain all publicFields
        intersec = publicFields.filter((value) => -1 !== args.indexOf(value));
        if (intersec.length === args.length) {
          returnValue = true;
        }
      } else {
        // publicFields contains banned publicFields
        intersec = publicFields.filter((value) => -1 !== args.indexOf(value));
        if (intersec.length === 0) {
          returnValue = true;
        }
      }

      if (!returnValue && perm[userRole].private) {
        const privateInclusive = perm[userRole].private.inclusive;
        const privateFields = perm[userRole].private.fields;
        const customCheck = perm[userRole].private.customCheck ?
          perm[userRole].private.customCheck() :
          true;
        const isSameUser = perm[userRole].private.isSameUser ?
          this.sameUserHierachy(
              perm[userRole].private.isSameUser.model,
              perm[userRole].private.isSameUser.field,
              data,
              context,
          ) :
          false;
        if (customCheck && isSameUser) {
          if (privateInclusive) {
            // privateFields should contain all privateFields
            const intersec = privateFields.filter(
                (value) => -1 !== args.indexOf(value),
            );
            const tmp = publicFields.concat(privateFields);
            console.log(args, privateFields, intersec, tmp);
            if (tmp.length >= args.length && intersec != 0) {
              returnValue = true;
            }
          } else {
            // privateFields contains banned privateFields
            const intersec = privateFields.filter(
                (value) => -1 !== args.indexOf(value),
            );
            if (intersec.length === 0) {
              returnValue = true;
            }
          }
        }
      }
    } else {
      if (userRole > this.min) {
        returnValue = this.checkPerm(perm, userRole - 1, info, data, context);
      }
    }

    return returnValue;
  }

  /**
   * @typedef PermObjPublic
   * @property {Array} fields - fields
   * @property {boolean} inclusive - inclusive
   */

  /**
   * @typedef PermObjPrivate
   * @property {Array} fields - fields
   * @property {boolean} inclusive - inclusive
   * @property {Function} [customCheck] - Function
   * @property {Object} isSameUser - isSameUser
   */

  /**
   * @typedef PermObj
   * @property {PermObjPublic} public - public
   * @property {PermObjPrivate} private - private
   */

  /**
   * Handle the hierarchy for this model using permObj to define permissions, example below.
   *
   * @param {Object.<number, PermObj>} permObj
   * @example
   *  {
   *      [ACL.roles.ROLE_USER]: {
   *           public: {
   *              inclusive: true,
   *              fields: ["username"],
   *           },
   *           private: {
   *              inclusive: true,
   *              fields: ["username"],
   *              customCheck: hasBananaPower(),
   *              isSameUser: {model: "", field: ""},
   *           },
   *       },
   *       [ACL.roles.ROLE_GAMEMASTER]: {
   *           public: {
   *              inclusive: true,
   *              fields: ["username"],
   *           },
   *           private: {
   *              inclusive: true,
   *              fields: ["username"],
   *              customCheck: hasBananaPower(),
   *              isSameUser: {model: "", field: ""},
   *           },
   *       },
   *       [ACL.roles.ROLE_PROTECTOR]: {
   *           public: {
   *              inclusive: true,
   *              fields: ["username"],
   *           },
   *           private: {
   *              inclusive: true,
   *              fields: ["username"],
   *              customCheck: hasBananaPower(),
   *              isSameUser: {model: "", field: ""},
   *           },
   *       },
   *       [ACL.roles.ROLE_SUPERADMIN]: {
   *           public: {
   *              inclusive: true,
   *              fields: ["username"],
   *           },
   *       }
   *   }
   */
  handleHierarchy(permObj) {
    return async (obj, data, context, info) => {
      if (sys.noAuth) {
        return Promise.resolve();
      }
      if (context?.user) {
        const userRole = this.getLevel(context.user);
        if (this.checkPerm(permObj, userRole, info, data, context)) {
          return Promise.resolve();
        }
      }

      throw new ApolloError(errors.permission.message, `${errors.permission.code}`); // Error("You can't see this");
    };
  }

  ownDataFilter(models, relModel, userKey, relKey) {
    return async function(obj, data, context /* , info*/) {
      let id = data.where ? data.where.id : data.id;

      if (sys.noAuth) {
        return Promise.resolve();
      }

      if (!id) {
        if (obj && obj.constructor.name == relModel && obj[relKey]) {
          id = obj[relKey];
        } else {
          return Promise.reject(new Error(
              'You cannot see all data of this query, use a specific id!',
          ));
        }
      }

      const res = await models[relModel].findOne({
        where: {
          [userKey]: context.user.id,
          [relKey]: id,
        },
      });

      if (!res) {
        return Promise.reject(new Error('This element is not for you!'));
      }

      return Promise.resolve();
    };
  }
}

export default ACL;
