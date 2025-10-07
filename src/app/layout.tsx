import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import { Toaster } from "@/components/ui/toaster";
import UseNavbarWrapper from "@/components/navbar/use-nav-wrapper";
import ReactQueryProvider from "@/providers/react-query-provider";
import Footer from "@/components/utilities/footer";
import PageTransitionEffect from "@/components/utilities/page-transition";
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
            <body
                className={`${inter.className} antialiased min-h-screen flex flex-col`}
            >
                <ReactQueryProvider>
                    <UseNavbarWrapper />
                    <main className="flex-1 overflow-x-hidden">
                        <MaxWidthWrapper>
                            <PageTransitionEffect>
                                {children}
                            </PageTransitionEffect>
                        </MaxWidthWrapper>
                    </main>
                    <Toaster />
                    <Footer />
                </ReactQueryProvider>
            </body>
        </html>
    );
}
