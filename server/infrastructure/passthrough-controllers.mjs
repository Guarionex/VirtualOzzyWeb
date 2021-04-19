import config from 'config';
import boom from '@hapi/boom';

const emptyIfFalsy = (value) => value || '';
const stringify = (value) => value ? JSON.stringify(value) : undefined;

const getJsonData = async (response) => {
    if (!response.ok) {
        return '';
    }

    const text = await response.text();

    return text ? JSON.parse(text) : '';
};

export const passthroughHandler = async (request, reply) => {
    try {
        const {baseUrl: {supplierHubApi}} = config;
        const {url: {search}, params: {endpoint}, payload, pre: {session: {accessToken}}, route: {method}} = request;
        const url = `${supplierHubApi}/${endpoint}${emptyIfFalsy(search)}`;
        const options = {
            body: stringify(payload),
            headers: {
                'accept': 'application/json',
                'authorization': `bearer ${accessToken}`,
                'content-type': 'application/json'
            },
            method
        };

        const response = await fetch(url, options);

        const jsonData = await getJsonData(response);

        return reply
            .response(jsonData)
            .code(response.status)
            .header('response-from-downstream-api', 'true');
    } catch (error) {
        return boom.internal(error);
    }
};

export const applyPassthroughControllers = async (server) => {
    server.route({
        handler: passthroughHandler,
        method: ['GET', 'PUT', 'POST', 'DELETE'],
        options: {
            auth: 'oidc-session',
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        },
        path: '/supplierhub/{endpoint*}'
    });
};
