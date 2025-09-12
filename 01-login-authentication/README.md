# Lessons learned — Login authentication experiments

This folder contains experiments with Playwright Test while implementing login and authentication flows. Below are the concise lessons I collected, practical notes and a short list of things I'm curious to explore next.

## Short, practical takeaways

- Test file naming: Playwright Test looks for common patterns by default. Use one of these for TypeScript projects:
  - `*.spec.ts` (most common)
  - `*.test.ts`
  - (JavaScript) `*.spec.js`, `*.test.js`

- Navigation example:

```ts
await page.goto('https://playwright.dev/');
```

- Keep tests focused and idempotent. Use `beforeEach` to prepare state and avoid shared side effects between tests.

## What I learned about the login flow

- Use environment variables for credentials (don't hardcode secrets in tests). Example variables used in this folder: `SERVICENOW_USERNAME`, `SERVICENOW_PASSWORD`.
- Prefer semantic selectors for stability (see the selector section below).
- Use `expect(page).toHaveURL(...)` and visibility assertions to confirm successful navigation after login.

## Selectors: getByRole vs id/test-id

Why prefer `getByRole` (and other `getBy*` helpers) over raw id/CSS selectors:

- Accessibility alignment — `getByRole` leverages the accessibility tree (what screen readers use). Writing tests this way nudges the app toward better a11y.
- Stability — role + accessible name often change less frequently than internal ids or layout-based selectors.
- Readability — `page.getByRole('button', { name: 'Log in' })` reads like a user action.

Example comparison:

```ts
// brittle: depends on id
await page.locator('#loginBtn').click();

// descriptive and resilient
await page.getByRole('button', { name: 'Log in' }).click();
```

When to use ids or `data-testid`:
- Multiple identical role/name items on the page (e.g., multiple "Edit" buttons in a table).
- Rapidly changing copy where role/name is unstable.
- Legacy apps that don't expose proper labels/roles.

Playwright's philosophy: default to `getByRole` for human-centric, accessible tests; fall back to test ids when needed for determinism.

## Things I'm curious to explore next

1. Browser context vs pages: how contexts isolate storage (cookies, localStorage) and why that matters for parallel tests and multi-user scenarios.
2. Accessible name and role computation algorithm: understand how Playwright derives accessible names and roles so I can write better locators and a11y tests.
3. Playwright codegen vs a Model Context Protocol (MCP) server: use-cases and trade-offs for recording interactions vs programmatic control.

## Notes and small tips

- If a test intermittently fails when waiting for navigation, prefer `await expect(page).toHaveURL(...)` rather than blind `waitForTimeout` sleeps.
- Add `page.pause()` during development to interactively inspect state using the inspector.
- Keep `.env` out of source control and load it via `dotenv` or Playwright `globalSetup` so `process.env.*` is available in tests.