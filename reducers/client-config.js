import {
    SET_CLIENT_CONFIG
} from '../action-types.js';

import {exportReducer} from './reducer-utils.js';

const defaultState = {
    virtualOzzyWeb: ''
};

const setClientConfig = (state, data) => ({
    ...state,
    ...data
});

const reducerMap = {
    [SET_CLIENT_CONFIG]: setClientConfig
};

export default exportReducer(reducerMap, defaultState);
