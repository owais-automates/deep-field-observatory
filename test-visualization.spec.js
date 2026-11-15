const { test, expect } = require('@playwright/test');

test('Three.js and Recharts runtime verification', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  // Wait for Three.js canvas to render
  await page.waitForSelector('canvas', { timeout: 10000 });

  // ===== THREE.JS VERIFICATION =====
  const canvasBox = await page.locator('canvas').boundingBox();

  console.log('=== THREE.JS CANVAS ===');
  console.log(`Canvas width: ${canvasBox.width}px`);
  console.log(`Canvas height: ${canvasBox.height}px`);
  console.log(`Canvas width > 0: ${canvasBox.width > 0}`);
  console.log(`Canvas height > 0: ${canvasBox.height > 0}`);

  // Check canvas dimensions via JS (don't create context - let Three.js own it)
  const canvasDims = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    return { width: canvas.width, height: canvas.height };
  });
  console.log(`Canvas internal width: ${canvasDims.width}px`);
  console.log(`Canvas internal height: ${canvasDims.height}px`);

  // Capture screenshot of Three.js canvas (mounted directly by StarSystem3D)
  const canvas = page.locator('canvas').first();
  await canvas.screenshot({ path: 'threejs-verification.png' });
  console.log('Screenshot saved: threejs-verification.png');

  // Resize viewport and verify canvas adapts
  await page.setViewportSize({ width: 800, height: 600 });
  await page.waitForTimeout(500);
  const canvasBoxAfterResize = await page.locator('canvas').boundingBox();
  console.log(`After resize (800x600) - canvas width: ${canvasBoxAfterResize.width}px`);
  console.log(`After resize (800x600) - canvas height: ${canvasBoxAfterResize.height}px}`);

  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForTimeout(500);
  const canvasBoxAfterResize2 = await page.locator('canvas').boundingBox();
  console.log(`After resize (1400x900) - canvas width: ${canvasBoxAfterResize2.width}px`);
  console.log(`After resize (1400x900) - canvas height: ${canvasBoxAfterResize2.height}px}`);

  // ===== RECHARTS VERIFICATION =====
  console.log('\n=== RECHARTS ===');

  // Open the Analytics panel (chart is conditionally mounted in the current shell)
  const analyticsButton = page.getByRole('button', { name: 'Analytics' });
  if (await analyticsButton.count() > 0) {
    await analyticsButton.click();
    await page.waitForTimeout(500);
  }

  const rechartsContainer = page.locator('.recharts-responsive-container').first();
  const rechartsBox = await rechartsContainer.boundingBox();
  console.log(`ResponsiveContainer width: ${rechartsBox.width}px`);
  console.log(`ResponsiveContainer height: ${rechartsBox.height}px`);
  console.log(`ResponsiveContainer width > 0: ${rechartsBox.width > 0}`);
  console.log(`ResponsiveContainer height > 0: ${rechartsBox.height > 0}`);

  const svgCount = await page.locator('.recharts-responsive-container svg').count();
  console.log(`SVG elements in chart: ${svgCount}`);
  console.log(`SVG elements > 0: ${svgCount > 0}`);

  const pathCount = await page.locator('.recharts-responsive-container .recharts-path').count();
  const rectCount = await page.locator('.recharts-responsive-container .recharts-rectangle').count();
  const dotCount = await page.locator('.recharts-responsive-container .recharts-dot').count();
  console.log(`Path elements (line charts): ${pathCount}`);
  console.log(`Rectangle elements (bar charts): ${rectCount}`);
  console.log(`Dot elements (data points): ${dotCount}`);

  const gridCount = await page.locator('.recharts-responsive-container .recharts-cartesian-grid').count();
  console.log(`CartesianGrid present: ${gridCount > 0}`);

  const xAxisCount = await page.locator('.recharts-responsive-container .recharts-xaxis').count();
  const yAxisCount = await page.locator('.recharts-responsive-container .recharts-yaxis').count();
  console.log(`XAxis present: ${xAxisCount > 0}`);
  console.log(`YAxis present: ${yAxisCount > 0}`);

  const rechartsSection = page.locator('.recharts-responsive-container').first();
  await rechartsSection.screenshot({ path: 'recharts-verification.png' });
  console.log('Screenshot saved: recharts-verification.png');

  await page.setViewportSize({ width: 800, height: 600 });
  await page.waitForTimeout(500);
  const rechartsBoxAfterResize = await page.locator('.recharts-responsive-container').first().boundingBox();
  console.log(`After resize (800x600) - ResponsiveContainer width: ${rechartsBoxAfterResize.width}px`);
  console.log(`After resize (800x600) - ResponsiveContainer height: ${rechartsBoxAfterResize.height}px}`);

  await page.setViewportSize({ width: 1400, height: 900 });
  await page.waitForTimeout(500);
  const rechartsBoxAfterResize2 = await page.locator('.recharts-responsive-container').first().boundingBox();
  console.log(`After resize (1400x900) - ResponsiveContainer width: ${rechartsBoxAfterResize2.width}px`);
  console.log(`After resize (1400x900) - ResponsiveContainer height: ${rechartsBoxAfterResize2.height}px}`);

  // ===== CONSOLE ERRORS =====
  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected.');
  } else {
    consoleErrors.forEach(err => console.log(`  - ${err}`));
  }

  // ===== ASSERTIONS =====
  console.log('\n=== TEST RESULTS ===');
  expect(canvasBox.width).toBeGreaterThan(0);
  expect(canvasBox.height).toBeGreaterThan(0);
  expect(canvasDims.width).toBeGreaterThan(0);
  expect(canvasDims.height).toBeGreaterThan(0);
  expect(rechartsBox.width).toBeGreaterThan(0);
  expect(rechartsBox.height).toBeGreaterThan(0);
  expect(svgCount).toBeGreaterThan(0);
});