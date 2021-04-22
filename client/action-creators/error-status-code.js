import {SET_PAGE_STATUS_CODE} from '../action-types.js';

export const setPageStatusCode = (statusCode) => (dispatch) => {
    dispatch({
        data: statusCode,
        type: SET_PAGE_STATUS_CODE
    });
};
