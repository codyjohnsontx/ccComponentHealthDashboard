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

test("bike filter survives leaving the dashboard and coming back", async ({ page }) => {
  const sections = page.getByLabel("Gear Health sections");
  const cards = page.getByRole("article");

  await page.goto("/projects/cc-component-health/dashboard");
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();

  await page.getByRole("button", { name: "Specialized Crux", exact: true }).click();
  await expect(cards.filter({ hasText: "Specialized Crux" })).not.toHaveCount(0);
  await expect(cards.filter({ hasText: "Factor OSTRO VAM" })).toHaveCount(0);

  await sections.getByRole("link", { name: "Alerts" }).click();
  await expect(page.getByRole("heading", { name: "Active service queue" })).toBeVisible();

  await sections.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();

  // Remounting the dashboard must not overwrite the filter the rider chose.
  await expect(cards.filter({ hasText: "Specialized Crux" })).not.toHaveCount(0);
  await expect(cards.filter({ hasText: "Factor OSTRO VAM" })).toHaveCount(0);
});
