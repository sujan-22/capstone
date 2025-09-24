import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: [
            "designmycase.s3.us-east-1.amazonaws.com",
            "lh3.googleusercontent.com",
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
