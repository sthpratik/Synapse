# Synapse - Dynamic Load Testing Tool

[![npm version](https://badge.fury.io/js/synapse.svg)](https://badge.fury.io/js/synapse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Synapse is a powerful command-line tool that generates K6 load testing scripts from simple YAML configurations. It supports dynamic URL construction, multiple parameter types including arrays, CSV data sources, and all K6 features.

## 🚀 Features

- **Dynamic URL Construction** - Build URLs with configurable parameters
- **Multiple Parameter Types** - Integer, string, array, CSV, and URL parameters
- **Batch Mode** - Use pre-built URLs from CSV files
- **K6 Integration** - Full K6 feature support with automatic script generation
- **Smart Configuration** - Automatic mode detection based on config
- **Performance Metrics** - Comprehensive load testing results
- **CLI Interface** - Easy-to-use command-line interface
- **MCP Integration** - Natural language load testing through LLM conversations

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g synapse
```

### Local Installation

```bash
npm install synapse
npx synapse --help
```

## 🏃 Quick Start

### Simple Load Test (No Configuration File)

For quick testing without creating a YAML file:

```bash
synapse test --url "https://api.example.com" --concurrent 10 --requests 100
```

### Advanced Configuration

### 1. Initialize Configuration

```bash
synapse init --name "My API Test" --url "https://api.example.com"
```

This creates a `synapse.yml` file with basic configuration.

### 2. Customize Configuration

Edit the generated `synapse.yml`:

```yaml
name: "API Load Test"
baseUrl: "https://api.example.com/search"
execution:
  mode: "construct"
  concurrent: 10
  iterations: 100
parameters:
  - name: "query"
    type: "array"
    values: ["javascript", "python", "react & vue"]
  - name: "userId"
    type: "integer"
    min: 1000
    max: 9999
  - name: "imageUrl"
    type: "static"
    value: "http://localhost:7900/generated-content/imagen-3_0-generate-002/2025-11-05/imagen.webp"
k6Options:
  thresholds:
    http_req_duration: ["p(95)<500"]
```

**Auto-encoding in action:**
- `"react & vue"` → `"react%20%26%20vue"`
- Complex image URL → Automatically URL-encoded
- `userId` numbers → No encoding needed

### 3. Run Load Test

```bash
synapse run
```

## 📋 Parameter Types

**Auto-Encoding:** Static and CSV parameters automatically detect and URL-encode special characters and URLs. No manual encoding configuration needed for standard URL encoding.

### Static Parameters ⭐ NEW
Use fixed values with smart auto-encoding for URLs and special characters:

```yaml
- name: "imageUrl"
  type: "static"
  value: "http://localhost:7900/generated-content/imagen-3_0-generate-002/2025-11-05/imagen-1762381001933-3b19cf6c.webp"
- name: "apiKey"
  type: "static"
  value: "your-api-key-here"
- name: "searchQuery"
  type: "static"
  value: "hello world & special chars!"
```

**Auto-encoding behavior:**
- URLs are automatically URL-encoded when needed
- Special characters (`&`, `!`, spaces, etc.) are encoded
- Simple strings (like API keys) remain unchanged
- No configuration required

### Integer Parameters
Generate random integers within a specified range:

```yaml
- name: "userId"
  type: "integer"
  min: 1
  max: 1000000
  length: 10  # pad with zeros
```

### String Parameters
Generate random strings with various character sets:

```yaml
- name: "sessionId"
  type: "string"
  length: 32
  charset: "alphanumeric"  # or "alpha", "numeric", "custom"
  customChars: "abcdef123456"  # only if charset is "custom"
```

### Array Parameters ⭐ NEW
Select random values from a predefined array with auto-encoding:

```yaml
- name: "category"
  type: "array"
  values: ["electronics", "books & media", "home & garden"]
  unique: true  # optional: ensure no duplicates
- name: "testUrls"
  type: "array"
  values: [
    "http://localhost:3000/api/test?param=value",
    "https://example.com/search?q=hello world"
  ]
```

### CSV Parameters
Load values from CSV files with smart auto-encoding:

```yaml
- name: "region"
  type: "csv"
  file: "./data/regions.csv"
  column: "name"
```

### URL Parameters
Load URLs with automatic encoding and optional base64:

```yaml
- name: "targetUrl"
  type: "url"
  file: "./data/urls.csv"
  column: "url"
  encoding: "base64"  # Optional: only for base64 encoding
```

**Note:** URL encoding is automatic. Only specify `encoding: "base64"` when you need base64 encoding specifically.

## 🔄 Auto-Encoding Examples

**Static Parameters:**
```yaml
# Input
- name: "imageUrl"
  type: "static"
  value: "http://localhost:7900/generated-content/imagen-3_0-generate-002/2025-11-05/imagen.webp"

# Output: Automatically encoded
# http%3A//localhost%3A7900/generated-content/imagen-3_0-generate-002/2025-11-05/imagen.webp
```

**Array Parameters:**
```yaml
# Input
- name: "searchTerm"
  type: "array"
  values: ["hello world", "cats & dogs", "simple-text"]

# Output: Smart encoding
# "hello world" → "hello%20world"
# "cats & dogs" → "cats%20%26%20dogs"  
# "simple-text" → "simple-text" (unchanged)
```

**CSV Data:**
```csv
# urls.csv
url
http://localhost:3000/api/test?param=value&other=data
https://example.com/search?q=hello world
simple-endpoint
```

```yaml
# Configuration
- name: "endpoint"
  type: "csv"
  file: "./urls.csv"
  column: "url"

# Output: Auto-encoded when needed
# Complex URLs → Encoded
# Simple strings → Unchanged
```

## 🔧 CLI Commands

### `synapse test`
Run simple load test without configuration file:

```bash
synapse test --url "https://api.example.com" --concurrent 10 --requests 100
```

Options:
- `-u, --url <url>` - Target URL to test (required)
- `-c, --concurrent <number>` - Number of concurrent users (required)
- `-r, --requests <number>` - Total number of requests (required)
- `-o, --output <path>` - Output directory (default: ./output)
- `--dry-run` - Generate script without running
- `--keep-script` - Keep generated K6 script

### `synapse run`
Run load test from configuration:

```bash
synapse run --config synapse.yml --output ./results --dry-run
```

Options:
- `-c, --config <path>` - Configuration file path (default: synapse.yml)
- `-o, --output <path>` - Output directory (default: ./output)
- `--dry-run` - Generate script without running
- `--keep-script` - Keep generated K6 script

### `synapse validate`
Validate configuration file:

```bash
synapse validate --config synapse.yml
```

### `synapse generate`
Generate K6 script without running:

```bash
synapse generate --config synapse.yml --output test.js
```

### `synapse init`
Initialize new configuration:

```bash
synapse init --name "My Test" --url "https://api.example.com"
```

## 📊 Execution Modes

### Construct Mode
Dynamically builds URLs using base URL and parameters:

```yaml
execution:
  mode: "construct"
  concurrent: 10
  iterations: 100
```

### Batch Mode
Uses pre-built URLs from CSV file:

```yaml
execution:
  mode: "batch"
  concurrent: 10
  duration: "5m"
batch:
  file: "./data/urls.csv"
  column: "url"
```

## 🎯 K6 Integration & Options

Synapse supports all K6 configuration options through the `k6Options` section. These options control test execution, performance thresholds, and advanced scenarios.

### Basic Execution Options

```yaml
k6Options:
  # Simple load test
  vus: 10              # Virtual users (concurrent connections)
  duration: "30s"      # Test duration
  iterations: 100      # Total number of iterations
```

### 📊 Thresholds - Performance Requirements

Thresholds define pass/fail criteria for your load test:

```yaml
k6Options:
  thresholds:
    # Response time thresholds
    http_req_duration: ["p(95)<500"]           # 95% of requests under 500ms
    http_req_duration: ["p(99)<1000"]          # 99% of requests under 1s
    http_req_duration: ["avg<200"]             # Average response time under 200ms
    http_req_duration: ["med<150"]             # Median response time under 150ms
    
    # Error rate thresholds
    http_req_failed: ["rate<0.1"]              # Less than 10% failure rate
    http_req_failed: ["rate<0.01"]             # Less than 1% failure rate
    
    # Request rate thresholds
    http_reqs: ["rate>100"]                    # More than 100 requests/second
    
    # Check thresholds (custom validations)
    checks: ["rate>0.95"]                      # 95% of checks must pass
    
    # Data transfer thresholds
    data_received: ["rate<10000"]              # Less than 10KB/s received
    data_sent: ["rate<5000"]                   # Less than 5KB/s sent
```

**Threshold Operators:**
- `<` - Less than
- `<=` - Less than or equal
- `>` - Greater than  
- `>=` - Greater than or equal
- `==` - Equal to
- `!=` - Not equal to

**Statistical Functions:**
- `avg` - Average value
- `min` - Minimum value
- `max` - Maximum value
- `med` - Median (50th percentile)
- `p(90)` - 90th percentile
- `p(95)` - 95th percentile
- `p(99)` - 99th percentile
- `rate` - Rate (for counters)
- `count` - Total count

### 🎭 Scenarios - Advanced Test Patterns

#### Per-VU Iterations
Each virtual user runs a specific number of iterations:

```yaml
k6Options:
  scenarios:
    api_test:
      executor: "per-vu-iterations"
      vus: 10
      iterations: 20        # Each VU runs 20 iterations (200 total)
      maxDuration: "5m"     # Maximum test duration
```

#### Shared Iterations
Total iterations shared among all VUs:

```yaml
k6Options:
  scenarios:
    load_test:
      executor: "shared-iterations"
      vus: 10
      iterations: 1000      # 1000 total iterations shared
      maxDuration: "10m"
```

#### Constant VUs
Fixed number of VUs for a duration:

```yaml
k6Options:
  scenarios:
    steady_load:
      executor: "constant-vus"
      vus: 50
      duration: "5m"
```

#### Ramping VUs
Gradually increase/decrease load:

```yaml
k6Options:
  scenarios:
    ramp_test:
      executor: "ramping-vus"
      startVUs: 0
      stages:
        - duration: "2m"
          target: 10        # Ramp up to 10 VUs
        - duration: "5m"
          target: 50        # Ramp up to 50 VUs
        - duration: "2m"
          target: 0         # Ramp down to 0 VUs
```

#### Constant Arrival Rate
Maintain steady request rate:

```yaml
k6Options:
  scenarios:
    constant_rate:
      executor: "constant-arrival-rate"
      rate: 100            # 100 iterations/second
      duration: "5m"
      preAllocatedVUs: 10  # Pre-allocated VUs
      maxVUs: 50           # Maximum VUs if needed
```

#### Ramping Arrival Rate
Variable request rate over time:

```yaml
k6Options:
  scenarios:
    variable_rate:
      executor: "ramping-arrival-rate"
      startRate: 10        # Start at 10 iter/sec
      stages:
        - duration: "2m"
          target: 50       # Ramp to 50 iter/sec
        - duration: "5m"
          target: 100      # Ramp to 100 iter/sec
        - duration: "2m"
          target: 0        # Ramp down to 0
      preAllocatedVUs: 20
      maxVUs: 100
```

### 🔧 Advanced Options

```yaml
k6Options:
  # Global settings
  userAgent: "MyApp LoadTest/1.0"
  
  # HTTP settings
  http:
    timeout: "60s"
    keepAlive: true
  
  # TLS settings
  tlsAuth:
    - domains: ["example.com"]
      cert: "client.crt"
      key: "client.key"
  
  # DNS settings
  dns:
    ttl: "5m"
    select: "random"      # or "roundRobin", "first"
  
  # Rate limiting
  rps: 500               # Requests per second limit
  
  # Batch settings
  batch: 10              # Batch HTTP requests
  batchPerHost: 5        # Batch per host
  
  # Connection settings
  maxRedirects: 10
  userAgent: "k6/0.45.0"
  
  # Output settings
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"]
```

### 📈 Complete Example

```yaml
name: "Production API Load Test"
baseUrl: "https://api.example.com"
execution:
  mode: "construct"
  concurrent: 50
  iterations: 5000

parameters:
  - name: "userId"
    type: "integer"
    min: 1000
    max: 9999

k6Options:
  # Performance requirements
  thresholds:
    http_req_duration: ["p(95)<500", "p(99)<1000"]
    http_req_failed: ["rate<0.01"]
    http_reqs: ["rate>200"]
    checks: ["rate>0.99"]
  
  # Load pattern
  scenarios:
    normal_load:
      executor: "ramping-vus"
      stages:
        - duration: "5m"
          target: 10      # Warm up
        - duration: "10m"
          target: 50      # Normal load
        - duration: "5m"
          target: 100     # Peak load
        - duration: "10m"
          target: 50      # Back to normal
        - duration: "5m"
          target: 0       # Cool down
  
  # Global settings
  userAgent: "LoadTest/1.0"
  maxRedirects: 5
  
  # HTTP configuration
  http:
    timeout: "30s"
    keepAlive: true
```

### 🚨 Common Threshold Patterns

**API Performance:**
```yaml
thresholds:
  http_req_duration: ["p(95)<200", "p(99)<500"]
  http_req_failed: ["rate<0.01"]
```

**High Throughput:**
```yaml
thresholds:
  http_reqs: ["rate>1000"]
  http_req_duration: ["p(95)<100"]
```

**Reliability Focus:**
```yaml
thresholds:
  http_req_failed: ["rate<0.001"]  # 99.9% success rate
  checks: ["rate>0.999"]
```

## 📁 Project Structure

```
synapse/
├── src/
│   ├── generators/          # Parameter and script generators
│   ├── validators/          # Configuration validators
│   ├── types/              # TypeScript interfaces
│   └── cli.ts              # CLI interface
├── examples/               # Example configurations
├── docs/                   # Documentation
└── tests/                  # Test files
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run test -- --coverage
```

## 📚 Documentation

Full documentation is available at: [Synapse Docs](https://sthpratik.github.io/synapse)

Or serve locally:

```bash
npm run docs:serve
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [K6](https://k6.io/) - Modern load testing tool
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Joi](https://joi.dev/) - Schema validation

## 🐛 Issues & Support

- Report bugs: [GitHub Issues](https://github.com/sthpratik/synapse/issues)
- Feature requests: [GitHub Discussions](https://github.com/sthpratik/synapse/discussions)
- Documentation: [Synapse Docs](https://sthpratik.github.io/synapse)
