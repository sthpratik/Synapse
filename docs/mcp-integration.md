# MCP Integration

Synapse includes a Model Context Protocol (MCP) server that allows LLMs to run load tests through natural language conversations.

## What is MCP?

Model Context Protocol (MCP) is an open standard that enables LLMs to securely connect to external tools and data sources. The Synapse MCP server allows you to:

- Run load tests through natural language
- Create configurations conversationally  
- Validate and manage test setups
- Get intelligent suggestions for test parameters

## Quick Setup

### 1. Install Prerequisites

```bash
# Synapse CLI (if not already installed)
npm install -g synapse

# K6 load testing tool
brew install k6  # macOS
```

### 2. Build MCP Server

```bash
cd synapse/mcp-server
npm install
npm run build
```

### 3. Configure Your LLM Client

#### Claude Desktop

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

#### Other MCP Clients

Use the command: `node /path/to/synapse/mcp-server/dist/index.js`

## Available Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `run_load_test` | Simple load testing | Quick API testing |
| `create_config` | Generate configuration files | Advanced test setups |
| `run_config_test` | Run from config files | Complex scenarios |
| `validate_config` | Validate configurations | Error checking |

## Example Conversations

### Simple Load Testing

```
You: "Test my API at https://api.example.com with 10 users and 100 requests"

AI: I'll run a load test with those parameters.
✅ Load test completed successfully!
- Average response time: 245ms
- Success rate: 100%
- Results saved to output/results.json
```

### Advanced Configuration

```
You: "Create a test for my e-commerce API with random product IDs from 1 to 1000"

AI: I'll create a configuration with dynamic parameters.
✅ Configuration file created: synapse.yml
- Dynamic product ID generation
- Ready for advanced load testing
```

### Validation and Analysis

```
You: "Check if my synapse.yml file is valid"

AI: I'll validate your configuration.
✅ Configuration is valid and ready to use!
```

## Natural Language Patterns

The MCP server understands various ways to express load testing needs:

### Load Parameters
- "10 concurrent users" → concurrent: 10
- "100 total requests" → requests: 100
- "5 simultaneous connections" → concurrent: 5

### Test Types
- "don't actually run it" → dryRun: true
- "keep the script file" → keepScript: true
- "save to ./results" → output: "./results"

### Dynamic Parameters
- "random IDs from 1 to 1000" → integer parameter
- "pick from [a, b, c]" → array parameter
- "use data from file.csv" → csv parameter

## Benefits

### For Developers
- **Natural Interface** - Describe tests in plain English
- **Intelligent Suggestions** - AI recommends optimal parameters
- **Error Prevention** - Validation before execution
- **Learning Tool** - Understand load testing concepts

### For Teams
- **Accessibility** - Non-experts can run load tests
- **Documentation** - Conversations serve as test documentation
- **Collaboration** - Share test ideas through chat
- **Consistency** - Standardized testing approach

## Advanced Features

### Gradual Load Testing
```
You: "Help me find the limits of my API"

AI: I'll design a gradual load test:
1. Start with 5 users → baseline performance
2. Increase to 20 users → identify scaling point
3. Push to 50 users → find breaking point
```

### Multi-Service Testing
```
You: "Test my microservices architecture"

AI: I'll create separate configurations for each service:
- User service: lightweight testing
- Product service: heavy load simulation
- Order service: transaction-focused testing
```

### Performance Analysis
```
You: "My response times are high, what should I do?"

AI: Based on your results, I recommend:
1. Check database query performance
2. Review server resource usage
3. Consider caching strategies
Let me run a smaller test to isolate the issue...
```

## Best Practices

### Start Simple
Begin with basic load tests before moving to complex scenarios:
```
You: "I'm new to load testing, help me get started"

AI: Let's start with a simple test:
- 5 concurrent users
- 50 total requests
- Monitor response times and error rates
```

### Use Realistic Data
Create tests that match real user behavior:
```
You: "Test my search API with realistic queries"

AI: I'll create parameters that simulate real searches:
- Common search terms
- Realistic user patterns
- Varied query complexity
```

### Monitor and Iterate
Use results to improve your tests:
```
You: "The test results look good, what's next?"

AI: Great! Now let's:
1. Increase load gradually
2. Test edge cases
3. Validate under sustained load
```

## Troubleshooting

### Common Issues

**Installation Problems**
```
You: "Getting 'command not found' errors"

AI: Let me help you install the prerequisites:
1. Install Synapse: npm install -g synapse
2. Install K6: brew install k6
3. Verify: synapse --help
```

**Configuration Errors**
```
You: "My test configuration isn't working"

AI: I'll validate your configuration and suggest fixes:
- Check URL format
- Verify parameter types
- Validate file paths
```

**Performance Issues**
```
You: "Tests are running slowly"

AI: Let's optimize your test setup:
- Reduce concurrent users
- Check system resources
- Adjust timeout settings
```

## Getting Started

1. **Install** the MCP server following the setup guide
2. **Configure** your LLM client with the server
3. **Start simple** with basic load tests
4. **Explore** advanced features as you learn
5. **Share** your configurations with your team

For detailed examples and advanced usage, see:
- [MCP Server User Guide](../mcp-server/USER_GUIDE.md)
- [MCP Server Examples](../mcp-server/EXAMPLES.md)
- [MCP Server README](../mcp-server/README.md)

## Contributing

The MCP server is part of the main Synapse project. Contributions are welcome:

1. Fork the repository
2. Make changes to `mcp-server/src/index.ts`
3. Test with your MCP client
4. Submit a pull request

## Support

For MCP-specific issues:
- Check the troubleshooting section
- Review the examples documentation
- Open an issue on GitHub with "MCP" in the title
