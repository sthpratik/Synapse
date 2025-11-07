# Synapse MCP Server

Model Context Protocol (MCP) server for the Synapse load testing tool. This server allows LLMs to run load tests through natural language conversations.

## Features

- **Simple Load Testing** - Run quick load tests with URL, concurrent users, and request count
- **Configuration Management** - Create and validate Synapse configuration files
- **Advanced Testing** - Run tests from YAML configurations with dynamic parameters
- **Natural Language Interface** - LLMs can extract parameters from conversational requests

## Installation

### Prerequisites

1. Install Synapse CLI globally:
```bash
npm install -g synapse
```

2. Ensure K6 is installed:
```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Install MCP Server

```bash
cd mcp-server
npm install
npm run build
```

## Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "synapse": {
      "command": "node",
      "args": ["/path/to/synapse/mcp-server/dist/index.js"]
    }
  }
}
```

## Available Tools

### 1. `run_load_test`
Run a simple load test without configuration files.

**Parameters:**
- `url` (required) - Target URL to test
- `concurrent` (required) - Number of concurrent users (1-1000)
- `requests` (required) - Total number of requests (1-100000)
- `output` (optional) - Output directory for results
- `dryRun` (optional) - Generate script without running
- `keepScript` (optional) - Keep generated K6 script

### 2. `create_config`
Create a Synapse configuration file for advanced testing.

**Parameters:**
- `name` (required) - Test name
- `url` (required) - Base URL for testing
- `concurrent` (optional) - Number of concurrent users
- `iterations` (optional) - Total iterations
- `parameters` (optional) - Dynamic parameters array

### 3. `run_config_test`
Run load test from a configuration file.

**Parameters:**
- `config` (optional) - Path to config file (default: synapse.yml)
- `output` (optional) - Output directory
- `dryRun` (optional) - Generate script without running

### 4. `validate_config`
Validate a Synapse configuration file.

**Parameters:**
- `config` (required) - Path to configuration file

## Usage Examples

### Simple Load Test
```
User: "Run a load test on https://api.example.com with 10 concurrent users and 100 total requests"

LLM will use: run_load_test
- url: "https://api.example.com"
- concurrent: 10
- requests: 100
```

### Advanced Configuration
```
User: "Create a load test config for testing an e-commerce API at https://shop.example.com/products with random product IDs between 1-1000"

LLM will use: create_config
- name: "E-commerce API Test"
- url: "https://shop.example.com/products"
- parameters: [
    {
      name: "productId",
      type: "integer",
      min: 1,
      max: 1000
    }
  ]
```

### Dry Run Testing
```
User: "Test the configuration but don't actually run it"

LLM will use: run_config_test
- dryRun: true
```

## Natural Language Processing

The MCP server is designed to work with LLMs that can:

1. **Extract Parameters** - Parse natural language to identify URLs, user counts, request numbers
2. **Infer Intent** - Determine whether to use simple testing or advanced configuration
3. **Handle Errors** - Provide meaningful feedback when tests fail
4. **Suggest Improvements** - Recommend better test parameters based on results

## Common Conversation Patterns

### Quick Testing
- "Load test https://example.com with 5 users"
- "Run 50 requests against my API at https://api.mysite.com"
- "Test this endpoint with 20 concurrent connections"

### Configuration-Based Testing
- "Create a test config for my REST API with dynamic user IDs"
- "Set up a load test with multiple parameters"
- "Generate a configuration for testing with CSV data"

### Analysis and Validation
- "Check if my synapse.yml file is valid"
- "Run a dry run to see the generated script"
- "Validate the configuration before running"

## Error Handling

The server provides detailed error messages for:
- Invalid URLs or parameters
- Missing Synapse CLI installation
- K6 execution failures
- Configuration validation errors
- File system permissions

## Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
# Test with a simple load test
echo '{"method": "tools/call", "params": {"name": "run_load_test", "arguments": {"url": "https://httpbin.org/get", "concurrent": 2, "requests": 5, "dryRun": true}}}' | node dist/index.js
```

## Troubleshooting

### Common Issues

1. **"synapse command not found"**
   - Install Synapse CLI globally: `npm install -g synapse`

2. **"k6 command not found"**
   - Install K6: https://k6.io/docs/getting-started/installation/

3. **Permission errors**
   - Ensure write permissions in the working directory

4. **Timeout errors**
   - Large load tests may take time; adjust timeout settings

### Debug Mode

Set environment variable for verbose logging:
```bash
DEBUG=synapse-mcp-server node dist/index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes to `src/index.ts`
4. Run `npm run build`
5. Test with your MCP client
6. Submit a pull request

## License

MIT License - see the main Synapse project for details.
