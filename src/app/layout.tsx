import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import { Toaster } from "@/components/ui/toaster";
import UseNavbarWrapper from "@/components/navbar/use-nav-wrapper";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
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
            <body className={`${poppins.className} antialiased`}>
                <UseNavbarWrapper />
                <MaxWidthWrapper>{children}</MaxWidthWrapper>
                <Toaster />
            </body>
        </html>
    );
}
