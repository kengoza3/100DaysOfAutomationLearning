import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

let apiContext: any;

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Setup HTTP request Headers
test.beforeAll(async ({ playwright }) => {
  let base_url = process.env.SERVICENOW_BASE_URL || '';

  apiContext = await playwright.request.newContext({
    // All requests we send go to this API endpoint.
    baseURL: base_url,
    extraHTTPHeaders: {
      // We set this header per SNOW guidelines.
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Add BASIC Auth to each request
      'Authorization': `Basic ${Buffer.from(`${process.env.SERVICENOW_USERNAME}:${process.env.SERVICENOW_PASSWORD}`).toString('base64')}`,
    },
  });
});

test.afterAll(async ({ }) => {
  // Dispose all responses.
  await apiContext.dispose();
});

// API tests
test('get priority 1 incidents', async () => {
  const response = await apiContext.get(`/api/now/table/incident?sysparm_query=priority=1`);
  // Basic check
  if (!response.ok()) {
    const text = await response.text().catch(() => '<no body>');
    console.error('ServiceNow request failed', response.status(), text.slice(0, 500));
  }
  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  // Normalize result to an array whether API returns a single object or an array
  const results = body.result ? (Array.isArray(body.result) ? body.result : [body.result]) : [];
  expect(Array.isArray(results)).toBeTruthy();

  // Testing GET + JSON field 'priority'
  for (const incident of results) {
    // Coerce priority to string to avoid number vs string mismatches
    expect(String(incident.priority)).toBe('1');
  }
});
test('update incident record INC0007001', async () => {
  const response = await apiContext.get(`/api/now/table/incident/f12ca184735123002728660c4cf6a7ef`);
  // Basic check
  if (!response.ok()) {
    const text = await response.text().catch(() => '<no body>');
    console.error('ServiceNow request failed', response.status(), text.slice(0, 500));
  }
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  // Print response body before normalization for easier debugging
  console.log('Response body:', JSON.stringify(body, null, 2));
  // Normalize result to an array whether API returns a single object or an array
  const results = body.result ? (Array.isArray(body.result) ? body.result : [body.result]) : [];
  expect(Array.isArray(results)).toBeTruthy();
  // Print normalized results for easier debugging
  console.log('Normalized results:', JSON.stringify(results, null, 2));
  
  // Expect exactly one incident record
  expect(results.length).toBe(1);

  // Testing GET + JSON field 'number'
  for (const incident of results) {
    // Coerce number to string to avoid type mismatches
    expect(String(incident.number)).toBe('INC0007001');
  }
});

// UI + API tests
// Validate new incident creation with API and filter in UI
test('create new incident and validate in UI', async ({ page }) => {
  // Create new incident with API
  const postResponse = await apiContext.post(`/api/now/table/incident`, {
    data: {
      short_description: 'Test incident from Playwright',
      caller: 'a8f98bb0eb32010045e1a5115206fe3a'
    }
  });
  // Basic check
  if (!postResponse.ok()) {
    const text = await postResponse.text().catch(() => '<no body>');
    console.error('ServiceNow request failed', postResponse.status(), text.slice(0, 500));
  }
  expect(postResponse.ok()).toBeTruthy();

  const postBody = await postResponse.json();
  const newIncidentNumber = postBody.result.number;
  // const newIncidentNumber = 'INC0010136';
  console.log('Created incident number:', newIncidentNumber);
  
  let username = process.env.SERVICENOW_USERNAME || '';
  let password = process.env.SERVICENOW_PASSWORD || '';
  let base_url = process.env.SERVICENOW_BASE_URL || '';

  // Navigate to the login page
  await page.goto(base_url);
  await page.fill('input[name="user_name"]', username);
  await page.fill('input[name="user_password"]', password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Expect to be redirected to the homepage/dashboard
  await expect(page).toHaveURL(/.*\/now\/nav\/ui\/home/);

  // Validate new incident in UI
  await page.goto(base_url + '/nav_to.do?uri=%2Fincident_list.do%3Fsysparm_query%3Dactive%3Dtrue%5Estate%3D1%5EORDERBYDESCnumber%26sysparm_clear_stack%3Dtrue');
  await page.waitForLoadState('networkidle');

  // Wait for the incident list table to be visible
  await page.getByRole('grid', { name: 'Incidents.'});

  // Point to the iframe by its name or id
  const frame = page.frameLocator('#gsft_main');

  // Filter by the created incident number in the UI filter input if available
  const filterInput = await frame.getByRole('searchbox', { name: 'Search column: number' });
  await filterInput.fill(newIncidentNumber)
  await filterInput.press('Enter');
  await page.waitForTimeout(2000); // Wait for the filtered results to load

  // Assert the new incident appears in the list
  const incidentRow = await frame.getByRole('gridcell', { name: `Open record: ${newIncidentNumber}` });
  await expect(incidentRow).toBeVisible({ timeout: 10000 });
  
  // Optionally, verify the short description in the same row
  const short_description = await frame.getByRole('gridcell', { name: 'Test incident from Playwright' });

  if (await short_description.count() > 0) {
    await expect(short_description).toHaveText(/Test incident from Playwright/, { timeout: 10000 });
  }
});