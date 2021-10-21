import {Server} from '@hapi/hapi';

import {applyControllers} from '../../server/infrastructure/dynamic-controllers.mjs';

import {setupInternalServerErrorValidation, setupUnhandledErrorValidation} from './fake-server-error-validation.mjs';
import {injectWithSession} from './fake-session.mjs';

export const getFakeServer = async () => {
    const fakeServer = new Server({
        debug: false,
        host: 'localhost'
    });

    await applyControllers(fakeServer);

    setupInternalServerErrorValidation(fakeServer);
    setupUnhandledErrorValidation(fakeServer);

    fakeServer.injectWithSession = injectWithSession(fakeServer);

    return fakeServer;
};
