// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { useBabelRc, addWebpackResolve, addWebpackPlugin, override } = require('customize-cra');
const webpack = require('webpack');
const path = require("path");
const rewireHtmlWebpackPlugin = require('react-app-rewire-html-webpack-plugin')
const rewireSourceMap = require('react-app-rewire-source-map-loader')

module.exports = override(
    useBabelRc(),
    addWebpackPlugin(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
    })),
    addWebpackResolve({
        extensions: ['.ts', '.js'],
        fallback: {
            buffer: require.resolve('buffer'),
        }

    }),

    function override(config, env) {
        const overrideConfig = {
            template: path.resolve(__dirname, "public/index.html"),
            inject: true,
            favicon: "./public/favicon.ico"
        }
        config = rewireHtmlWebpackPlugin(config, env, overrideConfig);
        env = 'development'
        rewireSourceMap(config, env);

        return config
    }



);
