/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13+
  // output: 'standalone', // Disabled for local development - uploads need public folder
  
  // Image optimization for Netlify
  images: {
    unoptimized: true,
  },
  
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'core-js': 'core-js-pure'
    };

    config.module.rules.push({
      test: /[\\/]core-js(-pure)?[\\/]/,
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          configFile: false,
          presets: [
            ['@babel/preset-env', { modules: 'commonjs' }]
          ],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    });

    return config;
  }
}

module.exports = nextConfig
