const path = require('path');

module.exports = function (options, webpack) {
  const resolve = options.resolve || {};
  const rootDir = path.resolve(__dirname);
  
  return {
    ...options,
    resolve: {
      ...resolve,
      // Add the apps directory and individual app src directories to module resolution
      // This allows webpack to resolve relative imports like ../auth/src/... from any app
      modules: [
        ...(resolve.modules || ['node_modules']),
        path.resolve(rootDir, 'apps/auth/src'),
        path.resolve(rootDir, 'apps/gaming/src'),
        path.resolve(rootDir, 'apps'),
        path.resolve(rootDir),
      ],
      // Ensure webpack can resolve TypeScript files
      extensions: ['.ts', '.js', '.json', ...(resolve.extensions || [])],
      symlinks: false,
    },
  };
};
