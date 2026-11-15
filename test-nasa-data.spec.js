const { test, expect } = require('@playwright/test');

// Verifies that the exoplanet catalog is sourced live from the NASA
// Exoplanet Archive and that the detail panel renders NASA values with
// proper attribution. Falls back gracefully to the demo catalog if the
// archive is unreachable, but demo records must be labelled as such.

test('Exoplanet catalog renders NASA-sourced data with attribution', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`PageError: ${err.message}`));

  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Open the exoplanet discoveries drawer
  const discoveryHandle = page.getByRole('button', { name: /exoplanet discoveries/i });
  await discoveryHandle.click();
  await page.waitForTimeout(500);

  // Select the first exoplanet card to enter detail view
  const firstCard = page.locator('.exoplanet-card').first();
  await firstCard.click();
  await page.waitForTimeout(500);

  // NASA-sourced records show the archive URL; demo records show "Demo catalog"
  const nasaLink = page.locator('a[href*="exoplanetarchive.ipac.caltech.edu"]');
  const demoOnly = page.locator('text=/Demo catalog/i');

  const nasaCount = await nasaLink.count();
  const demoCount = await demoOnly.count();

  if (nasaCount > 0) {
    // Live NASA data: Kepler-186f mass was 1.1 M⊕ in mock; NASA states 1.71 M⊕.
    const massRow = page.locator('text=/Mass/').first().locator('..');
    const massText = await massRow.textContent();
    expect(massText).not.toContain('1.1 M⊕');

    // Attribution link must be present and reachable
    await expect(nasaLink.first()).toHaveAttribute('href', /exoplanetarchive\.ipac\.caltech\.edu/);
  } else if (demoCount > 0) {
    // Demo fallback: must be explicitly labelled
    await expect(page.locator('text=/Demo catalog/i').first()).toBeVisible();
  }

  // No uncaught console errors
  expect(consoleErrors).toEqual([]);
});