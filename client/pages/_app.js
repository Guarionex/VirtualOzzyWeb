import App from 'next/app.js';
import React from 'react';
import {Provider} from 'react-redux';
import Router from 'next/router.js';

import {initializeStore} from '../factories/redux-store-factory.js';
import {isServerSide} from '../lib/env.js';
import * as ActionCreators from '../action-creators/index.js';
import '../sass/index.scss'; //TODO Add Styles

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

const getOrCreateStore = (initialState) => {
    if (isServerSide()) {
        return initializeStore(initialState);
    }

    if (!window[__NEXT_REDUX_STORE__]) {
        window[__NEXT_REDUX_STORE__] = initializeStore(initialState);
    }

    return window[__NEXT_REDUX_STORE__];
};

class VirtualOzzyWebApp extends App {
    static async getInitialProps(appContext) {
        const reduxStore = getOrCreateStore();

        appContext.ctx.reduxStore = reduxStore; // eslint-disable-line no-param-reassign

        await ActionCreators.setClientConfig()(appContext.ctx.req, reduxStore.dispatch, reduxStore.getState);

        const {pageProps} = await App.getInitialProps(appContext);

        return {
            ...pageProps,
            initialReduxState: reduxStore.getState()
        };
    }

    constructor(props) {
        super(props);

        this.reduxStore = getOrCreateStore(props.initialReduxState);

        Router.events.on('routeChangeStart', () => this.reduxStore.dispatch(ActionCreators.clearAlerts()));
    }

    render() {
        const {Component, ...pageProps} = this.props;

        return (
            <Provider store={this.reduxStore}>
                <Component {...pageProps} />
            </Provider>
        );
    }
}

export default VirtualOzzyWebApp;
