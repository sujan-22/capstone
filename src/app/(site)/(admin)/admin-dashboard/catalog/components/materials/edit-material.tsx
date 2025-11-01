import { Button } from "@/components/ui/button";
import { CatalogFormDialog, CatalogValues } from "../catalog-form-dialog";
import { FiEdit } from "react-icons/fi";
import z from "zod";

export const EditMaterialDialog: React.FC<{
    initialData: { name: string; description: string; price: number };
    isPending: boolean;
    onSubmit: (v: CatalogValues) => Promise<void> | void;
    schema: z.ZodType<CatalogValues>;
}> = ({ initialData, isPending, onSubmit, schema }) => {
    return (
        <CatalogFormDialog
            title="Edit Material"
            description="Update the material details below."
            labels={{
                nameLabel: "Material name",
                description: "Material description",
                price: "Material price",
            }}
            schema={schema}
            onSubmit={onSubmit}
            initialData={initialData}
            isPending={isPending}
            submitText="Save changes"
            trigger={
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Edit material"
                    icon={FiEdit}
                    iconClassname="mr-0"
                ></Button>
            }
        />
    );
};
