# CLI Reference

## Global Installation

```bash
npm install -g synapse
```

## Commands

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

**Examples:**
```bash
# Run with default config
synapse run

# Run with custom config
synapse run -c my-test.yml

# Dry run to see generated script
synapse run --dry-run

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

## Global Options

All commands support these global options:

- `--help` - Show help information
- `--version` - Show version number

## Exit Codes

- `0` - Success
- `1` - Configuration error
- `2` - Validation error
- `3` - Execution error
