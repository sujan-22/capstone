import { getServerSideSession } from "@/hooks/use-session";
import CaseDesignComponent, { ICaseDesignProps } from "./case_design";

export default async function FeaturedDesigns() {
    const { user } = await getServerSideSession();
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/get-featured-designs`,
        {
            headers: {
                "x-user-id": user?.id || "",
            },
            cache: "no-cache",
        }
    );

    const designs: ICaseDesignProps[] = await res.json();

    return (
        <section
            className="
    grid grid-cols-1 
    [@media(min-width:550px)]:grid-cols-2 
    [@media(min-width:800px)]:grid-cols-3 
    gap-6
  "
        >
            {designs.map((design) => (
                <CaseDesignComponent
                    key={design.caseName}
                    {...design}
                    user={user}
                />
            ))}
        </section>
    );
}
