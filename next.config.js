const webpack = require('webpack');

module.exports = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^next\/(navigation|headers)$/ }))
        // Important: return the modified config
        return config
    },
}