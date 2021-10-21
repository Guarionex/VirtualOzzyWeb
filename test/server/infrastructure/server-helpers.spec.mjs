import os from 'os';

import config from 'config';
/*
 * import logger from '@hy-vee/logger';
 * import hapiOidcPlugin from '@hy-vee/hapi-oidc-plugin';
 */
import Chance from 'chance';

import {shutdown} from '../../../server/infrastructure/shutdown.mjs';
import {
    configureCache,
    configureGracefulShutdown,
    registerHapiOidcPlugin
} from '../../../server/infrastructure/server-helpers.mjs';

// jest.mock('@hy-vee/logger');
jest.mock('config');
jest.mock('os');
// jest.mock('@hy-vee/hapi-oidc-plugin');
jest.mock('../../../server/infrastructure/shutdown.mjs');

describe('server helpers', () => {
    const chance = new Chance();

    let expectedServer;

    beforeEach(() => {
        expectedServer = {
            auth: {
                default: jest.fn().mockReturnValue()
            },
            cache: {
                provision: jest.fn().mockResolvedValue()
            },
            register: jest.fn().mockResolvedValue()
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('registerHapiOidcPlugin', () => {
        let expectedKeycloakConfig,
            expectedClientSecret,
            expectedCookieSecret;

        beforeEach(() => {
            expectedKeycloakConfig = {
                baseAppUri: chance.url(),
                clientId: chance.word(),
                issuerUri: chance.url(),
                scopes: chance.sentence().split(' '),
                setSecureCookie: chance.bool()
            };

            expectedClientSecret = chance.string();
            process.env.KEYCLOAK_CLIENT_SECRET = expectedClientSecret;
            expectedCookieSecret = chance.string();
            process.env.KEYCLOAK_COOKIE_SECRET = expectedCookieSecret;

            const fakeConfig = {
                keycloak: {...expectedKeycloakConfig}
            };

            config.get.mockImplementation((key) => fakeConfig[key]);
        });

        it('should create the plugin options from secrets and the environmental config', async () => {
            await registerHapiOidcPlugin(expectedServer);

            expect(config.get)
                .toHaveBeenCalledTimes(2)
                .toHaveBeenCalledWith('keycloak')
                .toHaveBeenCalledWith('cache.name');
        });

        it('should register the plugin with the correct config', async () => {
            await registerHapiOidcPlugin(expectedServer);

            expect(expectedServer.register)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith({
                    options: {
                        baseAppUri: expectedKeycloakConfig.baseAppUri,
                        clientId: expectedKeycloakConfig.clientId,
                        clientSecret: expectedClientSecret,
                        cookie: {
                            name: 'supplier-hub-web',
                            secret: expectedCookieSecret,
                            secure: expectedKeycloakConfig.setSecureCookie
                        },
                        issuerUri: expectedKeycloakConfig.issuerUri,
                        log: true,
                        scopes: expectedKeycloakConfig.scopes,
                        timeout: 20000
                    }
                    // plugin: hapiOidcPlugin.plugin
                });
        });

        it('should register the default auth strategy after registering the plugin', async () => {
            await registerHapiOidcPlugin(expectedServer);

            expect(expectedServer.auth.default)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith('oidc-session');

            expect(expectedServer.auth.default).toHaveBeenCalledAfter(expectedServer.register);
        });
    });

    describe('configureGracefulShutdown', () => {
        let expectedHostname,
            oldProcessOn;

        beforeEach(() => {
            expectedHostname = chance.string();
            oldProcessOn = process.on;
            jest.spyOn(process, 'on').mockImplementation();

            os.hostname.mockReturnValue(expectedHostname);
        });

        afterEach(() => {
            process.on = oldProcessOn;
        });

        it('should register a listener for both SIGTERM/SIGINT', () => {
            configureGracefulShutdown(expectedServer);

            expect(process.on)
                .toHaveBeenCalledTimes(2)
                .toHaveBeenCalledWith('SIGTERM', expect.anything())
                .toHaveBeenCalledWith('SIGINT', expect.anything());
        });

        ['SIGTERM', 'SIGINT'].forEach((signal, index) => {
            it(`should log the ${signal}`, async () => {
                configureGracefulShutdown(expectedServer);

                await process.on.mock.calls[index][1]();

                /*
                 * expect(logger.info)
                 *     .toHaveBeenCalledTimes(1)
                 *     .toHaveBeenCalledWith(`${signal} received, stopping server - ${expectedHostname}`);
                 */
            });

            it(`should start the shutdown process when ${signal} is received`, async () => {
                configureGracefulShutdown(expectedServer);

                await process.on.mock.calls[index][1]();

                expect(shutdown)
                    .toHaveBeenCalledTimes(1)
                    .toHaveBeenCalledWith(expectedServer);
            });
        });
    });

    describe('configureCache', () => {
        let expectedCacheOptions,
            expectedEngineName,
            expectedCacheName,
            expectedEngine;

        beforeEach(() => {
            expectedCacheName = chance.word();
            expectedEngineName = '@hapi/catbox-memory';
            expectedEngine = require(expectedEngineName);
            expectedCacheOptions = {
                [chance.string()]: chance.string()
            };

            config.get.mockReturnValue({
                engine: expectedEngineName,
                name: expectedCacheName,
                options: {...expectedCacheOptions}
            });
        });

        it('should use the engine specified in the config', async () => {
            await configureCache(expectedServer);

            expect(config.get)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith('cache');
            expect(expectedServer.cache.provision)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith({
                    name: expectedCacheName,
                    provider: {
                        constructor: expectedEngine,
                        options: expectedCacheOptions
                    }
                });
        });

        it('should return the promise from calling provision', async () => {
            const expectedCacheProvisionPromise = chance.string();

            expectedServer.cache.provision.mockReturnValue(expectedCacheProvisionPromise);

            const actualPromise = await configureCache(expectedServer);

            expect(actualPromise).toBe(expectedCacheProvisionPromise);
        });
    });
});
