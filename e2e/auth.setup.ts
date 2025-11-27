import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const STATE_PATH = "playwright/.auth/user.json";

test("UI login via /sign-in and save storageState", async ({
    page,
    baseURL,
    context,
}) => {
    if (!baseURL) throw new Error("baseURL is required");

    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });

    await page.goto("/sign-in");

    const username = "designmycase";
    const password = "Sujan@2244";

    const usernameInput = page.getByRole("textbox", { name: /username/i });
    const passwordInput = page.getByRole("textbox", { name: /password/i });

    await usernameInput.fill(username);
    await passwordInput.fill(password);

    const remember = page.locator("#remember-me");
    if (await remember.isVisible().catch(() => false)) {
        if (!(await remember.isChecked().catch(() => true)))
            await remember.check();
    }

    await Promise.all([
        page.waitForLoadState("networkidle"),
        page.getByRole("button", { name: /^sign in$/i }).click(),
    ]);

    const res = await page.request.get("/api/auth/get-session", {
        headers: { accept: "application/json" },
    });
    if (!res.ok()) {
        throw new Error(
            `get-session failed: ${res.status()} ${res.statusText()}\n${await res.text()}`
        );
    }

    await page.waitForURL("/");

    await context.storageState({ path: STATE_PATH });
});
