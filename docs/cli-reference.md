# CLI Reference

## Global Installation

```bash
npm install -g synapse
```

## Commands

### `synapse test`

Run simple load test without configuration file.

```bash
synapse test [options]
```

**Options:**
- `-u, --url <url>` - Target URL to test (required)
- `-c, --concurrent <number>` - Number of concurrent users (required)
- `-r, --requests <number>` - Total number of requests (required)
- `-o, --output <path>` - Output directory (default: ./output)
- `--dry-run` - Generate script without running
- `--keep-script` - Keep generated K6 script

**Examples:**
```bash
# Basic load test
synapse test --url "https://api.example.com" --concurrent 10 --requests 100

# With custom output directory
synapse test -u "https://api.example.com" -c 5 -r 50 -o ./results

# Dry run to see generated script
synapse test --url "https://api.example.com" --concurrent 10 --requests 100 --dry-run
```

### `synapse init`

Initialize a new Synapse configuration file.

```bash
synapse init [options]
```

**Options:**
- `--name <name>` - Test name
- `--url <url>` - Base URL for testing
- `--output <path>` - Output file path (default: synapse.yml)

**Example:**
```bash
synapse init --name "API Test" --url "https://api.example.com"
```

### `synapse run`

Run load test from configuration file.

```bash
synapse run [options]
```

**Options:**
- `-c, --config <path>` - Configuration file path (default: synapse.yml)
- `-o, --output <path>` - Output directory (default: ./output)
- `--dry-run` - Generate script without running
- `--keep-script` - Keep generated K6 script after execution
- `--compare` - Run comparison if enabled in config (opt-in)
- `--compare-only` - Generate URLs and run comparison only (skip load test)

**Examples:**
```bash
# Run with default config (load test only)
synapse run

# Run with comparison enabled
synapse run --compare

# Run only comparison (no load test)
synapse run --compare-only

# Dry run to see generated script
synapse run --dry-run

# Dry run with comparison
synapse run --compare --dry-run

# Keep generated script
synapse run --keep-script
```

### `synapse validate`

Validate configuration file syntax and schema.

```bash
synapse validate [options]
```

**Options:**
- `-c, --config <path>` - Configuration file path (default: synapse.yml)

**Example:**
```bash
synapse validate -c my-test.yml
```

### `synapse generate`

Generate K6 script without running the test.

```bash
synapse generate [options]
```

**Options:**
- `-c, --config <path>` - Configuration file path (default: synapse.yml)
- `-o, --output <path>` - Output script path (default: test.js)

**Example:**
```bash
synapse generate -c my-test.yml -o my-test.js
```

### `synapse compare`

Compare images or text content from CSV file.

```bash
synapse compare [options]
```

**Options:**
- `-f, --file <path>` - CSV file with URLs to compare (required)
- `-c1, --column1 <name>` - First URL column name (default: url1)
- `-c2, --column2 <name>` - Second URL column name (default: url2)
- `-t, --type <type>` - Comparison type: image or text (default: image)
- `-o, --output <path>` - Output directory (default: ./output)
- `--timeout <ms>` - Request timeout in milliseconds (default: 30000)
- `--threshold <value>` - Image comparison threshold 0-1 (default: 0.1)

**Examples:**
```bash
# Basic image comparison
synapse compare --file urls.csv --type image

# Text comparison with custom columns
synapse compare -f endpoints.csv -t text -c1 v1_url -c2 v2_url

# Strict image comparison with custom threshold
synapse compare --file images.csv --type image --threshold 0.05

# With custom timeout and output directory
synapse compare -f urls.csv --timeout 60000 -o ./comparison-results
```

**CSV Format:**
```csv
url1,url2
https://v1.api.com/image/1,https://v2.api.com/image/1
https://v1.api.com/image/2,https://v2.api.com/image/2
```

## Global Options

All commands support these global options:

- `--help` - Show help information
- `--version` - Show version number

## Exit Codes

- `0` - Success
- `1` - Configuration error
- `2` - Validation error
- `3` - Execution error
