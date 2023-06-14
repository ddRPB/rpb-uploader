/**
 * https://www.toptal.com/react/webpack-react-tutorial-pt-1
 */

const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (_env, argv) {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    devtool: isDevelopment ? "cheap-module-source-map" : "source-map",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "assets/js/[name].[contenthash:8].js",
      publicPath: "/uploader/",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? "production" : "development",
            },
          },
        },
        {
          test: /\.css$/,
          use: [isProduction ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        }, //,
        // {
        //     test: /\.(eot|otf|ttf|woff|woff2)$/,
        //     loader: require.resolve("file-loader"),
        //     options: {
        //         name: "static/media/[name].[hash:8].[ext]",
        //     }
        // }
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
      fallback: {
        buffer: require.resolve("buffer"),
      },
    },
    plugins: [
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "assets/css/[name].[contenthash:8].css",
          chunkFilename: "assets/css/[name].[contenthash:8].chunk.css",
        }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
        inject: true,
        favicon: "./public/favicon.ico",
      }),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      // adding copyright and license information to the webpack output *.js.LICENSE.txt
      new webpack.BannerPlugin("RPB-uploader " + "Copyright (C) 2013-2022 RPB Team. " + "@license AGPL-3.0-or-later"),
    ].filter(Boolean),
  };
};
