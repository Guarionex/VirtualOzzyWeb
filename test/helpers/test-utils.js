import {render} from '@testing-library/react';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import React from 'react';
import '@testing-library/jest-dom/extend-expect.js';
import Chance from 'chance';
import * as httpStatus from 'http-status';

import {getReducers} from '../../client/reducers/combine-reducers.js';

const chance = new Chance();

const getInitialStore = async (component, initialState, initialAppContext) => {
    const initialStateWithoutChildren = {...initialState};

    delete initialStateWithoutChildren.children;

    const store = createStore(getReducers(), initialStateWithoutChildren, applyMiddleware(thunk));
    const appContext = {
        reduxStore: {
            dispatch: store.dispatch,
            getState: () => store.getState()
        },
        ...initialAppContext
    };

    if (component.getInitialProps) {
        await component.getInitialProps(appContext);
    }

    return store;
};

const getFormValue = (container, name) => {
    const elements = [...container.querySelectorAll(`[name="${escape(name)}"]`)];

    if (!elements.length) {
        return undefined;
    }

    return elements[0].value;
};

export const renderWithRedux = async (
    component,
    {initialState, initialAppContext, initialProps, store} = {}
) => {
    const initialStore = store ? store : await getInitialStore(component, initialState, initialAppContext);

    return {
        ...render(
            <Provider store={initialStore}>{React.createElement(component, initialProps || {}, initialState && initialState.children)}</Provider>),
        store
    };
};

export const randomErrorHttpStatus = () => {
    const allStatusCodes = Object.keys(httpStatus);

    return chance.pickone(allStatusCodes.filter((code) => code >= 400 && code <= 599));
};

export const getAllFormValues = (container) => {
    const names = [...container.elements].map((element) => element.name);

    return names.reduce(
        (obj, name) => ({
            ...obj,
            [name]: getFormValue(container, name)
        }),
        {}
    );
};
