import {OK} from 'http-status';
import Chance from 'chance';

import {getFakeServer} from '../../../helpers/fake-server.mjs';

describe('GET /version', () => {
    let fakeServer,
        oldGitShaEnv,
        expectedGitSha;

    const chance = new Chance();

    beforeAll(async () => {
        oldGitShaEnv = process.env.GIT_SHA;
        fakeServer = await getFakeServer();
    });

    beforeEach(() => {
        expectedGitSha = chance.word();

        process.env.GIT_SHA = expectedGitSha;
    });

    afterAll(() => {
        process.env.GIT_SHA = oldGitShaEnv;
    });

    it('should reply with the version if it is defined', async () => {
        const expectedVersion = {
            sha: expectedGitSha
        };

        const response = await fakeServer.inject({
            method: 'GET',
            url: '/version'
        });

        expect(response.result).toStrictEqual(expectedVersion);
        expect(response.statusCode).toBe(OK);
    });

    it('should reply with "unknown" if the version is not defined', async () => {
        delete process.env.GIT_SHA;

        const expectedVersion = {
            sha: 'unknown'
        };

        const response = await fakeServer.inject({
            method: 'GET',
            url: '/version'
        });

        expect(response.result).toStrictEqual(expectedVersion);
        expect(response.statusCode).toBe(OK);
    });
});
