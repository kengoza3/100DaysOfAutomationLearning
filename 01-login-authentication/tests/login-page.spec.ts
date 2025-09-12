import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from parent directory .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// load env variables
const username = process.env.SERVICENOW_USERNAME;
const password = process.env.SERVICENOW_PASSWORD;
const base_url = process.env.SERVICENOW_BASE_URL;

test('is servicenow page', async ({ page }) => {
  
  if (!username || !password || !base_url) {
    throw new Error('SERVICENOW_USERNAME, SERVICENOW_PASSWORD, and SERVICENOW_BASE_URL environment variables must be set');
  }

  await page.goto(base_url);

  // Retrieve the title of the page
  const title = await page.title();
  console.log("The title is: ", title);

  // Retrieve the URL of the page
  const url = page.url();
  console.log("The URL is: ", url);

  // Assert the title and URL
  expect(title).toBe('Log in | ServiceNow');
  expect(url).toBe('https://empkgonzalez2.service-now.com/');
});

test('invalid login', async ({ page }) => {
  
  if (!username || !password || !base_url) {
    throw new Error('SERVICENOW_USERNAME, SERVICENOW_PASSWORD, and SERVICENOW_BASE_URL environment variables must be set');
  }

  await page.goto(base_url);

  // Attempt to log in with invalid credentials
  await page.fill('input[name="user_name"]', 'invalid_user');
  await page.fill('input[name="user_password"]', 'invalid_pass');

  // Click the log in button
  await page.getByRole('button', { name: 'Log in' }).click();

  // Expect "User name or password invalid" error message to be visible
  await expect(page.getByText('User name or password invalid')).toBeVisible();
});

test('valid login', async ({ page }) => {
  
  if (!username || !password || !base_url) {
    throw new Error('SERVICENOW_USERNAME, SERVICENOW_PASSWORD, and SERVICENOW_BASE_URL environment variables must be set');
  }
  
  await page.goto(base_url);
  // Log in with valid credentials
  await page.fill('input[name="user_name"]', username);
  await page.fill('input[name="user_password"]', password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Expect to be redirected to the homepage/dashboard
  await expect(page).toHaveURL(/.*\/now\/nav\/ui\/home/);

  // Optionally verify presence of a dashboard element to confirm successful login
  await expect(page.getByRole('heading', { name: /Shared admin dashboard/i })).toBeVisible();
  // Log out to reset state for other tests
  // click on the user menu button with id equal to user-menu
  //await page.locator('#user-menu').click().catch(() => {});
  await page.getByRole('button', { name: 'wpt.admin: Available' }).click();
  await page.getByRole('button', { name: 'Log out' }).click().catch(() => {});
  await expect(page).toHaveURL(/.*\/navpage\.do/);
});

// test password field masking
test('password field masking', async ({ page }) => {
  if (!username || !password || !base_url) {
    throw new Error('SERVICENOW_USERNAME, SERVICENOW_PASSWORD, and SERVICENOW_BASE_URL environment variables must be set');
  }
  await page.goto(base_url);
  const passwordInput = page.locator('input[name="user_password"]');
  await expect(passwordInput).toHaveAttribute('type', 'password');
});