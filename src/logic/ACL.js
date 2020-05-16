import ACL from '@/service/ACLbase';
// import * as sys from '@hw-core/node-platform/src/libs/sysUtil';

export const ROLES = {
  ROLE_USER: 0,
  ROLE_MODERATOR: 1,
  ROLE_GAMEMASTER: 2,
  ROLE_PROTECTOR: 3,
  ROLE_SUPERADMIN: 4,
  ROLE_NOT_ALLOWED: -1,
};

/**
 * Access Control Layer for Maelstrom APIs (extending hw-core ACL)
 */
class MsACL extends ACL {
  constructor() {
    super('account_access.gmlevel', ROLES);
    /** @type {ROLES} */
    this.roles;
  }

  checkLevel(user, levels) {
    if (!user) {
      return false;
    }

    const gmlevel = Array.isArray(user.account_accesses) && user.account_accesses[0] && user.account_accesses[0].gmlevel ? user.account_accesses[0].gmlevel : ROLES.ROLE_USER;
    if (!Array.isArray(levels)) {
      return gmlevel >= levels;
    }

    return levels.indexOf(gmlevel) >= 0;
  }

  getLevel(user) {
    if (!user) {
      return false;
    }

    const gmlevel = Array.isArray(user.account_accesses) && user.account_accesses[0] && user.account_accesses[0].gmlevel ? user.account_accesses[0].gmlevel : ROLES.ROLE_USER;

    return gmlevel;
  }
}


export default new MsACL();
