import { expect, test } from "@playwright/test";

test("seeded demo navigation stays intact", async ({ page }) => {
  await page.goto("/projects/cc-component-health");
  await page.getByText("Loading ride and component state...").waitFor({
    state: "hidden"
  });
  await expect(page.getByRole("link", { name: "Open dashboard" }).first()).toBeVisible();

  await page.getByRole("link", { name: "Open dashboard" }).first().click();
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();

  await page
    .getByLabel("Gear Health sections")
    .getByRole("link", { name: "Alerts" })
    .click();
  await expect(page.getByRole("heading", { name: "Active service queue" })).toBeVisible();
});
