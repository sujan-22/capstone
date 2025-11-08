import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import ImagesOverview from "./components/images-overview";
import { AdminImagesInfo } from "./components/info";

export default async function Page() {
    const { user } = await getServerSideSession();
    if (!user) {
        return notFound();
    }
    return (
        <>
            <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
            >
                <AccordionItem value="item-1">
                    <AccordionTrigger>How to use?</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <AdminImagesInfo />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Separator className="mt-3 mb-5" />
            <ImagesOverview />
        </>
    );
}
