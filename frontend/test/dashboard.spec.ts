import { test, expect } from '@playwright/test';

test.describe('Dashboard End-to-End Tests', () => {
  test('should load dashboard and navigate to URL details', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the dashboard title is visible
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
    
    // Verify the "Add URLs for analysis" section is present
    await expect(page.getByText('Add URLs for analysis')).toBeVisible();
    
    // Verify the URL input is present
    await expect(page.getByPlaceholder('Enter website URL')).toBeVisible();
    
    // Verify the table is present (even if empty)
    await expect(page.getByText('No URLs added yet. Add a URL to get started!')).toBeVisible();
    
    // Add a test URL
    await page.getByPlaceholder('Enter website URL').fill('https://example.com');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for the URL to be added (this might show a loading state)
    await page.waitForTimeout(2000);
    
    // Verify the URL appears in the table
    await expect(page.getByText('https://example.com')).toBeVisible();
    
    // Click on the URL row to navigate to details
    await page.getByText('https://example.com').click();
    
    // Verify we're on the details page
    await expect(page).toHaveURL(/\/urls\/\d+/);
    
    // Wait for the details page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the details page shows the URL
    await expect(page.getByText('https://example.com')).toBeVisible();
  });

  test('should handle table interactions', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Add a test URL
    await page.getByPlaceholder('Enter website URL').fill('https://test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for the URL to be added
    await page.waitForTimeout(2000);
    
    // Verify the table shows the URL
    await expect(page.getByText('https://test.com')).toBeVisible();
    
    // Test global search functionality
    await page.getByPlaceholder('Search all columns...').fill('test');
    await expect(page.getByText('https://test.com')).toBeVisible();
    
    // Clear search
    await page.getByPlaceholder('Search all columns...').clear();
    await expect(page.getByText('https://test.com')).toBeVisible();
    
    // Test pagination controls are present (even if not functional with few items)
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    
    // Test page size selector
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to add an invalid URL
    await page.getByPlaceholder('Enter website URL').fill('invalid-url');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Verify error message is shown
    await expect(page.getByText('Please enter a valid URL')).toBeVisible();
    
    // Try to add a valid URL format
    await page.getByPlaceholder('Enter website URL').clear();
    await page.getByPlaceholder('Enter website URL').fill('https://valid-url.com');
    await page.getByRole('button', { name: 'Add' }).click();
    
    // Wait for potential loading state
    await page.waitForTimeout(1000);
    
    // The URL should be added without error
    await expect(page.getByText('https://valid-url.com')).toBeVisible();
  });

  test('should test bulk actions', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Add multiple test URLs
    const testUrls = [
      'https://example1.com',
      'https://example2.com',
      'https://example3.com'
    ];
    
    for (const url of testUrls) {
      await page.getByPlaceholder('Enter website URL').fill(url);
      await page.getByRole('button', { name: 'Add' }).click();
      await page.waitForTimeout(1000);
    }
    
    // Verify all URLs are visible
    for (const url of testUrls) {
      await expect(page.getByText(url)).toBeVisible();
    }
    
    // Select the first URL using checkbox
    await page.locator('input[type="checkbox"]').first().check();
    
    // Verify bulk actions are visible
    await expect(page.getByText('1 URL(s) selected')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Selected' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stop Selected' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Selected' })).toBeVisible();
  });
}); 