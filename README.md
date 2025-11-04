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
    values: ["javascript", "python", "react"]
  - name: "userId"
    type: "integer"
    min: 1000
    max: 9999
k6Options:
  thresholds:
    http_req_duration: ["p(95)<500"]
```

### 3. Run Load Test

```bash
synapse run
```

## 📋 Parameter Types

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
Select random values from a predefined array:

```yaml
- name: "category"
  type: "array"
  values: ["electronics", "books", "clothing", "home"]
  unique: true  # optional: ensure no duplicates
```

### CSV Parameters
Load values from CSV files:

```yaml
- name: "region"
  type: "csv"
  file: "./data/regions.csv"
  column: "name"
```

### URL Parameters
Load and optionally encode URLs:

```yaml
- name: "encodedUrl"
  type: "url"
  file: "./data/urls.csv"
  column: "url"
  encoding: "base64"  # optional
```

## 🔧 CLI Commands

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

## 🎯 K6 Integration

All K6 options are supported:

```yaml
k6Options:
  stages:
    - duration: "2m"
      target: 10
    - duration: "5m"
      target: 50
    - duration: "2m"
      target: 0
  
  thresholds:
    http_req_duration: ["p(95)<500", "p(99)<1000"]
    http_req_failed: ["rate<0.1"]
  
  scenarios:
    contacts:
      executor: "per-vu-iterations"
      vus: 10
      iterations: 200
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
