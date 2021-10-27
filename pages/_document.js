import React from 'react';
import Document, {Head, Main, NextScript} from 'next/document.js';
import * as styledComponents from 'styled-components';

import Header from '../components/shared/Header.js';

export default class VirtualOzzyWebDocument extends Document {
    static async getInitialProps(appContext) {
        const initialProps = await Document.getInitialProps(appContext);
        const styledComponentsStyleSheet = new styledComponents.ServerStyleSheet();

        return {
            ...initialProps,
            styles: [
                ...React.Children.toArray(initialProps.styles),
                styledComponentsStyleSheet.getStyleElement()
            ]
        };
    }

    render() {
        return (
            <html lang="en">
            <Head>
                <Header styleTags={this.props.styleTags} />
            </Head>
            <body>
            <Main />
            <NextScript />
            </body>
            </html>
        );
    }
}
