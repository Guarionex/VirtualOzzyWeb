import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

import {getReducers} from '../reducers/combine-reducers.js';

export const initializeStore = (initialState = {}) =>
    createStore(
        getReducers(),
        initialState,
        applyMiddleware(thunkMiddleware));
