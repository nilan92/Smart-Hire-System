# QA

This folder holds the project's QA artifacts: the test plan, the test case
matrix, a manual/exploratory checklist, and a standalone smoke-test script.
It documents and exercises the automated test suites that already live next
to the code — it does not duplicate them.

## Where the automated tests actually live

Automated tests stay next to the code they test, because the tooling
requires it (pytest needs `conftest.py` in a parent-relative location;
Angular's test builder discovers `*.spec.ts` files relative to `src/`).

- **Backend (pytest):** `backend/app/tests/`
- **Frontend (Vitest via Angular's test builder):** `*.spec.ts` files
  co-located with each component/service in `frontend/src/app/`

## How to run everything

```bash
# Backend — 24 tests, run against an isolated in-memory SQLite DB
cd backend
source venv/bin/activate
python -m pytest app/tests/ -v

# Frontend — 24 tests across 19 spec files
cd frontend
npx ng test
```

Both suites are self-contained (no real database or network access
required) and safe to run repeatedly.

## What's in this folder

| File | Purpose |
|---|---|
| [`TEST_PLAN.md`](TEST_PLAN.md) | Scope, approach, environments, and what's automated vs. manual |
| [`test_cases.md`](test_cases.md) | Test case matrix mapping features to specific test cases and their automation status |
| [`manual_test_checklist.md`](manual_test_checklist.md) | Exploratory/manual QA checklist for what automation doesn't cover (visual, cross-role UX) |
| [`smoke_test.py`](smoke_test.py) | Standalone end-to-end smoke test against a **running** backend — not part of the pytest suite, see below |
| [`test_mcp_server.py`](test_mcp_server.py) | Real MCP protocol test for `backend/mcp_server/server.py` — spawns it as a subprocess and drives it as an MCP client would, not just direct function calls |

## Why `smoke_test.py` is separate from `backend/app/tests/`

The pytest suite is unit/integration-level: each test spins up a fresh
in-memory SQLite database and never touches the network. `smoke_test.py` is
a different kind of check — it drives the actual HTTP API of a **running**
backend process (e.g. Supabase-backed, exactly as deployed) through one full
real-world user journey in one pass, the way a QA engineer would run a
manual smoke test before a release. It creates and then deletes its own
throwaway test accounts, so it's safe to run against the real dev database.

```bash
# with the backend already running on http://127.0.0.1:8000
python qa/smoke_test.py
```

## Testing the MCP server

`test_mcp_server.py` spawns `backend/mcp_server/server.py` itself (it doesn't need the dev server running) and talks to it over stdio using the real `mcp` client SDK — the same handshake a real MCP client does. Also self-cleaning for anything it creates.

```bash
source backend/venv/bin/activate
python qa/test_mcp_server.py
```
