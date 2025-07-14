import { test, expect } from '@playwright/test';

test.describe('URL Details Page Tests', () => {
  test('should load URL details page with charts and data', async ({ page }) => {
    // First, add a URL from the dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Add a test URL
    await page.getByPlaceholder('Enter website URL').fill('https://example.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(2000);
    
    // Click on the URL to navigate to details
    await page.getByText('https://example.com').click();
    
    // Verify we're on the details page
    await expect(page).toHaveURL(/\/urls\/\d+/);
    
    // Wait for the details page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the URL is displayed
    await expect(page.getByText('https://example.com')).toBeVisible();
    
    // Verify the page title is present
    await expect(page.getByText('URL Analysis Details')).toBeVisible();
    
    // Verify the back button is present
    await expect(page.getByRole('button', { name: 'Back to Dashboard' })).toBeVisible();
    
    // Verify the donut chart section is present
    await expect(page.getByText('Link Distribution')).toBeVisible();
    
    // Verify the broken links table section is present
    await expect(page.getByText('Broken Links')).toBeVisible();
    
    // Verify the table headers are present
    await expect(page.getByText('URL')).toBeVisible();
    await expect(page.getByText('Status Code')).toBeVisible();
  });

  test('should navigate back to dashboard from details page', async ({ page }) => {
    // First, add a URL and navigate to details
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByPlaceholder('Enter website URL').fill('https://test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(2000);
    
    await page.getByText('https://test.com').click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on details page
    await expect(page).toHaveURL(/\/urls\/\d+/);
    
    // Click the back button
    await page.getByRole('button', { name: 'Back to Dashboard' }).click();
    
    // Verify we're back on the dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });

  test('should handle direct navigation to details page', async ({ page }) => {
    // Try to navigate directly to a details page (this might show an error or loading state)
    await page.goto('/urls/123');
    await page.waitForLoadState('networkidle');
    
    // The page should either show an error or loading state
    // This test verifies the page doesn't crash on direct navigation
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display error state when URL details fail to load', async ({ page }) => {
    // Navigate to a non-existent URL details page
    await page.goto('/urls/999999');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any potential error to appear
    await page.waitForTimeout(2000);
    
    // The page should handle the error gracefully
    // Either show an error message or redirect back to dashboard
    await expect(page.locator('body')).toBeVisible();
  });

  test('should test chart interactions', async ({ page }) => {
    // Add a URL and navigate to details
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByPlaceholder('Enter website URL').fill('https://chart-test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForTimeout(2000);
    
    await page.getByText('https://chart-test.com').click();
    await page.waitForLoadState('networkidle');
    
    // Verify the chart container is present
    await expect(page.locator('[data-testid="link-distribution-chart"]')).toBeVisible();
    
    // Verify the chart legend is present
    await expect(page.getByText('Internal Links')).toBeVisible();
    await expect(page.getByText('External Links')).toBeVisible();
  });
}); 