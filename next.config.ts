import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["designmycase.s3.us-east-1.amazonaws.com"],
        loader: "default",
    },
};

export default nextConfig;
