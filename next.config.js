const withCSS = require('@zeit/next-css');
const withSass = require('@zeit/next-sass');

module.exports = withCSS(withSass({
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(css|scss)$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass'),
          },
        },
      ]
    });
    return config;
  }
}));
