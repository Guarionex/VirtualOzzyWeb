import status from 'http-status';

import {
    SET_PAGE_STATUS_CODE
} from '../action-types.js';

import {exportReducer} from './reducer-utils.js';

const defaultState = {
    statusCode: status.OK
};

const setStatusCode = (state, data) => (
    {
        ...state,
        statusCode: data
    }
);

const reducerMap = {
    [SET_PAGE_STATUS_CODE]: setStatusCode
};

export default exportReducer(reducerMap, defaultState);
