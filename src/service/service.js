import service, {gfShutdownHandler} from '@yield-insight/servicemodule';
import apolloConfs from '$this/src/graphql';
import {noderouter, conf} from '$this/src/conf';

/**
 *
 */
function run() {
  service.createServer(conf.apiPrefix, apolloConfs, {
    port: conf.port,
    routerConf: noderouter,
    fastifyConf: conf.fastifyConf,
    gfShutdownHandler,
    gatewayConf: conf.gatewayConf,
  });
}

export {run};
