import next from 'next';

const isRunningLocally = () => Boolean(process.env.DEV_SERVER);

export const nextHandlerWrapper = (app) => {
    const handler = app.getRequestHandler();

    return async ({raw: {req, res}, url}, h) => {
        await handler(req, res, url);

        return h.close;
    };
};

export const defaultHandlerWrapper = (app) => ({raw: {req, res}, url}) => {
    const parsedUrl = new URL(url);
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());

    return app.renderToHTML(req, res, parsedUrl.pathname, queryParams);
};

export const applyNextControllers = async (server) => {
    const app = next({
        dev: isRunningLocally(),
        dir: './client'
    });

    await app.prepare();

    server.route({
        handler: nextHandlerWrapper(app),
        method: 'GET',
        options: {
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        },
        path: '/_next/{p*}'
    });

    server.route({
        handler: defaultHandlerWrapper(app),
        method: 'GET',
        path: '/{p*}'
    });

    return app;
};
