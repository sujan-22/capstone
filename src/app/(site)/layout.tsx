import MaxWidthWrapper from "@/components/utilities/max-width-wrapper";
import UseNavbarWrapper from "@/components/navbar/use-nav-wrapper";
import Footer from "@/components/utilities/footer";
import PageTransitionEffect from "@/components/utilities/page-transition";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <UseNavbarWrapper />
            <main className="flex-1 overflow-x-hidden">
                <MaxWidthWrapper>
                    <PageTransitionEffect>{children}</PageTransitionEffect>
                </MaxWidthWrapper>
            </main>
            <Footer />
        </div>
    );
}
