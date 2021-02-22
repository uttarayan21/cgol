const path = require("path");
// const dist = path.resolve(__dirname, "dist");
// const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
// const wasmRustDir = path.resolve(__dirname);

module.exports = function override(config, env) {
  // config.plugins.push(
  //   new WasmPackPlugin({
  //     crateDirectory: wasmRustDir,
  //     args: "--log-level warn",
  //     outDir: path.join(wasmRustDir, "pkg"),
  //     extraArgs: "",
  //   })
  // );
  config.entry = "./src/bootstrap.ts";
  const wasmExtensionRegExp = /\.wasm$/;

  config.resolve.extensions.push(".wasm");

  config.module.rules.forEach((rule) => {
    (rule.oneOf || []).forEach((oneOf) => {
      if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
        // make file-loader ignore WASM files
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });

  // add a dedicated loader for WASM
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, "../pkg"),
    use: [{ loader: require.resolve("wasm-loader"), options: {} }],
  });

  return config;
};
