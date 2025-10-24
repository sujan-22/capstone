import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "DESIGNMYCASE | HOME",
    description:
        "Create your own custom phone case with DESIGNMYCASE. Upload images, choose your device model, adjust placement, and order your personalized case with ease.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased min-h-screen`}>
                <ReactQueryProvider>
                    {children}
                    <Toaster />
                </ReactQueryProvider>
            </body>
        </html>
    );
}
