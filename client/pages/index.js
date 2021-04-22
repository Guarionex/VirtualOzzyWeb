import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as ActionCreators from '../action-creators/index.js';

class Home extends React.Component {
    componentDidMount() {
        //TODO Mount any initial stuff
    }

    render() {
        return (
            <div>
                <h1>Virtual Ozzy LLC</h1>
                <h3>Welcome to Virtual Ozzy LLC</h3>
            </div>
        );
    }
}

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ActionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps, null)(Home);
