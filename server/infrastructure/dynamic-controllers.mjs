import path from 'path';

import globby from 'globby';

const dirname = path.resolve(path.dirname(''));
const controllersDirectory = path.join(dirname, 'server', 'controllers');

const unauthenticatedControllers = ['/healthz', '/version'];

const getRoutePath = (filePath) =>
    path.parse(filePath).dir.slice(controllersDirectory.length);

const getRouteMethod = (filePath) =>
    path.parse(filePath).name.toUpperCase();

const applyRoute = async (server, filePath) => {
    const {handler} = await import(filePath);
    const routePath = getRoutePath(filePath);
    const method = getRouteMethod(filePath);

    const route = {
        handler,
        method,
        path: routePath
    };

    if (unauthenticatedControllers.includes(routePath)) {
        route.options = {
            auth: false
        };
    }

    // eslint-disable-next-line no-console
    console.log('server.route for dynamic controller');
    server.route(route);
};

export const applyControllers = async (server) => {
    const controllers = await globby(`${controllersDirectory}/**/*`);

    await Promise.all(controllers.map((controller) => applyRoute(server, controller)));
};
