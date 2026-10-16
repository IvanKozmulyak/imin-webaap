/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // One canonical origin: www.imin.wtf served a duplicate 200 copy.
        source: '/:path*',
        has: [{ type: 'host', value: 'www.imin.wtf' }],
        destination: 'https://imin.wtf/:path*',
        permanent: true,
      },
      // The rewrite targets below are files too; keep one URL per page.
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/pro/index.html', destination: '/pro', permanent: true },
    ];
  },
  // The two landing pages are static HTML in public/ (vanilla JS + GSAP, no React).
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/pro', destination: '/pro/index.html' },
      ],
    };
  },
};

module.exports = nextConfig;
