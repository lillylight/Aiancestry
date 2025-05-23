module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(css|scss)$/,
      use: ['style-loader', 'css-loader', 'sass-loader']
    });
    return config;
  },
  experimental: {
    disableLightningcss: true
  }
};
