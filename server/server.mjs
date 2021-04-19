import hapi from '@hapi/hapi';

import {applyNextControllers} from './infrastructure/next-controllers.mjs';
import {applyControllers} from './infrastructure/dynamic-controllers.mjs';
import {applyPassthroughControllers} from './infrastructure/passthrough-controllers.mjs';
import {configureGracefulShutdown} from './infrastructure/server-helpers.mjs';

export default async () => {
    const server = new hapi.Server({
        host: '0.0.0.0',
        port: 3000
    });

    configureGracefulShutdown(server);

    try {
        await applyNextControllers(server);
        await applyControllers(server);
        await applyPassthroughControllers(server);

        await server.start();

    } catch (error) {
        process.exit(1);
    }
};
