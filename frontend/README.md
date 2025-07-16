# frontend

## How to run

- Install dependencies:
  ```
  npm install
  ```
- Create a `.env` file in the frontend root with your Auth0 config:
  ```
  VITE_AUTH0_DOMAIN=your-auth0-domain
  VITE_AUTH0_CLIENT_ID=your-auth0-client-id
  VITE_AUTH0_AUDIENCE=your-auth0-api-identifier
  ```
- Start the dev server:
  ```
  npm run dev
  ```
- The app runs at [http://localhost:5173](http://localhost:5173)

---

## Running Unit Tests (Jest)

- To run all unit tests:
  ```
  npm test
  ```
- To run only tests in a specific directory or file:
  ```
  npm test -- src/__tests__
  npm test -- src/__tests__/AuthProvider.test.tsx
  ```
- To run in watch mode:
  ```
  npm test -- --watch
  ```

---

## Running E2E Playwright tests

This project includes end-to-end (E2E) tests for the dashboard and URL details flows using [Playwright](https://playwright.dev/).

### 1. Start the mock backend
In a separate terminal:
```sh
cd backend/test
npm install express cors   # Only needed the first time
node mock-server.js
```
This will start the mock backend at [http://localhost:3001](http://localhost:3001).

### 2. Run the frontend with mock auth and mock backend
In another terminal:
```sh
cd frontend
VITE_USE_MOCK_AUTH=true VITE_API_URL=http://localhost:3001 npm run dev
```

### 3. Run the Playwright dashboard E2E test (which also checks details)
In another terminal:
```sh
cd frontend
npm run test:e2e -- test/dashboard.spec.ts
```

- This test will:
  - Add a URL via the dashboard
  - Wait for it to appear in the table
  - Click the row to navigate to the details page
  - Assert that the details page loads and displays the correct information

### 4. (Optional) Run all E2E tests
```sh
npm run test:e2e
```

---

## Approach

- **React + TypeScript + Vite** for fast, modern SPA development.
- **Modular structure**:
  - `src/components/` – UI components (Dashboard, Sidebar, Header, Layout, etc.)
  - `src/components/table/` – Table and card views for URLs (responsive, mobile-friendly)
  - `src/components/urlDetail/` – URL detail and chart views
  - `src/auth/` – All authentication logic (Auth0, login/logout, route protection)
  - `src/api/` – Decoupled API layer for backend calls, with robust error handling
  - `src/hooks/` – Custom hooks (e.g., real-time SSE for status updates)
  - `src/utils/` – Mapping and utility functions
- **Authentication**:  
  - Uses Auth0 (free tier) for secure login/logout and route protection.
  - All routes are protected; users must log in to use the app.
  - Auth logic is fully modular and can be swapped if needed.
- **Real-time updates**:  
  - Uses Server-Sent Events (SSE) to update URL status and StatCards live.
  - No polling; UI is always up to date.
- **Bulk actions**:  
  - Select URLs via checkboxes for bulk re-run analysis or delete.
  - All actions are robust to network errors and backend downtime.
- **Mobile-first**:  
  - Table switches to card/list view on mobile for usability.
  - Responsive layout throughout.
- **Error handling**:  
  - All API/network errors are caught and shown in the UI.
  - If Auth0 config is missing, a generic user-friendly error is shown.
- **Code splitting**:  
  - Expensive routes/components are lazy-loaded for fast initial load.

---

## Notes

- The frontend expects the backend to be running and reachable at `/api`.
- If the backend is down, the app will show a clear error and not crash.
- For Auth0, you must set up an application and API in your Auth0 dashboard.

---

## TODOs

- Add more granular error messages and retry options for network failures.
- Add tests for auth flows and error boundaries.
- Polish mobile/tablet experience further if needed.
