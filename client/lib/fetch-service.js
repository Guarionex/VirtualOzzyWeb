import isomorphicUnfetch from 'isomorphic-unfetch';
import status from 'http-status';
import {sentenceCase} from 'sentence-case';

import {appendAlert} from '../action-creators';
import {getConfig} from '../utils/view-helpers.js';

import {isServerSide} from './env.js';

const requestHasCookies = (request) => request && request.headers && request.headers.cookie;

const determineErrorText = (statusCode) => {
    if (statusCode === status.UNAUTHORIZED) {
        return 'You may not be logged in. Please refresh this page or log back in.';
    } else if (statusCode === status.FORBIDDEN) {
        return 'You are not authorized to perform this action.';
    } else if (statusCode >= status.BAD_REQUEST) {
        const statusCodeText = status[statusCode];

        return `${sentenceCase(statusCodeText.replace('-', ''))}.`;
    }

    return undefined;
};

const contentType = 'application/json';

const fetch = async (endpoint, options, {
    dispatch,
    getState
}, alertId) => {
    let response = {},
        errorText;

    const baseUrl = isServerSide() ? getConfig().baseUrl.virtualOzzyWeb : '';
    const url = `${baseUrl}${endpoint}`;

    try {
        response = await isomorphicUnfetch(url, options);

        errorText = determineErrorText(response.status);

        if (!isServerSide() &&
            response.status === status.UNAUTHORIZED &&
            !response.headers.get('response-from-downstream-api')
        ) {
            window.location.reload();
        }
    } catch (error) {
        errorText = 'The process threw an error.' + error;
    }

    if (errorText) {
        dispatch(
            appendAlert(
                {
                    content: errorText,
                    id: alertId
                    // type: ERROR //TODO Make alerts
                },
                getState().pageLayout.alerts
            )
        );
    }

    return response;
};

export const get = (url, request, appContext, alertId) =>
    fetch(url, {
        headers: requestHasCookies(request) ? {
            cookie: request.headers.cookie
        } : {},
        method: 'GET'
    }, appContext, alertId);

export const post = (url, options, appContext, alertId) =>
    fetch(url, {
        body: JSON.stringify(options.body),
        headers: {
            'content-type': contentType,
            ...options.headers
        },
        method: 'POST'
    }, appContext, alertId);

export const put = (url, options, appContext, alertId) =>
    fetch(url, {
        body: JSON.stringify(options.body),
        headers: {
            'content-type': contentType,
            ...options.headers
        },
        method: 'PUT'
    }, appContext, alertId);

export const remove = (url, request, appContext, alertId) =>
    fetch(url, {
        headers: requestHasCookies(request) ? {
            cookie: request.headers.cookie
        } : {},
        method: 'DELETE'
    }, appContext, alertId);
