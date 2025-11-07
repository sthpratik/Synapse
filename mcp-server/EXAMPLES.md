# Synapse MCP Server Examples

Real-world examples of using the Synapse MCP Server with natural language conversations.

## Basic Load Testing Examples

### Example 1: Simple API Test

**Conversation:**
```
User: "I need to test my REST API at https://api.example.com/users with 10 concurrent users making 50 requests total"

AI: I'll run a load test for your API with those parameters.

[Tool Call: run_load_test]
{
  "url": "https://api.example.com/users",
  "concurrent": 10,
  "requests": 50
}

Result: Load test completed successfully!
- 50 requests made with 10 concurrent users
- Average response time: 245ms
- Success rate: 100%
- Results saved to: output/results.json
```

### Example 2: Dry Run Testing

**Conversation:**
```
User: "Can you show me what a load test would look like for https://httpbin.org/get with 5 users and 20 requests, but don't actually run it?"

AI: I'll create a dry run to show you the generated test script.

[Tool Call: run_load_test]
{
  "url": "https://httpbin.org/get",
  "concurrent": 5,
  "requests": 20,
  "dryRun": true
}

Result: Test script generated successfully!
Script location: output/test.js
The script would run 20 requests with 5 concurrent users against https://httpbin.org/get
```

## Advanced Configuration Examples

### Example 3: E-commerce API with Dynamic Parameters

**Conversation:**
```
User: "I want to create a load test for my e-commerce API at https://shop.example.com/products that uses random product IDs between 1 and 1000, and test with 15 concurrent users for 200 iterations"

AI: I'll create a configuration file with dynamic product ID parameters for your e-commerce API.

[Tool Call: create_config]
{
  "name": "E-commerce Product API Test",
  "url": "https://shop.example.com/products",
  "concurrent": 15,
  "iterations": 200,
  "parameters": [
    {
      "name": "productId",
      "type": "integer",
      "min": 1,
      "max": 1000
    }
  ]
}

Result: Configuration file created successfully!
File: synapse.yml
The configuration will test your API with random product IDs and 15 concurrent users.
```

### Example 4: Search API with Multiple Parameters

**Conversation:**
```
User: "Set up a test for my search API at https://api.mysite.com/search that uses random search terms from ['javascript', 'python', 'react', 'nodejs'] and random user IDs from 1000 to 9999"

AI: I'll create a configuration with multiple dynamic parameters for your search API.

[Tool Call: create_config]
{
  "name": "Search API Load Test",
  "url": "https://api.mysite.com/search",
  "concurrent": 10,
  "iterations": 100,
  "parameters": [
    {
      "name": "query",
      "type": "array",
      "values": ["javascript", "python", "react", "nodejs"]
    },
    {
      "name": "userId",
      "type": "integer",
      "min": 1000,
      "max": 9999
    }
  ]
}

Result: Configuration created with multiple parameters!
Your test will use random search terms and user IDs for realistic testing.
```

## Configuration Management Examples

### Example 5: Validate Existing Configuration

**Conversation:**
```
User: "I have a synapse.yml file in my project. Can you check if it's valid?"

AI: I'll validate your configuration file to ensure it's properly formatted.

[Tool Call: validate_config]
{
  "config": "synapse.yml"
}

Result: Configuration validation successful!
Your synapse.yml file is valid and ready to use.
```

### Example 6: Run from Custom Configuration

**Conversation:**
```
User: "I have a custom config file called api-test.yml. Can you run a load test using it?"

AI: I'll run the load test using your custom configuration file.

[Tool Call: run_config_test]
{
  "config": "api-test.yml"
}

Result: Configuration-based load test completed!
Test executed successfully using api-test.yml configuration.
```

## Real-World Scenarios

### Example 7: Performance Baseline Testing

**Conversation:**
```
User: "I'm launching a new API and need to establish a performance baseline. The endpoint is https://api.newservice.com/health"

AI: I'll help you establish a performance baseline with a gradual load test.

[Tool Call: run_load_test]
{
  "url": "https://api.newservice.com/health",
  "concurrent": 5,
  "requests": 100
}

Follow-up: Based on the results, let's try with higher load...

[Tool Call: run_load_test]
{
  "url": "https://api.newservice.com/health",
  "concurrent": 20,
  "requests": 200
}

Result: Baseline established!
- 5 users: avg 150ms response time
- 20 users: avg 280ms response time
- Recommended baseline: 15 concurrent users for production readiness
```

### Example 8: Microservices Load Testing

**Conversation:**
```
User: "I have three microservices that need testing: user service, product service, and order service. Can you help me set up tests for all of them?"

AI: I'll create separate test configurations for each of your microservices.

[Tool Call: create_config]
{
  "name": "User Service Load Test",
  "url": "https://api.example.com/users",
  "concurrent": 10,
  "iterations": 100,
  "parameters": [
    {
      "name": "userId",
      "type": "integer",
      "min": 1,
      "max": 10000
    }
  ]
}

[Tool Call: create_config]
{
  "name": "Product Service Load Test", 
  "url": "https://api.example.com/products",
  "concurrent": 15,
  "iterations": 150,
  "parameters": [
    {
      "name": "category",
      "type": "array",
      "values": ["electronics", "books", "clothing", "home"]
    }
  ]
}

[Tool Call: create_config]
{
  "name": "Order Service Load Test",
  "url": "https://api.example.com/orders", 
  "concurrent": 8,
  "iterations": 80,
  "parameters": [
    {
      "name": "orderId",
      "type": "integer",
      "min": 100000,
      "max": 999999
    }
  ]
}

Result: Created three separate test configurations!
Each service now has a tailored load test configuration.
```

## Error Handling Examples

### Example 9: Invalid URL Handling

**Conversation:**
```
User: "Test my API at not-a-valid-url with 10 users"

AI: I notice there's an issue with the URL format. Let me help you fix that.

Error: Invalid URL format. URLs must include the protocol (http:// or https://).

Would you like to test "https://not-a-valid-url" instead, or do you have a different URL?
```

### Example 10: Parameter Validation

**Conversation:**
```
User: "Run a test with 5000 concurrent users and 1 million requests"

AI: Those parameters are quite high and might cause issues. Let me suggest some alternatives:

The maximum supported concurrent users is 1000, and I'd recommend starting with smaller numbers for initial testing.

How about we start with:
- 100 concurrent users
- 10,000 requests

This will give you meaningful results without overwhelming your system.
```

## Integration Examples

### Example 11: CI/CD Pipeline Testing

**Conversation:**
```
User: "I need to add load testing to my CI/CD pipeline for the staging environment at https://staging-api.example.com"

AI: I'll create a configuration suitable for automated CI/CD testing.

[Tool Call: create_config]
{
  "name": "CI/CD Load Test",
  "url": "https://staging-api.example.com",
  "concurrent": 5,
  "iterations": 50,
  "parameters": [
    {
      "name": "testId",
      "type": "integer", 
      "min": 1,
      "max": 100
    }
  ]
}

Result: CI/CD configuration created!
This lightweight test is perfect for automated pipeline validation.
```

### Example 12: Monitoring Integration

**Conversation:**
```
User: "I want to run regular load tests and save the results to a monitoring directory"

AI: I'll set up a test with custom output directory for monitoring integration.

[Tool Call: run_load_test]
{
  "url": "https://api.example.com/health",
  "concurrent": 10,
  "requests": 100,
  "output": "./monitoring/load-tests",
  "keepScript": true
}

Result: Load test completed with monitoring integration!
Results saved to: ./monitoring/load-tests/results.json
Script saved for future reference: ./monitoring/load-tests/test.js
```

## Troubleshooting Examples

### Example 13: Installation Issues

**Conversation:**
```
User: "The test failed with 'synapse command not found'"

AI: It looks like the Synapse CLI isn't installed. Let me help you fix that:

1. Install Synapse globally:
   npm install -g synapse

2. Verify installation:
   synapse --help

3. Also make sure K6 is installed:
   brew install k6  # macOS
   # or follow K6 installation guide for your OS

Once installed, try your load test again!
```

### Example 14: Performance Analysis

**Conversation:**
```
User: "My load test results show high response times. What should I do?"

AI: Let me help you analyze the performance issues. Based on typical load test results:

1. If response times are consistently high (>1000ms):
   - Check server resources (CPU, memory)
   - Review database query performance
   - Consider caching strategies

2. If response times increase with load:
   - Your API may have scalability issues
   - Consider horizontal scaling
   - Review connection pooling

Would you like me to run a smaller test to isolate the issue?

[Tool Call: run_load_test]
{
  "url": "your-api-url",
  "concurrent": 2,
  "requests": 10,
  "dryRun": false
}
```

## Best Practices Examples

### Example 15: Gradual Load Testing

**Conversation:**
```
User: "What's the best way to test my new API without overwhelming it?"

AI: I recommend a gradual approach. Let's start small and increase load step by step:

Step 1: Baseline test
[Tool Call: run_load_test]
{
  "url": "https://your-api.com",
  "concurrent": 1,
  "requests": 10
}

Step 2: Light load
[Tool Call: run_load_test] 
{
  "url": "https://your-api.com",
  "concurrent": 5,
  "requests": 50
}

Step 3: Moderate load
[Tool Call: run_load_test]
{
  "url": "https://your-api.com", 
  "concurrent": 10,
  "requests": 100
}

This approach helps identify performance thresholds safely.
```

These examples demonstrate the natural language interface capabilities and show how the MCP server can handle various load testing scenarios through conversational interactions.
