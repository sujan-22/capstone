import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "designmycase.s3.us-east-1.amazonaws.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
        loader: "default",
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
};

export default nextConfig;
