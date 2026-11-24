# CampusOS

CampusOS is a browser-based event dashboard for a university. It uses the sample events and registrations from the MongoDB assignment and lets an administrator manage tickets, check-ins, and university workspaces.

## Run the app

There is no build step or package installation. From this directory, start Python's local web server:

```sh
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

Bookings, event edits, check-ins, university workspaces, and profile changes are saved in the current browser's local storage. Use the university selector in the sidebar to switch workspaces or add one. A new workspace can start empty or copy the sample data. Select the profile at the bottom of the sidebar, or its avatar in the top bar, to edit the name, email, and role.

Each university has its own events and registrations. The app does not use a server account, sync data between devices, or connect to MongoDB. **Reset sample data** in Query Studio restores the assignment records for the selected university.

## Seed MongoDB

Install MongoDB Shell, then run the script against a fresh `campus_events` database:

```sh
mongosh < mongosh.js
```

The script inserts three clubs, three events, and four registrations. It then runs the assignment's search queries, a guarded seat decrement for `EVT101`, a check-in update for `TICK-2026-001`, a duplicate-safe `CloudInc` sponsor update, and aggregations for event revenue, department participation, and turnout.

## Project files

- `index.html` contains the app screens and controls.
- `styles.css` defines the responsive dark interface.
- `app.js` handles the demo data, navigation, and interactive actions.
- `mongosh.js` seeds MongoDB and runs the example queries.
