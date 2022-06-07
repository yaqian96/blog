const projectName = require("./project");
const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
console.log(
  "当前启动项目为：" + resolve("../src/pages/" + projectName.name + "/")
);
var titles = "";
switch (projectName.name) {
  case "test1":
    titles = "测试1";
    break;
  case "test2":
    titles = "测试2";
    break;
  default:
    break;
}
const config = {
  pages: {
    index: {
      entry: "src/pages/" + projectName.name + "/main.js",
      // 统一的入口
      template: "htmlEntry/" + projectName.name + ".html",
      filename: "index.html",
      title: titles,
      chunks: ["chunk-vendors", "chunk-common", "index"],
    },
  },
  outputDir: "dist/" + projectName.name + "/",
  devServer: {
    // 设置主机地址
    host: "0.0.0.0",
    // 设置默认端口
    port: 8080,
    // 设置代理
    proxy: {
      "/api": {
        // 目标 API 地址
        target: "",
        ws: false,
        // 将主机标头的原点更改为目标URL
        changeOrigin: false,
        pathRewrite: {
          "^/api": "",
        },
        secure: false,
      },
    },
  },
  chainWebpack: (config) => {
    config.entry.app = [
      "babel-polyfill",
      "../src/pages/" + projectName.name + "/main.js",
    ];
    config.resolve.alias
      .set("@", resolve("../src/pages/" + projectName.name + "/"))
      .set("$pages", resolve("../src/"))
      .set("static", resolve("../public/static/"))
      .set("@assets", resolve("../src/pages/" + projectName.name + "/assets/"));
  },
};
module.exports = config;
