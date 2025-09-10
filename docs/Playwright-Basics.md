# Playwright — Quick Reference

This README collects common Playwright Test commands, snippets, and patterns to help you get started quickly or to act as a cheat-sheet.

## Quick start: create or add Playwright

- Initialize a new project (wizard will ask about TypeScript, example tests, and browsers):

```powershell
npm init playwright@latest
```

- Add Playwright to an existing project (install packages + browsers):

```powershell
npm install -D @playwright/test
npx playwright install
```

- Generate snippets (recorder) from a URL:

```powershell
npx playwright codegen https://example.com
```

## Minimal test example

JavaScript / TypeScript using Playwright Test:

```ts
import { test, expect } from '@playwright/test';

test('basic page checks', async ({ page }) => {
	await page.goto('https://example.com');
	await expect(page).toHaveTitle(/Example/);
	await expect(page.locator('h1')).toBeVisible();
});
```

## Common locators

- By text:
	- `page.locator('text=Sign in')` or `page.getByText('Sign in')`
- By role (recommended for accessibility):
	- `page.getByRole('button', { name: 'Submit' })`
- By label (form fields):
	- `page.getByLabel('Email')`
- By placeholder:
	- `page.getByPlaceholder('Search')`
- By test id (data attributes):
	- `page.locator('[data-test-id="login"])` or `page.getByTestId('login')`
- CSS selector:
	- `page.locator('css=div > a')` or `page.locator('div.header > a.login')`
- XPath (use sparingly):
	- `page.locator('//button[text()="OK"]')`

Tip: prefer `getBy*` and semantic selectors (role/label) for more robust tests.

## Basic actions

- Navigation: `await page.goto(url)`
- Click: `await page.click('selector')` or `await page.getByRole('button', { name: 'Next' }).click()`
- Fill a text field: `await page.fill('input[name="q"]', 'playwright')`
- Type with delay: `await page.type('#input', 'hello', { delay: 100 })`
- Press keyboard keys: `await page.press('#input', 'Enter')`
- Hover: `await page.hover('selector')`
- Select option: `await page.selectOption('select#country', 'US')`
- Check/uncheck: `await page.check('input#agree')`, `await page.uncheck('input#agree')`
- Waits: prefer built-in waiting assertions (e.g., expect toBeVisible) instead of explicit sleeps.

Example combining actions:

```ts
await page.goto('https://example.com/login');
await page.fill('#email', 'me@example.com');
await page.fill('#password', 'secret');
await page.click('button[type=submit]');
await expect(page).toHaveURL(/dashboard/);
```

## Useful assertions (expect)

- URL and navigation:
	- `await expect(page).toHaveURL('https://example.com/dashboard')`
	- `await expect(page).toHaveURL(/dashboard/)`
- Title:
	- `await expect(page).toHaveTitle('My App')`
- Visibility / presence:
	- `await expect(locator).toBeVisible()`
	- `await expect(locator).toBeHidden()`
	- `await expect(locator).toHaveCount(3)`
- Text and content:
	- `await expect(locator).toHaveText('Welcome back')`
	- `await expect(locator).toContainText('Hello')`
- Form values:
	- `await expect(locator).toHaveValue('example')`
- Attribute checks:
	- `await expect(locator).toHaveAttribute('href', '/logout')`

All `expect` calls accept an optional `{ timeout }` param.

## Test hooks

Playwright Test provides hooks for setup/teardown:

```ts
import { test } from '@playwright/test';

test.beforeAll(async () => {
	// one-time setup (start service, seed DB)
});

test.afterAll(async () => {
	// global cleanup
});

test.beforeEach(async ({ page }) => {
	// runs before each test; create a fresh page or seed state
	await page.goto('https://example.com');
});

test.afterEach(async ({ page }) => {
	// per-test cleanup if needed
	await page.close();
});
```

## Steps, groups and interactions

- Group tests with `test.describe()`:

```ts
test.describe('Auth flows', () => {
	test('login', async ({ page }) => { /* ... */ });
	test('logout', async ({ page }) => { /* ... */ });
});
```

- Use `test.step()` to annotate logical steps for clearer reports and debugging:

```ts
await test.step('fill login form', async () => {
	await page.fill('#email', 'me@example.com');
	await page.fill('#password', 'secret');
});
```

- Data-driven loops (simple pattern):

```ts
const users = [ { email: 'a@x.com' }, { email: 'b@x.com' } ];
for (const user of users) {
	test(`email validation ${user.email}`, async ({ page }) => {
		// test body
	});
}
```

## Running tests

- Run all tests:

```powershell
npx playwright test
```

- Run a single file or directory:

```powershell
npx playwright test tests/example.spec.ts
npx playwright test tests/auth/
```

- Run tests headed (see browser):

```powershell
npx playwright test --headed
```

- Run a single test by title:

```powershell
npx playwright test -g "login"
```

- Run with a specific browser project (from playwright.config):

```powershell
npx playwright test --project=chromium
```

- Run the HTML report after tests complete:

```powershell
npx playwright show-report
```

## Debugging tips

- Open the inspector during a run:

```powershell
npx playwright test --debug
```

- Use `page.pause()` in a test to open the inspector at that point.
- Use `npx playwright codegen` to interactively record flows and get selectors.

## Recommended small practices

- Prefer semantic selectors (`getByRole`, `getByLabel`) for stability.
- Avoid brittle CSS/XPath that depends on layout.
- Keep tests isolated: use `test.beforeEach` to prepare a known state.
- Use `await expect(...).toBeVisible()` instead of manual waits.

## Useful commands summary

```powershell
npm init playwright@latest   # create a project
npm install -D @playwright/test
npx playwright install       # install browsers
npx playwright test          # run tests
npx playwright codegen URL   # generate interactions
npx playwright show-report   # view test report
```

---

If you want, I can also add a tiny example test suite inside `Project1/tests/` and a minimal `package.json`/`playwright.config.ts` to make this repo runnable. Tell me if you want TypeScript or JavaScript examples.