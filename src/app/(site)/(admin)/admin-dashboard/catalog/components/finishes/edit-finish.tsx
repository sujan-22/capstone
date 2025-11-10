import { Button } from "@/components/ui/button";
import { CatalogFormDialog, CatalogValues } from "../catalog-form-dialog";
import { FiEdit } from "react-icons/fi";
import z from "zod";

export const EditFinishDialog: React.FC<{
    initialData: { name: string; description: string; price: number };
    isPending: boolean;
    onSubmit: (v: CatalogValues) => Promise<void> | void;
    schema: z.ZodType<CatalogValues>;
}> = ({ initialData, isPending, onSubmit, schema }) => {
    return (
        <CatalogFormDialog
            title="Edit Finish"
            description="Update the finish details below."
            labels={{
                nameLabel: "Finish name",
                description: "Finish description",
                price: "Finish price",
            }}
            schema={schema}
            onSubmit={onSubmit}
            initialData={initialData}
            isPending={isPending}
            submitText="Save"
            trigger={
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Edit finish"
                    icon={FiEdit}
                    iconClassname="mr-0"
                ></Button>
            }
        />
    );
};
