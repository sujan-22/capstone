import React from "react";
import ColorsOverview from "./components/colors/colors-overview";
import ModelsOverview from "./components/models/models-overview";
import FinishesOverview from "./components/finishes/finishes-overview";
import MaterialsOverview from "./components/materials/materials-overview";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const DashboardCatalog = () => {
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
        >
            <AccordionItem value="item-1">
                <AccordionTrigger>Manage Colors</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <ColorsOverview />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Manage Phone Models</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <ModelsOverview />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Manage Finishes</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <FinishesOverview />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger>Manage Materials</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    <MaterialsOverview />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default DashboardCatalog;
