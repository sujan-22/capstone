import React, { Suspense } from "react";
import CatalogTabs from "./components/catalog-tabs";
import { AdminCatalogInfo } from "./components/info";
import AdminPageHeader from "../components/page-header";

const DashboardCatalog = () => {
    return (
        <div className="space-y-8">
            <AdminPageHeader
                eyebrow="04 · Catalog"
                title="Catalog"
                description="Everything a customer chooses in the editor: colours, phone models, materials and finishes, with their prices."
                guide={<AdminCatalogInfo />}
            />
            <Suspense>
                <CatalogTabs />
            </Suspense>
        </div>
    );
};

export default DashboardCatalog;
