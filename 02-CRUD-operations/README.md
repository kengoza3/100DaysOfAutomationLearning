# Project 2: CRUD Operations with ServiceNow API & UI Testing

This project demonstrates comprehensive CRUD (Create, Read, Update, Delete) testing using Playwright with ServiceNow's REST API and UI validation. Part of my [#100DaysOfAutomationLearning](https://github.com/yourusername/100DaysOfAutomationLearning) journey.

## 🎯 Project Overview

**Objective**: Master hybrid API + UI testing approaches for enterprise applications, specifically focusing on ServiceNow incident management workflows.

**Tech Stack**: Playwright, TypeScript, ServiceNow REST API, ServiceNow UI

## 🔧 Key Technical Learnings

### Playwright Configuration for API Testing

**playwright.config.ts** essential configurations for API testing:

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.SERVICENOW_BASE_URL,
    extraHTTPHeaders: {
      'Authorization': `Basic ${Buffer.from(`${process.env.SERVICENOW_USERNAME}:${process.env.SERVICENOW_PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json'
    }
  }
});
```

**Critical configurations**:
1. **baseURL** - Centralizes API endpoint management
2. **extraHTTPHeaders** - Handles authentication for API calls

### Hybrid Testing Approach: API + UI Validation

**Challenge**: Combining API operations with UI verification in the same test suite.

**Solution**: Separate API client configuration from UI navigation to prevent authentication conflicts.

## 🚧 Key Challenges & Solutions

### Challenge 1: Environment Configuration
**Issue**: Forgot to specify .env file location in playwright.config.ts  
**Solution**: Proper path configuration using `dotenv.config({ path: '../.env' })`

### Challenge 2: Authentication Conflict (Major Learning!)
**Issue**: 
- API tests worked perfectly with `extraHTTPHeaders` containing Authorization
- UI tests failed when same headers were applied globally
- ServiceNow login page kept reloading/rejecting sessions

**Root Cause**: Global `extraHTTPHeaders` with Authorization were being sent to ALL requests, including UI navigation requests like `/login.do`. ServiceNow interpreted these differently than standard browser form login.

**Solution**: 
```typescript
// Separate API client for ServiceNow REST operations
const apiContext = await request.newContext({
  baseURL: process.env.SERVICENOW_BASE_URL,
  extraHTTPHeaders: {
    'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    'Content-Type': 'application/json'
  }
});

// UI login remains clean - form POST with application/x-www-form-urlencoded
await page.goto('/login.do');
await page.fill('#user_name', username);
await page.fill('#user_password', password);
await page.click('#sysverb_login');
```

## 💡 Pro Tips Discovered

1. **Playwright's Built-in Request Class**: No need to import external HTTP modules - Playwright comes with robust API testing capabilities out of the box

2. **Postman Integration**: Valuable for initial API exploration and documentation
   - Functional testing
   - Integration testing  
   - End-to-end API workflows
   - [Example Workspace](https://gonzalk2095-9456735.postman.co/workspace/91a44a4f-33f5-494a-ad88-5f744aef6d75/collection/48415198-2e4667a1-cf3a-41b3-a579-668254ad5cde)

3. **Authentication Strategy**: Understand the difference between API authentication (headers) and UI authentication (form-based) to avoid session conflicts

## 🔄 CRUD Operations Implemented

- **Create**: New incident records via API with UI verification
- **Read**: Query incidents and validate data consistency 
- **Update**: Modify incident states and validate changes across API/UI
- **Delete**: Remove records with proper cleanup verification

## 📈 Skills Developed

- Hybrid API + UI testing strategies
- ServiceNow REST API integration
- Authentication handling for enterprise applications  
- Playwright request context management
- Environment-based configuration
- Debugging authentication conflicts

## 🎯 Next Steps

Moving to **Project 3**: API-heavy applications with dynamic content loading

---

*This project is part of my public learning journey to build QE consulting skills using AI-guided learning. Follow along at [#100DaysOfAutomationLearning](https://linkedin.com/in/yourprofile)*

# hiccups
1. forgot to add the location of the .evn file in playwright.config.ts
2. ui + api tests
  - when testing api i added extraHTTPHeaders to playwright.config.ts that correctly tested the api
  - when need to validate via the ui the headers defined in extraHTTPHeaders were causing SNOW login to fail
  - Fix: Use an API client with basic auth for the ServiceNow REST API, separate from the UI login. Ensures login behaves like Chrome (form POST with application/x-www-form-urlencoded, no Authorization header). By putting extraHTTPHeaders with Authorization at the global level in your playwright.config.ts, Playwright is sending those headers on every single request, including UI navigation requests like /login.do. ServiceNow interprets that differently than the browser form login and rejects the session, which is why you see the page reloading.
