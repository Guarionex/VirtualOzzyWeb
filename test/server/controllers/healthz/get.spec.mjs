import {OK, SERVICE_UNAVAILABLE} from 'http-status';
/*
 * import cacheService from '@hy-vee/hapi-oidc-plugin/src/services/cache-service.js';
 * import logger from '@hy-vee/logger';
 */

import {serverIsGracefullyShuttingDown} from '../../../../server/infrastructure/shutdown.mjs';
import {getFakeServer} from '../../../helpers/fake-server.mjs';

/*
 * jest.mock('@hy-vee/hapi-oidc-plugin/src/services/cache-service.js');
 * jest.mock('@hy-vee/logger');
 */
jest.mock('../../../../server/infrastructure/shutdown.mjs');

describe('GET /healthz', () => {
    let fakeServer;

    beforeAll(async () => {
        fakeServer = await getFakeServer();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return an object with the health of each dependency', async () => {
        const response = await fakeServer.inject({
            method: 'GET',
            url: '/healthz'
        });

        expect(response.statusCode).toBe(OK);
        expect(response.result).toStrictEqual({
            cache: 'ok',
            'supplier-hub-web': 'ok'
        });
    });

    describe('given the request originated from a kubernetes liveness probe', () => {
        let livenessRequest;

        beforeEach(() => {
            livenessRequest = {
                headers: {
                    'x-kubelet-liveness-probe': 'true'
                },
                method: 'GET',
                url: '/healthz'
            };
        });

        it('should return a successful response if the cache is up', async () => {
            const livenessResponse = await fakeServer.inject(livenessRequest);

            expect(livenessResponse.result).toStrictEqual({
                cache: 'ok',
                'supplier-hub-web': 'ok'
            });

            expect(livenessResponse.statusCode).toStrictEqual(OK);

            /*
             * expect(cacheService.get)
             *     .toHaveBeenCalledTimes(1)
             *     .toHaveBeenCalledWith({
             *         id: 'invalid-key',
             *         segment: 'state'
             *     });
             */
        });

        it('should return a failed response if cache is down', async () => {
            // const error = new Error();

            // cacheService.get.mockRejectedValue(error);
            const livenessResponse = await fakeServer.inject(livenessRequest);

            expect(livenessResponse.statusCode).toBe(SERVICE_UNAVAILABLE);

            expect(livenessResponse.result).toStrictEqual({
                cache: 'failed',
                'supplier-hub-web': 'ok'
            });

            /*
             * expect(logger.error)
             *     .toHaveBeenCalledTimes(1)
             *     .toHaveBeenCalledWith('Unable to verify access to cache', error);
             */
        });
    });

    describe('given the request originated from a kubernetes readiness probe', () => {
        let readinessRequest;

        beforeEach(() => {
            serverIsGracefullyShuttingDown.mockReturnValue(false);

            readinessRequest = {
                headers: {
                    'x-kubelet-readiness-probe': 'true'
                },
                method: 'GET',
                url: '/healthz'
            };
        });

        it('should return a successful response if the server is not gracefully shutting down', async () => {
            const readinessResponse = await fakeServer.inject(readinessRequest);

            expect(readinessResponse.result).toStrictEqual({
                cache: 'ok',
                'supplier-hub-web': 'ok'
            });

            expect(readinessResponse.statusCode).toBe(OK);

            /*
             * expect(cacheService.get)
             *     .toHaveBeenCalledTimes(1)
             *     .toHaveBeenCalledWith({
             *         id: 'invalid-key',
             *         segment: 'state'
             *     });
             */
        });

        it('should return a failed response if cache is down', async () => {
            // const error = new Error();

            // cacheService.get.mockRejectedValue(error);
            const readinessResponse = await fakeServer.inject(readinessRequest);

            expect(readinessResponse.statusCode).toBe(SERVICE_UNAVAILABLE);

            expect(readinessResponse.result).toStrictEqual({
                cache: 'failed',
                'supplier-hub-web': 'ok'
            });

            /*
             * expect(logger.error)
             *     .toHaveBeenCalledTimes(1)
             *     .toHaveBeenCalledWith('Unable to verify access to cache', error);
             */
        });

        it('should return a failure response if the server is gracefully shutting down', async () => {
            serverIsGracefullyShuttingDown.mockReturnValue(true);

            const readinessResponse = await fakeServer.inject(readinessRequest);

            expect(readinessResponse.statusCode).toBe(SERVICE_UNAVAILABLE);
            expect(readinessResponse.result).toStrictEqual({
                'supplier-hub-web': 'shutting down'
            });
        });
    });
});
