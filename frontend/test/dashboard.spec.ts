import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1200, height: 800 } });

test.describe('Dashboard Main Flow', () => {
  test('should add a URL and navigate to its details', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for a known element to ensure the app has rendered
    await page.waitForSelector('text=Add URLs for analysis', { timeout: 10000 });

    // Add the URL
    await page.getByPlaceholder('Enter website URL').fill('https://example.com');
    await page.getByRole('button', { name: 'Add' }).click();


    // Wait for the row with the URL and "queued" status to appear
    const urlRow = page.getByRole('row', { name: "https://example.com" }).first();
    await expect(urlRow).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'debug-dashboard-urlrow.png', fullPage: true });



    await urlRow.click();


    await page.waitForFunction(() => window.location.pathname.startsWith('/urls/'), null, { timeout: 10000 });
    
    await expect(page.getByText('URL Analysis Details')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('https://example.com')).toBeVisible({ timeout: 10000 });
  });
}); 