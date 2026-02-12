const path = require('path');

module.exports = function (options, webpack) {
  const rootDir = path.resolve(__dirname);
  const resolve = options.resolve || {};
  
  // Create a custom resolver plugin to handle relative paths across apps
  const NormalModuleReplacementPlugin = webpack.NormalModuleReplacementPlugin;
  
  return {
    ...options,
    resolve: {
      ...resolve,
      // Ensure node_modules is resolved first
      modules: [
        path.resolve(rootDir, 'node_modules'), // node_modules must come first
        ...(resolve.modules || []),
      ],
      // Ensure webpack can resolve TypeScript files
      extensions: ['.ts', '.js', '.json', ...(resolve.extensions || [])],
      symlinks: false,
    },
    plugins: [
      ...(options.plugins || []),
      // Add plugin to handle relative imports from gaming to auth
      new NormalModuleReplacementPlugin(
        /^\.\.\/auth\/src\//,
        (resource) => {
          // Replace ../auth/src/... with the absolute path
          resource.request = resource.request.replace(
            /^\.\.\/auth\/src\//,
            path.resolve(rootDir, 'apps/auth/src/') + '/'
          );
        }
      ),
    ],
  };
};
