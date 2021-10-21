import Chance from 'chance';
import next from 'next';

import {getFakeServer} from '../../helpers/fake-server.mjs';
import {applyNextControllers} from '../../../server/infrastructure/next-controllers.mjs';

jest.mock('next');

describe('next controllers', () => {
    let fakeServer,
        expectedNextJSApp,
        expectedPrepareStub,
        expectedRenderToHTMLStub,
        expectedRenderStub,
        expectedGetRequestHandlerStub,
        expectedQueryStringKey,
        expectedQueryStringValue,
        expectedRequestHandler;

    const chance = new Chance();

    const expectHandlerConnectionToBeClosed = (response) => {
        expect(response.request).toBeUndefined();
    };

    beforeEach(async () => {
        fakeServer = await getFakeServer();

        expectedPrepareStub = jest.fn();
        expectedRenderToHTMLStub = jest.fn().mockResolvedValue({});
        expectedRequestHandler = jest.fn().mockResolvedValue({});
        expectedGetRequestHandlerStub = jest.fn().mockReturnValue(expectedRequestHandler);
        expectedRenderStub = jest.fn().mockResolvedValue(chance.string());
        expectedQueryStringKey = chance.word();
        expectedQueryStringValue = chance.word();

        expectedNextJSApp = {
            getRequestHandler: expectedGetRequestHandlerStub,
            prepare: expectedPrepareStub,
            render: expectedRenderStub,
            renderToHTML: expectedRenderToHTMLStub
        };

        next.mockReturnValue(expectedNextJSApp);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const createFullUrl = (path) => `${fakeServer.info.uri}:${fakeServer.info.port}${path}`;

    it('should setup the next js app', async () => {
        await applyNextControllers(fakeServer);

        expect(next)
            .toHaveBeenCalledTimes(1)
            .toHaveBeenCalledWith({
                dev: false,
                dir: './client'
            });
    });

    it('should setup dev to true if the environment variable is set for the next js app', async () => {
        process.env.DEV_SERVER = 'true';

        await applyNextControllers(fakeServer);

        expect(next)
            .toHaveBeenCalledTimes(1)
            .toHaveBeenCalledWith({
                dev: true,
                dir: './client'
            });
    });

    it('should prepare the next js app', async () => {
        await applyNextControllers(fakeServer);

        expect(expectedPrepareStub)
            .toHaveBeenCalledTimes(1);
    });

    it('should handle next js specific routes', async () => {
        const nextUrl = `/_next/${chance.word()}?${expectedQueryStringKey}=${expectedQueryStringValue}`;
        const expectedRequest = {
            method: 'GET',
            url: nextUrl
        };

        await applyNextControllers(fakeServer);

        const response = await fakeServer.inject(expectedRequest);
        const {req, res} = response.raw;
        const expectedRewrittenUrl = new URL(createFullUrl(nextUrl));

        expect(expectedGetRequestHandlerStub).toHaveBeenCalledTimes(1);
        expect(expectedRequestHandler)
            .toHaveBeenCalledTimes(1)
            .toHaveBeenCalledWith(req, res, expectedRewrittenUrl);

        expectHandlerConnectionToBeClosed(response);
    });

    it('should disable hapi-auth-cookie redirects for static content', async () => {
        jest.spyOn(fakeServer, 'route');

        await applyNextControllers(fakeServer);

        expect(fakeServer.route).toHaveBeenCalledWith(expect.objectContaining({
            options: {
                plugins: {
                    'hapi-auth-cookie': {
                        redirectTo: false
                    }
                }
            },
            path: '/_next/{p*}'
        }));
    });

    it('should handle all other routes', async () => {
        await applyNextControllers(fakeServer);

        const expectedPath = `/${chance.word()}`;
        const expectedUrl = `${expectedPath}?${expectedQueryStringKey}=${expectedQueryStringValue}`;
        const expectedRequest = {
            method: 'GET',
            url: expectedUrl
        };
        const response = await fakeServer.inject(expectedRequest);
        const {req, res} = response.raw;

        expect(expectedRenderToHTMLStub)
            .toHaveBeenCalledTimes(1)
            .toHaveBeenCalledWith(req, res, expectedPath, {
                [expectedQueryStringKey]: expectedQueryStringValue
            });
    });

    it('should return theme pages when running locally', async () => {
        process.env.DEV_SERVER = 'true';

        await applyNextControllers(fakeServer);

        const path = `/theme/${chance.word()}`;

        const response = await fakeServer.inject({
            method: 'GET',
            url: path
        });

        expect(response.statusCode).toBe(200);
    });

    it('should return the next js app', async () => {
        const actualApp = await applyNextControllers(fakeServer);

        expect(actualApp).toStrictEqual(expectedNextJSApp);
    });
});
