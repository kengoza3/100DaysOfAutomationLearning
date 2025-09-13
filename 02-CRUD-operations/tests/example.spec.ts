import { test, expect } from '@playwright/test';

const REPO = 'test-repo-1';
const USER = 'github-username';

test('get priority 1 incidents', async ({ request }) => {
  const response = await request.get(`/api/now/table/incident?sysparm_query=priority=1`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.result).toBeInstanceOf(Array);
  for (const incident of body.result) {
    expect(incident.priority).toBe('1');
  }
});

test('should create a feature request', async ({ request }) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: '[Feature] request 1',
      body: 'Feature description',
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: '[Feature] request 1',
    body: 'Feature description'
  }));
});