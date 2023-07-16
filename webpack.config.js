/**
 * Main file of webpack config.
 * Please do not modified unless you know what to do
 */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackRTLPlugin = require("webpack-rtl-plugin");
const WebpackMessages = require("webpack-messages");
const del = require("del");
const dotenv = require('dotenv');
const webpack = require('webpack');

// theme name
const themeName = "metronic from webpack";
// global variables
const rootPath = path.resolve(__dirname);
const distPath = rootPath + "/src";

const entries = {
	"sass/style.react": "./src/index.scss"
};

const mainConfig = function () {
	const env = dotenv.config().parsed;
	// reduce it to a nice object, the same as before
	const envKeys = Object.keys(env).reduce((prev, next) => {
		prev[`process.env.${next}`] = JSON.stringify(env[next]);
		return prev;
	}, {});

	return {
		mode: "development",
		stats: "errors-only",
		performance: {
			hints: false
		},
		entry: entries,
		output: {
			// main output path in assets folder
			path: distPath,
			// output path based on the entries' filename
			filename: "[name].js"
		},
		resolve: {extensions: ['.scss']},
		plugins: [
			// webpack log message
			new WebpackMessages({
				name: themeName,
				logger: str => console.log(`>> ${str}`)
			}),
			// create css file
			new MiniCssExtractPlugin({
				filename: "[name].css",
			}),
			new WebpackRTLPlugin({
				filename: "[name].rtl.css",
			}),
			{
				apply: (compiler) => {
					// hook name
					compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
						(async () => {
							await del.sync(distPath + "/sass/*.js", {force: true});
						})();
					});
				}
			},
			new webpack.DefinePlugin(envKeys),
		],
		module: {
			rules: [
				{
					test: /\.scss$/,
					use: [
						MiniCssExtractPlugin.loader,
						"css-loader",
						{
							loader: "sass-loader",
							options: {
								sourceMap: true,
							}
						},
					]
				},
			]
		},
	}
};

module.exports = function () {
	return [mainConfig()];
};
