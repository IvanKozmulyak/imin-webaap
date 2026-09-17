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
    ];
  },
};

module.exports = nextConfig;
