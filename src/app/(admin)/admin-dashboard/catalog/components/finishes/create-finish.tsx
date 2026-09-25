import { Button } from "@/components/ui/button";
import { CatalogFormDialog, CatalogValues } from "../catalog-form-dialog";
import z from "zod";
import { MdAdd } from "react-icons/md";

export const CreateFinishDialog: React.FC<{
    isPending: boolean;
    onSubmit: (v: CatalogValues) => Promise<void> | void;
    schema: z.ZodType<CatalogValues>;
}> = ({ isPending, onSubmit, schema }) => {
    return (
        <CatalogFormDialog
            title="Add Finish"
            description="Create a new finish."
            labels={{
                nameLabel: "Finish name",
                description: "Finish description",
                price: "Finish price",
            }}
            schema={schema}
            onSubmit={onSubmit}
            isPending={isPending}
            submitText="Save"
            trigger={<Button icon={MdAdd}>Add finish</Button>}
        />
    );
};
