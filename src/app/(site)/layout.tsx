import UseNavbarWrapper from "@/components/navbar/use-nav-wrapper";
import Footer from "@/components/utilities/footer";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-dvh flex-col">
            <UseNavbarWrapper />
            <main id="main" className="isolate flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
