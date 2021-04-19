import {shutdown} from './shutdown.mjs';

export const configureGracefulShutdown = (server) => {
    const terminationSignals = ['SIGTERM', 'SIGINT'];

    terminationSignals.forEach((terminationSignal) => {
        process.on(terminationSignal, async () => {
            await shutdown(server);
        });
    });
};
