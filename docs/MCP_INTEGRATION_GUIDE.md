# MCP (Model Context Protocol) Integration Guide

## Overview

This Playwright test automation framework is enhanced with MCP (Model Context Protocol) servers to provide advanced testing capabilities including:

- **Enhanced Test Execution**: Real-time test monitoring and reporting
- **API Validation**: Backend endpoint verification during UI tests
- **Database Validation**: Direct database state verification
- **Performance Monitoring**: Real-time performance metrics collection
- **Email Verification**: Automated email delivery testing
- **Advanced Reporting**: Rich test reports with multiple data sources

## MCP Servers Configuration

### Current MCP Servers

1. **Playwright Testing Server** (`mcp-playwright`)
   - Test execution monitoring
   - Screenshot capture
   - Test result aggregation
   - Performance metrics

2. **Web Automation Server** (`mcp-web-automation`)
   - Enhanced element interactions
   - Smart wait strategies
   - Form validation
   - Navigation verification

3. **Test Reporting Server** (`mcp-allure-reporting`)
   - Advanced Allure integration
   - Custom test attachments
   - Test step tracking
   - Status management

4. **Database Validation Server** (`mcp-database`)
   - Direct database queries
   - Data validation
   - State verification
   - Record existence checks

5. **API Testing Server** (`mcp-api-client`)
   - HTTP request validation
   - Response verification
   - Status code checking
   - Data extraction

## Setup Instructions

### 1. Install UV and UVX

```bash
# Install UV (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or using pip
pip install uv

# UVX is included with UV
```

### 2. Verify MCP Configuration

The MCP configuration is located in `.kiro/settings/mcp.json`. Verify the servers are properly configured:

```bash
# Check MCP server status (if using Kiro IDE)
# Or manually verify the configuration file exists
cat .kiro/settings/mcp.json
```

### 3. Install MCP Dependencies

```bash
# The MCP servers will be automatically downloaded when first used
# You can pre-install them with:
uvx --help  # Verify uvx is working
```

## Using MCP Enhanced Tests

### Running MCP Enhanced Test Suite

```bash
# Run the MCP enhanced test suite
npm run test:mcp

# Or run specific MCP tests
npx playwright test tests/MCPEnhancedTestSuite.spec.ts --project=chromium

# Run with detailed MCP logging
FASTMCP_LOG_LEVEL=DEBUG npx playwright test tests/MCPEnhancedTestSuite.spec.ts
```

### MCP Test Features

#### 1. Enhanced Element Interactions

```typescript
// Traditional approach
await page.click('button');

// MCP enhanced approach
await mcpRunner.clickElementWithMCP('button', 'Submit button');
// Provides: logging, error handling, retry logic, reporting
```

#### 2. API Validation During UI Tests

```typescript
// Validate API endpoints during UI interactions
const apiValid = await mcpRunner.validateAPIResponseWithMCP(
  'https://automationexercise.com/api/getUserDetailByEmail'
);
```

#### 3. Database State Verification

```typescript
// Verify database state after UI actions
await mcpRunner.executeCustomMCPAction('validate_database', {
  table: 'users',
  email: userEmail,
  shouldExist: true
});
```

#### 4. Performance Monitoring

```typescript
// Monitor page performance during tests
await mcpRunner.executeCustomMCPAction('check_performance_metrics', {
  page: 'login',
  maxLoadTime: 3000
});
```

#### 5. Email Verification

```typescript
// Verify email delivery after form submission
await mcpRunner.executeCustomMCPAction('send_email_verification', {
  email: contactData.email,
  subject: contactData.subject
});
```

## MCP Test Runner Features

### Core Capabilities

1. **Intelligent Element Interaction**
   - Smart waiting strategies
   - Automatic retry logic
   - Enhanced error reporting
   - Screenshot capture on failure

2. **Multi-Layer Validation**
   - UI element validation
   - API response validation
   - Database state validation
   - Performance metrics validation

3. **Advanced Reporting**
   - Real-time test status updates
   - Rich screenshot attachments
   - Performance metrics inclusion
   - Custom test step tracking

4. **Error Handling & Recovery**
   - Automatic failure screenshot capture
   - Detailed error context
   - Recovery attempt logging
   - Graceful degradation

### Usage Examples

#### Basic MCP Test Structure

```typescript
test('MCP Enhanced Test', async ({ page }) => {
  const mcpRunner = new MCPTestRunner(page);
  
  await mcpRunner.runTestWithMCP('Test-Name', async () => {
    // Navigate with MCP
    await mcpRunner.navigateWithMCP('https://example.com');
    
    // Interact with elements using MCP
    await mcpRunner.clickElementWithMCP('#button', 'Action button');
    
    // Validate with MCP
    const isValid = await mcpRunner.validateElementWithMCP(
      '.success-message', 
      'Success!', 
      'Success message'
    );
    
    // Custom MCP actions
    await mcpRunner.executeCustomMCPAction('custom_validation', {
      param1: 'value1'
    });
  });
});
```

#### Advanced MCP Integration

```typescript
test('Advanced MCP Test', async ({ page }) => {
  const mcpRunner = new MCPTestRunner(page);
  
  await mcpRunner.runTestWithMCP('Advanced-Test', async () => {
    // Step 1: UI Interaction with API validation
    await mcpRunner.clickElementWithMCP('#login-btn', 'Login button');
    const apiResponse = await mcpRunner.validateAPIResponseWithMCP('/api/login');
    
    // Step 2: Database validation
    await mcpRunner.executeCustomMCPAction('validate_database', {
      query: 'SELECT * FROM sessions WHERE user_id = ?',
      params: [userId],
      expectedCount: 1
    });
    
    // Step 3: Performance monitoring
    await mcpRunner.executeCustomMCPAction('check_performance_metrics', {
      metrics: ['loadTime', 'renderTime', 'networkTime'],
      thresholds: { loadTime: 2000, renderTime: 1000 }
    });
    
    // Step 4: Email verification
    await mcpRunner.executeCustomMCPAction('verify_email_delivery', {
      recipient: userEmail,
      subject: 'Welcome Email',
      timeout: 30000
    });
  });
});
```

## Benefits of MCP Integration

### 1. **Comprehensive Test Coverage**
- UI + API + Database validation in single test
- End-to-end system verification
- Multi-layer assertion capabilities

### 2. **Enhanced Debugging**
- Detailed execution logs
- Automatic failure screenshots
- Performance metrics tracking
- API response logging

### 3. **Improved Reliability**
- Smart retry mechanisms
- Graceful error handling
- Automatic recovery attempts
- Robust wait strategies

### 4. **Rich Reporting**
- Multi-source test data
- Performance metrics inclusion
- API validation results
- Database state verification

### 5. **Scalable Architecture**
- Modular MCP server design
- Easy server addition/removal
- Configurable auto-approval
- Environment-specific settings

## Troubleshooting MCP Integration

### Common Issues

1. **MCP Server Not Found**
   ```bash
   # Verify UV/UVX installation
   uvx --version
   
   # Check MCP configuration
   cat .kiro/settings/mcp.json
   ```

2. **Server Connection Issues**
   ```bash
   # Check server logs
   FASTMCP_LOG_LEVEL=DEBUG npx playwright test
   
   # Verify server availability
   uvx mcp-playwright@latest --help
   ```

3. **Permission Issues**
   ```bash
   # Check auto-approval settings in mcp.json
   # Add tools to autoApprove array if needed
   ```

### Performance Optimization

1. **Selective MCP Usage**
   - Use MCP for critical validations only
   - Disable unnecessary servers for faster execution
   - Configure appropriate timeouts

2. **Parallel Execution**
   - MCP servers support parallel test execution
   - Configure worker limits appropriately
   - Monitor resource usage

## Future Enhancements

### Planned MCP Integrations

1. **Visual Testing Server**
   - Screenshot comparison
   - Visual regression detection
   - Cross-browser visual validation

2. **Security Testing Server**
   - XSS detection
   - SQL injection testing
   - Authentication bypass attempts

3. **Mobile Testing Server**
   - Device-specific validations
   - Touch gesture simulation
   - Mobile performance metrics

4. **Load Testing Server**
   - Concurrent user simulation
   - Performance under load
   - Resource utilization monitoring

### Custom MCP Server Development

You can create custom MCP servers for specific testing needs:

```python
# Example custom MCP server structure
from mcp import Server
from mcp.types import Tool

server = Server("custom-testing-server")

@server.tool()
def custom_validation(params: dict) -> bool:
    # Custom validation logic
    return True
```

## Conclusion

MCP integration transforms this Playwright framework from a simple UI testing tool into a comprehensive system validation platform. By leveraging multiple MCP servers, we achieve:

- **Holistic Testing**: UI, API, Database, and Performance in one suite
- **Enhanced Reliability**: Smart error handling and recovery
- **Rich Insights**: Multi-dimensional test reporting
- **Scalable Architecture**: Easy extension and customization

The MCP-enhanced test suite provides enterprise-grade testing capabilities while maintaining the simplicity and speed of Playwright.