# ChatKro

Create a `.env` file in the project root with `MONGO_DB_URI` and `JWT_SECRET`.

Install dependencies from the project root and start the API:

```sh
npm install
npm run dev
```

In another terminal, start the frontend:

```sh
cd frontend
npm install
npm run dev
```

The Vite development server runs on port 3000 and proxies `/api` and `/socket.io` to the API on port 8000. The production server serves the built frontend from `frontend/dist`; build it with `npm run build` from the project root.

Run the focused tests with `npm test` after installing both sets of dependencies.
