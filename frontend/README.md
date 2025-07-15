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
