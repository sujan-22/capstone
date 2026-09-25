import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query-provider";
import MotionProvider from "@/providers/motion-provider";
import { Toaster } from "@/components/ui/toaster";

const archivo = Archivo({
    subsets: ["latin"],
    axes: ["wdth"],
    style: ["normal", "italic"],
    variable: "--font-archivo",
    display: "swap",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "DesignMyCase — Custom phone cases printed from your photos",
        template: "%s · DesignMyCase",
    },
    description:
        "Create your own custom phone case with DesignMyCase. Upload a photo, place it on a live case, choose your model, material and finish, and we print it to order.",
};

export const viewport: Viewport = {
    themeColor: "#f2efe8",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${archivo.variable} ${geistMono.variable}`}>
            <body className="min-h-dvh">
                <ReactQueryProvider>
                    <MotionProvider>
                        {children}
                        <Toaster />
                    </MotionProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
