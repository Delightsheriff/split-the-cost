const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
// Rive files are bundled as assets and loaded with require().
config.resolver.assetExts.push("riv");

/**
 * NativeWind 4 announces regenerated styles with Metro's old change event
 * (`eventsQueue`), which crashes newer Metro that reads `changes`. Translate
 * the old shape on the way through so live reload keeps working.
 */
function withChangeEventShim(config) {
  const enhance = config.server.enhanceMiddleware;
  config.server.enhanceMiddleware = (middleware, metroServer) => {
    metroServer
      .getBundler()
      .getBundler()
      .getDependencyGraph()
      .then((graph) => {
        const haste = graph._haste;
        if (haste.__changeShim) return;
        haste.__changeShim = true;
        const emit = haste.emit.bind(haste);
        haste.emit = (name, event, ...rest) => {
          if (name !== "change" || !event?.eventsQueue || event.changes) return emit(name, event, ...rest);
          const rootDir = config.projectRoot;
          const modifiedFiles = new Map(
            event.eventsQueue.map((e) => [
              path.relative(rootDir, e.filePath),
              { modifiedTime: Date.now(), isSymlink: false },
            ]),
          );
          return emit(name, {
            rootDir,
            logger: null,
            changes: {
              addedDirectories: new Set(),
              removedDirectories: new Set(),
              addedFiles: new Map(),
              modifiedFiles,
              removedFiles: new Map(),
            },
          });
        };
      });
    return enhance ? enhance(middleware, metroServer) : middleware;
  };
  return config;
}

module.exports = withChangeEventShim(withNativeWind(config, { input: "./app/global.css" }));
