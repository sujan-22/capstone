import React from "react";
import { getServerSideSession } from "@/hooks/use-session";
import { notFound } from "next/navigation";
import CustomersOverview from "./components/customers-overview";
import { AdminCustomersInfo } from "./components/info";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
                        <AdminCustomersInfo />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Separator className="mt-3 mb-5" />
            <CustomersOverview user={user} />
        </>
    );
}
