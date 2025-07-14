# End-to-End Tests

This directory contains end-to-end tests for the web scraper dashboard using Playwright.

## Test Coverage

### Dashboard Tests (`dashboard.spec.ts`)
- ✅ Load dashboard page and verify UI elements
- ✅ Add URLs and verify they appear in the table
- ✅ Navigate from dashboard to URL details page
- ✅ Test table interactions (search, pagination, sorting)
- ✅ Handle error states (invalid URLs)
- ✅ Test bulk actions (select multiple URLs)

### URL Details Tests (`url-details.spec.ts`)
- ✅ Load URL details page with charts and data
- ✅ Navigate back to dashboard from details page
- ✅ Handle direct navigation to details page
- ✅ Display error states when URL details fail to load
- ✅ Test chart interactions and data visualization

## Running Tests

### Prerequisites
1. Make sure the backend server is running
2. Install dependencies: `npm install`

### Test Commands

```bash
# Run all tests in headless mode
npm run test

# Run tests with UI (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run specific test file
npx playwright test dashboard.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

### Test Configuration

The tests are configured in `playwright.config.ts`:
- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Chrome, Firefox, Safari
- **Auto-start dev server**: Tests automatically start the dev server
- **Retries**: 2 retries on CI, 0 locally
- **Parallel execution**: Enabled for faster test runs

## Test Structure

Each test follows this pattern:
1. **Setup**: Navigate to page and wait for load
2. **Action**: Perform user interactions (click, type, etc.)
3. **Assertion**: Verify expected outcomes
4. **Cleanup**: Tests are isolated and don't require cleanup

## Writing New Tests

1. Create a new `.spec.ts` file in the `test/` directory
2. Import `test` and `expect` from `@playwright/test`
3. Use descriptive test names and group related tests with `test.describe()`
4. Follow the existing patterns for navigation, waiting, and assertions

## Debugging Tests

### Visual Debugging
```bash
# Run with UI for step-by-step debugging
npm run test:ui

# Run in headed mode to see browser
npm run test:headed
```

### Code Debugging
```bash
# Run in debug mode with breakpoints
npm run test:debug
```

### Screenshots and Videos
- Failed tests automatically capture screenshots and videos
- View them in the `test-results/` directory
- Use `--reporter=html` for detailed HTML reports

## Best Practices

1. **Wait for elements**: Use `waitForLoadState()` and `waitForSelector()`
2. **Use data attributes**: Prefer `data-testid` over text content for selectors
3. **Isolate tests**: Each test should be independent
4. **Handle async operations**: Use appropriate waits for API calls
5. **Test error states**: Verify error handling and user feedback 