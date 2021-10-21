import os from 'os';

import hapi from '@hapi/hapi';
import Chance from 'chance';

import startServer from '../../server/server.mjs';
import {
    configureCache,
    configureGracefulShutdown
} from '../../server/infrastructure/server-helpers.mjs';
import {applyNextControllers} from '../../server/infrastructure/next-controllers.mjs';
import {applyControllers} from '../../server/infrastructure/dynamic-controllers.mjs';

jest.mock('@hapi/hapi');
jest.mock('../../server/infrastructure/server-helpers.mjs');
jest.mock('../../server/infrastructure/next-controllers.mjs');
jest.mock('../../server/infrastructure/dynamic-controllers.mjs');

describe('server', () => {
    const chance = new Chance();

    jest.spyOn(process, 'exit').mockImplementation(() => null);

    let expectedHostname,
        expectedServer;

    beforeEach(() => {
        expectedServer = {
            [chance.string()]: chance.string(),
            info: chance.string(),
            start: jest.fn()
        };
        expectedHostname = chance.string();

        jest.spyOn(os, 'hostname').mockReturnValue(expectedHostname);
        hapi.Server.mockImplementation(() => expectedServer);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('server starts successfully', () => {
        beforeEach(async () => {
            await startServer();
        });

        it('should create a server', () => {
            expect(hapi.Server)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith({
                    host: '0.0.0.0',
                    port: 3000
                });
        });

        it('should configure shutdown', () => {
            expect(configureGracefulShutdown)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith(expectedServer);
        });

        it('should configure cache', () => {
            expect(configureCache)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith(expectedServer);
        });

        it('should apply the next controllers', () => {
            expect(applyNextControllers)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith(expectedServer);
        });

        it('should apply the application controllers', () => {
            expect(applyControllers)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith(expectedServer);
        });

        it('should do everything in the correct order', () => {
            expect(configureGracefulShutdown).toHaveBeenCalledBefore(configureCache);
            expect(configureCache).toHaveBeenCalledBefore(applyNextControllers);
            expect(applyNextControllers).toHaveBeenCalledBefore(applyControllers);
        });
    });

    describe('server errors', () => {
        let expectedError;

        beforeEach(() => {
            expectedError = new Error(chance.string());

            /*
             * jest.spyOn(process, 'exit').mockImplementation(() => {
             *   if (!logger.error.mock.calls.length) {
             *       throw new Error('should log before exiting');
             *   }
             * });
             */
        });

        const assertErrorHandling = () => {
            /*
             * expect(logger.error)
             *     .toHaveBeenCalledTimes(1)
             *     .toHaveBeenCalledWith(`Error starting server ${expectedHostname}`, expectedError);
             */
            expect(process.exit)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith(1);
        };

        it('should log and exit if an error occurs while configuring cache', async () => {
            configureCache.mockRejectedValue(expectedError);

            await startServer();

            assertErrorHandling();
            configureCache.mockReset();
        });

        it('should log and exit if an error occurs while applying the Next.js controllers', async () => {
            applyNextControllers.mockRejectedValue(expectedError);

            await startServer();

            assertErrorHandling();
            applyNextControllers.mockReset();
        });

        it('should log and exit if an error occurs while applying application controllers', async () => {
            applyControllers.mockRejectedValue(expectedError);

            await startServer();

            assertErrorHandling();
            applyControllers.mockReset();
        });
    });
});
