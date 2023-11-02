// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { useBabelRc, addWebpackResolve, addWebpackPlugin, override } = require("customize-cra");
const webpack = require("webpack");
const path = require("path");
const rewireHtmlWebpackPlugin = require("react-app-rewire-html-webpack-plugin");

module.exports = override(
  useBabelRc(),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
      DEBUG: false,
      REACT_APP_TEST: 'testabc',
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_TEST': JSON.stringify(process.env.REACT_APP_TEST || 'testabc')
    })
  ),
  addWebpackResolve({
    extensions: [".ts", ".js"],
    fallback: {
      buffer: require.resolve("buffer"),
    },
  }),
  function override(config, env) {
    const overrideConfig = {
      template: path.resolve(__dirname, "public/index.html"),
      inject: true,
      favicon: "./public/favicon.ico",
    };
    config = rewireHtmlWebpackPlugin(config, env, overrideConfig);
    return config;
  }
);
