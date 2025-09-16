import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import { Toaster } from "@/components/ui/toaster";
import UseNavbarWrapper from "@/components/navbar/use-nav-wrapper";
import ReactQueryProvider from "@/providers/react-query-provider";
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
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                <ReactQueryProvider>
                    <UseNavbarWrapper />
                    <MaxWidthWrapper>{children}</MaxWidthWrapper>
                    <Toaster />
                </ReactQueryProvider>
            </body>
        </html>
    );
}
