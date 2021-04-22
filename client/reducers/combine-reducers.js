import {combineReducers} from 'redux';

import clientConfig from './client-config.js';
import pageLayout from './page-layout.js';
import pageStatusCode from './page-status-code.js';

export const getReducers = () => combineReducers({
    clientConfig,
    pageLayout,
    pageStatusCode
});
