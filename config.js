System.config({
  baseURL: "/code/ol3-lab",
  defaultJSExtensions: true,
  transpiler: false,
  paths: {
    "npm:*": "jspm_packages/npm/*",
  },

  map: {
    "openlayers": "npm:openlayers@3.12.1"
  }
});
