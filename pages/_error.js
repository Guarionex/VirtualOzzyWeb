import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import status from 'http-status';

import * as ActionCreators from '../action-creators/index.js';

class ErrorPage extends React.Component {
    static getInitialProps(appContext) {
        const dispatch = appContext.reduxStore.dispatch;

        if (appContext.res) {
            ActionCreators.setPageStatusCode(appContext.res.statusCode)(dispatch);
        }

        return {};
    }

    render() {
        return (
            <>
                <div>
                    <h1>There was an error</h1>
                    <p>Status code {this.props.pageStatusCode.statusCode}</p>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps, null)(ErrorPage);
