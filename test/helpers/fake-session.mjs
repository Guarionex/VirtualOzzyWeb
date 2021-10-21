import Chance from 'chance';
import * as uuid from 'uuid';

const chance = new Chance();
const sessionCache = {};

const fakeSessionLookup = (sessionId) => sessionCache[sessionId];

export const createRandomSession = () => {
    const sessionId = uuid.v4();

    const session = {
        accessToken: chance.guid(),
        accessTokenClaims: {
            customerUuid: chance.guid()
        },
        sessionId
    };

    sessionCache[sessionId] = session;

    return session;
};

export const injectWithSession = (server) => (s, args) => {
    jest.mockImplementation(fakeSessionLookup);

    return server.inject({
        credentials: {
            sessionId: s.sessionId,
            ...args.credentials
        },
        ...args
    });
};
