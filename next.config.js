/** @type {import('next').NextConfig} */
const nextConfig = {
    // Mark heavy server-only packages as external to avoid bundling issues
    serverExternalPackages: ['pdf-parse', 'article-extractor'],

    // Allow images from external sources
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ],
    },

    // Turbopack config for faster dev builds
    experimental: {},

    // Silence the "punycode" deprecation warning from dependencies
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
