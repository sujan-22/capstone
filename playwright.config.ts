import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    reporter: "html",
    use: {
        baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        { name: "setup", testMatch: /e2e\/auth\.setup\.ts/ },

        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                storageState: "playwright/.auth/user.json",
            },
            dependencies: ["setup"],
        },
        // {
        //     name: "firefox",
        //     use: {
        //         ...devices["Desktop Firefox"],
        //         storageState: "playwright/.auth/user.json",
        //     },
        //     dependencies: ["setup"],
        // },
        // {
        //     name: "webkit",
        //     use: {
        //         ...devices["Desktop Safari"],
        //         storageState: "playwright/.auth/user.json",
        //     },
        //     dependencies: ["setup"],
        // },
    ],
    webServer: {
        command: "npm run start",
        url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
    },
});
