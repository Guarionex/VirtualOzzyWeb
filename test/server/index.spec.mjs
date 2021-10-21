import startServer from '../../server/server.mjs';

jest.mock('../../server/server.mjs');

describe('server index', () => {
    it('should start the server', async () => {
        await import('../../server/index.mjs');

        expect(startServer).toHaveBeenCalledTimes(1);
    });
});
