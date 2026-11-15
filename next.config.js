const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['exoplanetarchive.ipac.caltech.edu', 'tess.mit.edu', 'kepler.nasa.gov'],
  },
  // Remove or comment out the headers configuration to disable CSP
  // headers: async () => {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
