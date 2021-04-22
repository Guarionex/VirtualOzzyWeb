import httpStatus from 'http-status';

import {serverIsGracefullyShuttingDown} from '../../infrastructure/shutdown.mjs';


const defaultResponse = async (h) => {
    return h
        .response({
            'virtual-ozzy-web': 'ok'
        })
        .code(httpStatus.OK);
};

const readinessResponse = (h) => {
    if (serverIsGracefullyShuttingDown()) {
        return h
            .response({
                'virtual-ozzy-web': 'shutting down'
            })
            .code(httpStatus.SERVICE_UNAVAILABLE);
    }

    return defaultResponse(h);
};

export const handler = ({headers}, h) => {
    if (headers['x-kubelet-readiness-probe']) {
        return readinessResponse(h);
    }

    return defaultResponse(h);
};
