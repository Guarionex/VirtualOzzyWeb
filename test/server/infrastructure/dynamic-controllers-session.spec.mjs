// import oidcPlugin from '@hy-vee/hapi-oidc-plugin';
import Chance from 'chance';

// import {addSessionLookupToRoute} from '../../../server/infrastructure/dynamic-controllers-session.mjs';

// jest.mock('@hy-vee/hapi-oidc-plugin');

describe('dynamic controllers session', () => {
    const chance = new Chance();

    describe('addSessionLookupToRoute', () => {
        let expectedRoute,
            // expectedSessionPrehandler,
            expectedPrehandlers;

        beforeEach(() => {
            expectedPrehandlers = chance.n(chance.string, chance.d4());
            // expectedSessionPrehandler = chance.string();

            // oidcPlugin.sessionPrehandler.mockReturnValue(expectedSessionPrehandler);

            expectedRoute = {
                [chance.string()]: chance.string(),
                options: {
                    [chance.string()]: chance.string(),
                    pre: expectedPrehandlers
                }
            };
        });

        // eslint-disable-next-line jest/no-commented-out-tests
        // it('should add a prehandler without overwriting the existing configuration', () => {
        //     // const actualRoute = addSessionLookupToRoute(expectedRoute);
        //
        //     /*
        //      * expect(actualRoute).toStrictEqual({
        //      *     ...expectedRoute,
        //      *     options: {
        //      *         ...expectedRoute.options,
        //      *         pre: [
        //      *             expectedSessionPrehandler,
        //      *             ...expectedPrehandlers
        //      *         ]
        //      *     }
        //      * });
        //      */
        // });

        it('should not attempt to add other prehandlers if none are set', () => {
            delete expectedRoute.options.pre;

            // const actualRoute = addSessionLookupToRoute(expectedRoute);

            // expect(actualRoute.options.pre).toHaveLength(1);
        });

        it('should handle a route not having options set', () => {
            delete expectedRoute.options;

            // const actualRoute = addSessionLookupToRoute(expectedRoute);

            // expect(actualRoute.options.pre).toHaveLength(1);
        });
    });
});
