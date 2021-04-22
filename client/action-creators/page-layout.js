import * as uuid from 'uuid';

import {
    SET_PAGE_LAYOUT_ALERTS,
    SET_PAGE_LAYOUT_HEADER,
    INCREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT,
    DECREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT,
    SET_PAGE_LAYOUT_SUB_HEADER
} from '../action-types.js';

const determineAppendAlertData = (alert, existingAlerts) => {
    const existingAlertIndex = existingAlerts.findIndex((e) => e.id === alert.id);
    const alertIdAlreadyExists = existingAlertIndex !== -1;

    if (alertIdAlreadyExists) {
        const existingAlert = existingAlerts[existingAlertIndex];

        return [
            ...existingAlerts.slice(0, existingAlertIndex),
            {
                ...existingAlert,
                content: `${alert.content} ${existingAlert.content}`
            },
            ...existingAlerts.slice(existingAlertIndex + 1)
        ];
    }

    return [
        ...existingAlerts,
        {
            content: alert.content,
            id: alert.id || uuid.v4(),
            type: alert.type
        }
    ];
};

export const removeAlert = (idToRemove, alerts) => ({
    data: alerts.filter(({id}) => id !== idToRemove),
    type: SET_PAGE_LAYOUT_ALERTS
});

export const appendAlert = (alert, existingAlerts) => ({
    data: determineAppendAlertData(alert, existingAlerts),
    type: SET_PAGE_LAYOUT_ALERTS
});

export const clearAlerts = () => ({
    data: [],
    type: SET_PAGE_LAYOUT_ALERTS
});

export const setHeader = (header) => (dispatch) => {
    dispatch({
        data: header,
        type: SET_PAGE_LAYOUT_HEADER
    });
};

export const incrementLoadingTaskCount = () => ({
    type: INCREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT
});

export const decrementLoadingTaskCount = () => ({
    type: DECREMENT_PAGE_LAYOUT_LOADING_TASK_COUNT
});

export const setSubHeader = (subHeader) => (dispatch) => {
    dispatch({
        data: subHeader,
        type: SET_PAGE_LAYOUT_SUB_HEADER
    });
};
