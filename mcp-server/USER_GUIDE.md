# Synapse MCP Server User Guide

This guide shows you how to use the Synapse MCP Server with LLMs for natural language load testing.

## Quick Setup

### 1. Install Prerequisites

```bash
# Install Synapse CLI
npm install -g synapse

# Install K6 (macOS)
brew install k6

# Install K6 (Linux)
curl -s https://dl.k6.io/key.gpg | sudo apt-key add -
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

### 2. Install MCP Server

```bash
cd synapse/mcp-server
npm install
npm run build
```

### 3. Configure Your LLM Client

#### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "synapse": {
      "command": "node",
      "args": ["/full/path/to/synapse/mcp-server/dist/index.js"]
    }
  }
}
```

## How to Use

### Simple Load Testing

Just describe what you want to test in natural language:

**Example 1: Basic Load Test**
```
You: "I need to load test my API at https://api.mystore.com with 10 concurrent users making 100 requests total"

AI: I'll run a load test for you using those parameters.
[Uses run_load_test tool with url, concurrent: 10, requests: 100]
```

**Example 2: Quick API Test**
```
You: "Test https://httpbin.org/get with 5 users and 20 requests, but don't actually run it"

AI: I'll create a dry run test for you.
[Uses run_load_test with dryRun: true]
```

### Advanced Configuration Testing

For more complex scenarios:

**Example 3: Dynamic Parameters**
```
You: "Create a load test config for my e-commerce API at https://shop.example.com/products that tests random product IDs between 1 and 1000"

AI: I'll create a configuration file with dynamic parameters.
[Uses create_config with parameters for random product IDs]
```

**Example 4: Multiple Parameters**
```
You: "Set up a test for https://api.example.com/search with random search terms from an array: ['javascript', 'python', 'react'] and user IDs from 1000 to 9999"

AI: I'll create a configuration with multiple dynamic parameters.
[Uses create_config with array and integer parameters]
```

### Configuration Management

**Example 5: Validate Config**
```
You: "Check if my synapse.yml file is valid"

AI: I'll validate your configuration file.
[Uses validate_config tool]
```

**Example 6: Run from Config**
```
You: "Run the load test using my existing configuration file"

AI: I'll execute the test using your synapse.yml configuration.
[Uses run_config_test tool]
```

## Natural Language Patterns

The AI can understand various ways of expressing load testing needs:

### Expressing Load Parameters
- "10 concurrent users" → concurrent: 10
- "100 total requests" → requests: 100
- "5 simultaneous connections" → concurrent: 5
- "50 calls in total" → requests: 50

### Expressing URLs
- "test my API at https://..." → url: "https://..."
- "load test this endpoint: https://..." → url: "https://..."
- "run against https://..." → url: "https://..."

### Expressing Test Types
- "don't actually run it" → dryRun: true
- "just generate the script" → dryRun: true
- "keep the generated file" → keepScript: true
- "save results to ./results" → output: "./results"

### Dynamic Parameters
- "random IDs from 1 to 1000" → integer parameter with min: 1, max: 1000
- "pick from these values: [a, b, c]" → array parameter
- "use data from users.csv" → csv parameter

## Common Workflows

### 1. Quick API Testing
```
You: "I want to quickly test if my API can handle 20 concurrent users"
AI: [Asks for URL, then runs simple load test]
```

### 2. Performance Baseline
```
You: "Help me establish a performance baseline for https://api.example.com"
AI: [Suggests appropriate test parameters and runs test]
```

### 3. Gradual Load Increase
```
You: "Create a test that gradually increases load on my API"
AI: [Creates config with K6 stages for ramping up load]
```

### 4. Configuration Development
```
You: "I need a complex test setup with multiple dynamic parameters"
AI: [Guides through parameter creation and generates config]
```

## Tips for Better Results

### Be Specific About Requirements
- ✅ "Test with 10 users making 100 requests"
- ❌ "Test my API with some load"

### Mention Constraints
- "Don't actually run the test, just show me what it would do"
- "Keep the generated script file"
- "Save results to a specific directory"

### Describe Your API Structure
- "My API expects product IDs as integers"
- "The endpoint takes category names from a predefined list"
- "User IDs should be 6-digit numbers"

### Ask for Explanations
- "Explain what this test configuration does"
- "What do these results mean?"
- "How can I improve this test?"

## Troubleshooting

### Common Issues and Solutions

**"Command not found" errors:**
```
You: "The test failed with 'synapse command not found'"
AI: [Provides installation instructions for Synapse CLI]
```

**Invalid parameters:**
```
You: "The URL seems wrong"
AI: [Validates URL format and suggests corrections]
```

**Performance issues:**
```
You: "The test is taking too long"
AI: [Suggests timeout adjustments or smaller test parameters]
```

### Getting Help

Ask the AI for help with:
- "How do I interpret these load test results?"
- "What's a good number of concurrent users for testing?"
- "How can I test with realistic data?"
- "What should I look for in the performance metrics?"

## Advanced Examples

### E-commerce Load Testing
```
You: "I need to test my online store's product search with realistic traffic patterns"

AI: I'll create a comprehensive test that simulates real user behavior:
- Random search terms from common categories
- Varying user loads throughout the test
- Multiple API endpoints (search, product details, cart)
```

### API Rate Limit Testing
```
You: "Help me find the rate limits of my API"

AI: I'll design a test that gradually increases load to identify your API's limits:
- Start with low concurrent users
- Gradually increase load
- Monitor for error rates and response times
```

### Microservices Testing
```
You: "Test multiple microservices with different load patterns"

AI: I'll create separate configurations for each service:
- Different load patterns per service
- Coordinated testing schedule
- Comprehensive result analysis
```

## Best Practices

1. **Start Small** - Begin with low load and increase gradually
2. **Use Dry Runs** - Always test your configuration before running
3. **Monitor Results** - Pay attention to error rates and response times
4. **Realistic Data** - Use parameters that match real user behavior
5. **Document Tests** - Keep track of test configurations and results

## Next Steps

Once you're comfortable with basic usage:

1. Explore advanced K6 features through configuration files
2. Set up automated testing pipelines
3. Create custom parameter generators
4. Integrate with monitoring and alerting systems

For more advanced features, refer to the main Synapse documentation and K6 guides.
