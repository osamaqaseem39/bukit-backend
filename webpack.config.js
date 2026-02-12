const path = require('path');

module.exports = function (options, webpack) {
  const rootDir = path.resolve(__dirname);
  
  // Find and update the TypeScript loader rule to include all apps
  const updatedRules = (options.module?.rules || []).map(rule => {
    // Check if this is the TypeScript rule
    if (rule.test && (rule.test.toString().includes('ts') || rule.test.toString().includes('\\.ts'))) {
      return {
        ...rule,
        include: [
          path.resolve(rootDir, 'apps'),
        ],
        options: {
          ...rule.options,
          // Ensure ts-loader uses the correct tsconfig that includes all apps
          configFile: path.resolve(rootDir, 'apps/api/tsconfig.app.json'),
        },
      };
    }
    return rule;
  });
  
  return {
    ...options,
    resolve: {
      ...options.resolve,
      extensions: ['.ts', '.js', '.json', ...(options.resolve?.extensions || [])],
      symlinks: false,
    },
    module: {
      ...options.module,
      rules: updatedRules,
    },
  };
};
