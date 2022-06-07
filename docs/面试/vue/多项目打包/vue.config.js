const path = require("path");
const conf = require("./config/projectConfig");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
  pages: conf.pages,
  publicPath: "./",
  outputDir: conf.outputDir,
  assetsDir: "static",
  //取消eslint检查
  lintOnSave: false,
  devServer: conf.devServer,
  productionSourceMap: false,
  chainWebpack: conf.chainWebpack,
  configureWebpack: {
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
  },
  css: {
    loaderOptions: {
      sass: {},
    },
    sourceMap: false,
  },
};
