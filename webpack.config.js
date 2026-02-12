const path = require('path');

module.exports = function (options, webpack) {
  const rootDir = path.resolve(__dirname);
  
  // Find and update the TypeScript loader rule to include all apps
  const updatedRules = (options.module?.rules || []).map(rule => {
    // Check if this is the TypeScript rule
    if (rule.test && (rule.test.toString().includes('ts') || rule.test.toString().includes('\\.ts'))) {
      const updatedRule = {
        ...rule,
        include: [
          path.resolve(rootDir, 'apps'),
        ],
      };

      // If rule has a 'use' property, modify loader options within the use array
      // Cannot have both 'use' and 'options' at rule level (webpack restriction)
      if (rule.use) {
        const updateLoaderOptions = (loader) => {
          const loaderName = typeof loader === 'string' 
            ? loader 
            : (loader.loader || loader);
          
          // Check if this is ts-loader
          if (loaderName && loaderName.toString().includes('ts-loader')) {
            if (typeof loader === 'string') {
              return {
                loader,
                options: {
                  configFile: path.resolve(rootDir, 'apps/api/tsconfig.app.json'),
                },
              };
            } else {
              return {
                ...loader,
                options: {
                  ...loader.options,
                  configFile: path.resolve(rootDir, 'apps/api/tsconfig.app.json'),
                },
              };
            }
          }
          return loader;
        };

        const updatedUse = Array.isArray(rule.use) 
          ? rule.use.map(updateLoaderOptions)
          : updateLoaderOptions(rule.use);

        updatedRule.use = updatedUse;
        // Remove options from rule level if it exists (since we have 'use')
        delete updatedRule.options;
      } else {
        // If rule doesn't have 'use', we can add options directly
        updatedRule.options = {
          ...rule.options,
          configFile: path.resolve(rootDir, 'apps/api/tsconfig.app.json'),
        };
      }

      return updatedRule;
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
