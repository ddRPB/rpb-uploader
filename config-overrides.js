// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { useBabelRc, addWebpackResolve, addWebpackPlugin, override } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
    useBabelRc(),
    addWebpackPlugin(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    })),
    addWebpackResolve({
        extensions: ['.ts', '.js'],
        fallback: {
            buffer: require.resolve('buffer'),
        }
    })
);
