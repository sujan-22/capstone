import { Button } from "@/components/ui/button";
import { CatalogFormDialog, CatalogValues } from "../catalog-form-dialog";
import z from "zod";
import { MdAdd } from "react-icons/md";

export const CreateMaterialDialog: React.FC<{
    isPending: boolean;
    onSubmit: (v: CatalogValues) => Promise<void> | void;
    schema: z.ZodType<CatalogValues>;
}> = ({ isPending, onSubmit, schema }) => {
    return (
        <CatalogFormDialog
            title="Add Material"
            description="Create a new material."
            labels={{
                nameLabel: "Material name",
                description: "Material description",
                price: "Material price",
            }}
            schema={schema}
            onSubmit={onSubmit}
            isPending={isPending}
            submitText="Save"
            trigger={<Button icon={MdAdd}>Add material</Button>}
        />
    );
};
