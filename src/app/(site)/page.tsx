import RenderFeaturedDesigns from "@/components/case-design/render-featured-designs";
import Reviews from "@/components/utilities/reviews";
import RenderImageGallery from "@/components/image-gallery/render-image-gallery";
import CalltoActionReviewDesign from "@/components/utilities/cta-review";
import Hero from "@/components/home/hero";
import Ticker from "@/components/home/ticker";
import HowItWorks from "@/components/home/how-it-works";
import { getServerSideSession } from "@/hooks/use-session";

export default async function Home() {
    const { user } = await getServerSideSession();

    return (
        <>
            <Hero signedIn={!!user} />
            <Ticker />
            <HowItWorks />
            <RenderFeaturedDesigns />
            <RenderImageGallery />
            <Reviews />
            <CalltoActionReviewDesign />
        </>
    );
}
