/**
 * This file must be used only to
 * export properties allowing you to include
 * this package in other services eventually.
 * To run the service you must use the run.js file that
 * includes this file itself.
 */

export default {
  // we must require it inside a function
  // to avoid the automatic inclusion of service.js
  // dependencies when this project
  // is included as a dependency
  runService(): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const service = require('./service/service');

    service.run();
  },
};
