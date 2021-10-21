import hapi from '@hapi/hapi';

import {applyNextControllers} from './infrastructure/next-controllers.mjs';
import {applyControllers} from './infrastructure/dynamic-controllers.mjs';
import {configureGracefulShutdown} from './infrastructure/server-helpers.mjs';

export default async () => {
    const server = new hapi.Server({
        host: '0.0.0.0',
        port: 3000
    });

    configureGracefulShutdown(server);

    try {
        // eslint-disable-next-line no-console
        console.log('Before applying anything');
        await applyNextControllers(server);
        // eslint-disable-next-line no-console
        console.log('After next controllers');
        await applyControllers(server);
        // eslint-disable-next-line no-console
        console.log('After regular controllers');
        // eslint-disable-next-line no-warning-comments
        // TODO Revise passthrough controller
        // eslint-disable-next-line no-console
        console.log('Hello there');

        await server.start();
    } catch (error) {
        process.exit(1);
    }
};
