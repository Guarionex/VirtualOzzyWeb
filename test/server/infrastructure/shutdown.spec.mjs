import {Chance} from 'chance';

jest.mock('os');
// jest.mock('@hy-vee/logger');

describe('shutdown', () => {
    const chance = new Chance();

    let shutdown,
        serverIsGracefullyShuttingDown,
        // logger,
        os,

        expectedServer,
        expectedHostname;

    const loadImports = async () => {
        // logger = await import('@hy-vee/logger');
        os = await import('os');

        const module = await import('../../../server/infrastructure/shutdown.mjs');

        shutdown = module.shutdown;
        serverIsGracefullyShuttingDown = module.serverIsGracefullyShuttingDown;
    };

    beforeEach(async () => {
        jest.useFakeTimers();

        await loadImports();

        expectedServer = {
            [chance.string()]: chance.string(),
            stop: jest.fn().mockResolvedValue()
        };

        expectedHostname = chance.string();

        // logger = await import('@hy-vee/logger');
        os = await import('os');

        os.hostname.mockReturnValue(expectedHostname);

        jest.spyOn(process, 'on').mockImplementation();
        jest.spyOn(process, 'exit').mockImplementation();
    });

    afterEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
        jest.clearAllTimers();
    });

    it('should not indicate that the server is in the process of shutting down until `shutdown` has been invoked', () => {
        expect(serverIsGracefullyShuttingDown()).toBeFalsy();
    });

    describe('given at least four seconds have passed so the kubernetes readiness probe has time to fail', () => {
        const waitAtLeastFourSeconds = () => {
            jest.advanceTimersByTime(chance.natural({
                max: 10000,
                min: 4000
            }));
        };

        const invokeFunctionAndWaitAtLeastFourSeconds = async (func) => {
            const promise = func();

            waitAtLeastFourSeconds();

            await promise;
        };

        it('should log that four seconds have passed', async () => {
            await invokeFunctionAndWaitAtLeastFourSeconds(() => shutdown(expectedServer));

            // expect(logger.info).toHaveBeenCalledWith(`Four seconds have passed, shutting down - ${expectedHostname}`);
        });

        it('should stop the server', async () => {
            await invokeFunctionAndWaitAtLeastFourSeconds(() => shutdown(expectedServer));

            expect(expectedServer.stop).toHaveBeenCalledTimes(1);
        });

        it('should exit with a clean exit code and log a success message', async () => {
            await invokeFunctionAndWaitAtLeastFourSeconds(() => shutdown(expectedServer));

            expect(process.exit)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith(0);

            /*
             * expect(logger.info)
             *     .toHaveBeenCalledWith(`Server stopped successfully - ${expectedHostname}`)
             *     .toHaveBeenCalledBefore(process.exit);
             */
        });

        it('should not exit with a clean exit code and log an error if stopping the server fails', async () => {
            const expectedError = new Error(chance.string());

            expectedServer.stop.mockRejectedValue(expectedError);

            await invokeFunctionAndWaitAtLeastFourSeconds(() => shutdown(expectedServer));

            /*
             * expect(logger.error)
             *     .toHaveBeenCalledTimes(1)
             *     .toHaveBeenCalledWith(`Error occurred while stopping server - ${expectedHostname}`, expectedError);
             */

            expect(process.exit)
                .toHaveBeenCalledTimes(1)
                .toHaveBeenCalledWith(1);

            // expect(logger.error).toHaveBeenCalledBefore(process.exit);
        });
    });

    describe('given four seconds have not passed', () => {
        beforeEach(() => {
            shutdown(expectedServer);
        });

        it('should indicate that the server is in the process of shutting down', () => {
            expect(serverIsGracefullyShuttingDown()).toBeTruthy();

            // expect(logger.info).toHaveBeenCalledWith(`Waiting four seconds for Kubernetes readiness probe to fail - ${expectedHostname}`);
        });

        it('should not log that four seconds of waiting have passed', () => {
            expect(serverIsGracefullyShuttingDown()).toBeTruthy();

            // expect(logger.info).not.toHaveBeenCalledWith(`Four seconds have passed, shutting down - ${expectedHostname}`);
        });

        it('should not have stopped the server', () => {
            expect(expectedServer.stop).not.toHaveBeenCalled();
        });

        it('should not have exited', () => {
            expect(process.exit).not.toHaveBeenCalled();
        });
    });

    describe('given the app is running locally', () => {
        let oldDevServer;

        beforeEach(() => {
            oldDevServer = process.env.DEV_SERVER;

            process.env.DEV_SERVER = 'true';
        });

        it('should not wait four seconds when shutting down', async () => {
            await shutdown(expectedServer);

            expect(expectedServer.stop).toHaveBeenCalledTimes(1);
        });

        afterEach(() => {
            process.env.DEV_SERVER = oldDevServer;
        });
    });

    describe('given shutdown is called multiple times', () => {
        it('should only stop the server once', async () => {
            await Promise.all([
                shutdown(expectedServer),
                shutdown(expectedServer)
            ]);

            expect(expectedServer.stop).toHaveBeenCalledTimes(1);
        });
    });
});
