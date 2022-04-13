// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { useBabelRc, addWebpackResolve, addWebpackPlugin, override } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
    useBabelRc(),
    addWebpackPlugin(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
    })),
    addWebpackResolve({
        extensions: ['.ts', '.js'],
        // alias: {
        //     http: "stream-http",
        //     https: "https-browserify",
        //     stream: "stream-browserify",
        //     timers: "timers-browserify",
        //     zlib: "browserify-zlib"
        // },
        fallback: {
            buffer: require.resolve('buffer'),
            // stream: require.resolve('stream-browserify'),
            // zlib: require.resolve('browserify-zlib')
        }

    })
);
