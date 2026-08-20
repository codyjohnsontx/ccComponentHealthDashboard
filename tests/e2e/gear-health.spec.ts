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

  await page.getByRole("radio", { name: "Specialized Crux", exact: true }).click();
  await expect(cards.filter({ hasText: "Specialized Crux" })).not.toHaveCount(0);
  await expect(cards.filter({ hasText: "Factor OSTRO VAM" })).toHaveCount(0);

  await sections.getByRole("link", { name: "Alerts" }).click();
  await expect(page.getByRole("heading", { name: "Active service queue" })).toBeVisible();

  await sections.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();

  // Remounting the dashboard must not overwrite the filter the rider chose.
  await expect(cards.filter({ hasText: "Specialized Crux" })).not.toHaveCount(0);
  await expect(cards.filter({ hasText: "Factor OSTRO VAM" })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();
  await expect(cards.filter({ hasText: "Specialized Crux" })).not.toHaveCount(0);
  await expect(cards.filter({ hasText: "Factor OSTRO VAM" })).toHaveCount(0);
});

test("bike filter exposes the selected bike in the accessibility tree", async ({ page }) => {
  const filters = page.getByRole("radiogroup", { name: "Bike filters" });
  const cards = page.getByRole("article");

  await page.goto("/projects/cc-component-health/dashboard");
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();

  // The pills are one mutually exclusive choice, so the computed tree must be a
  // named radio group whose checked member names the bike on screen. Asserting
  // the tree rather than the markup is the point: an aria attribute on the wrong
  // element still reads correctly in the source.
  await expect(filters).toMatchAriaSnapshot(`
    - radiogroup "Bike filters":
      - text: Bike filters
      - radio "All bikes" [checked]
      - text: All bikes
      - radio "Factor OSTRO VAM"
      - text: Factor OSTRO VAM
      - radio "Specialized Crux"
      - text: Specialized Crux
  `);

  // Tab order runs from the subnav straight into the group, and a radio group
  // takes a single tab stop that lands on the checked option.
  await page.getByRole("button", { name: "Restore defaults" }).focus();
  await page.keyboard.press("Tab");
  await expect(filters.getByRole("radio", { name: "All bikes" })).toBeFocused();

  // Arrow keys move the selection without a mouse, and the tree follows.
  await page.keyboard.press("ArrowDown");
  await expect(filters.getByRole("radio", { name: "Factor OSTRO VAM" })).toBeChecked();
  await expect(cards.filter({ hasText: "Specialized Crux" })).toHaveCount(0);

  await page.keyboard.press("ArrowDown");
  await expect(filters.getByRole("radio", { name: "Specialized Crux" })).toBeChecked();
  await expect(filters.getByRole("radio", { name: "All bikes" })).not.toBeChecked();
  await expect(cards.filter({ hasText: "Factor OSTRO VAM" })).toHaveCount(0);

  // Returning to the dashboard must re-enter the group on the chosen bike, so a
  // keyboard user finds the selection without hunting for a colour.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Current replacement timing" })).toBeVisible();
  await page.getByRole("button", { name: "Restore defaults" }).focus();
  await page.keyboard.press("Tab");
  await expect(filters.getByRole("radio", { name: "Specialized Crux" })).toBeFocused();
});
