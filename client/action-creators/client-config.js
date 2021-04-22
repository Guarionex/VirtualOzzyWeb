import {
    SET_CLIENT_CONFIG
} from '../action-types.js';
import {get} from '../lib/fetch-service.js';

export const setClientConfig = () => async (request, dispatch, getState) => {
    const response = await get('/config', request, {
        dispatch,
        getState
    });

    if (response.ok) {
        const clientConfig = await response.json();

        dispatch({
            data: clientConfig,
            type: SET_CLIENT_CONFIG
        });
    }
};
