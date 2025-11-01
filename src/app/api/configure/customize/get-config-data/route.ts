import { pool } from "@/lib/database/db";
import {
    CaseColor,
    CaseFinish,
    CaseMaterial,
    PhoneModel,
} from "@/lib/database/table_types";
import { NextResponse } from "next/server";

export interface ConfigDataResponse {
    phoneModels: PhoneModel[];
    caseMaterials: CaseMaterial[];
    caseFinishes: CaseFinish[];
    caseColors: CaseColor[];
}

export async function GET() {
    const client = await pool.connect();

    try {
        const [phoneRes, materialRes, finishRes, colorRes] = await Promise.all([
            client.query<PhoneModel>(
                "SELECT * FROM phone_model WHERE active = TRUE ORDER BY created_at"
            ),
            client.query<CaseMaterial>(
                "SELECT * FROM case_material WHERE active = TRUE ORDER BY created_at"
            ),
            client.query<CaseFinish>(
                "SELECT * FROM case_finish WHERE active = TRUE ORDER BY created_at"
            ),
            client.query<CaseColor>(
                "SELECT * FROM case_color WHERE active = TRUE ORDER BY created_at"
            ),
        ]);

        const response: ConfigDataResponse = {
            phoneModels: phoneRes.rows,
            caseMaterials: materialRes.rows,
            caseFinishes: finishRes.rows,
            caseColors: colorRes.rows,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (err: unknown) {
        console.error("Error fetching config data:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to fetch config data", details: message },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
