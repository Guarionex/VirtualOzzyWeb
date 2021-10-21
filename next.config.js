const config = require('config');
const pickDeep = require('lodash-pickdeep');
const withSass = require('@zeit/next-sass');
const webpackPackage = require('webpack');

module.exports = withSass({
    webpack: (webpackConfig) => {
        webpackConfig.plugins.push(new webpackPackage.DefinePlugin({
            'process.env.CONFIG': JSON.stringify(pickDeep(config, ['baseUrl']))
        }));

        const originalEntry = webpackConfig.entry;

        // eslint-disable-next-line no-param-reassign
        webpackConfig.entry = async () => {
            const entries = await originalEntry();

            if (entries['main.js'] && !entries['main.js'].includes('./polyfills.js')) {
                entries['main.js'].unshift('./polyfills.js');
            }

            return entries;
        };

        return webpackConfig;
    }
});
