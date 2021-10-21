import {OK} from 'http-status';
import config from 'config';
import Chance from 'chance';

import {getFakeServer} from '../../../helpers/fake-server.mjs';

jest.mock('config');

describe('GET /config', () => {
    let fakeServer,
        expectedConfig;

    const chance = new Chance();

    beforeAll(async () => {
        fakeServer = await getFakeServer();
    });

    beforeEach(() => {
        expectedConfig = {
            baseUrl: chance.string(),
            secretConfig: chance.string()
        };

        config.get.mockImplementation((cfg) => expectedConfig[cfg]);
    });

    it('should reply with the configs that are exposed to the client', async () => {
        const expectedConfigs = {
            baseUrl: expectedConfig.baseUrl
        };

        const response = await fakeServer.inject({
            method: 'GET',
            url: '/config'
        });

        expect(response.result).toStrictEqual(expectedConfigs);
        expect(response.statusCode).toBe(OK);
    });
});
