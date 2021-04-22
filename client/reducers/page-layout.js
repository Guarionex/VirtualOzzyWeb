import {
    SET_PAGE_LAYOUT_ALERTS,
    SET_PAGE_LAYOUT_HEADER,
    INCREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT,
    DECREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT,
    SET_PAGE_LAYOUT_SUB_HEADER
} from '../action-types.js';

import {exportReducer} from './reducer-utils.js';

const defaultState = {
    alerts: [],
    header: '',
    loadingTaskCount: 0,
    subHeader: ''
};

const setAlerts = (state, data) => ({
    ...state,
    alerts: data
});

const setHeader = (state, data) => ({
    ...state,
    header: data
});

const incrementLoadingTaskCount = (state) => ({
    ...state,
    loadingTaskCount: state.loadingTaskCount + 1
});

const decrementLoadingTaskCount = (state) => ({
    ...state,
    loadingTaskCount: state.loadingTaskCount - 1
});

const setSubHeader = (state, data) => ({
    ...state,
    subHeader: data
});

const reducerMap = {
    [DECREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT]: decrementLoadingTaskCount,
    [INCREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT]: incrementLoadingTaskCount,
    [SET_PAGE_LAYOUT_ALERTS]: setAlerts,
    [SET_PAGE_LAYOUT_HEADER]: setHeader,
    [SET_PAGE_LAYOUT_SUB_HEADER]: setSubHeader
};

export default exportReducer(reducerMap, defaultState);
