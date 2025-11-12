# Image & Text Comparison

Synapse provides powerful comparison capabilities to test different versions of your applications, compare API responses, or validate content consistency across environments.

## Overview

The comparison feature supports two modes:
- **Load Test Comparison** - Compare responses during load testing
- **Standalone Comparison** - Direct comparison from CSV files

## Comparison Types

### Image Comparison
Uses pixelmatch for pixel-perfect image comparison with configurable thresholds.

### Text Comparison
Performs exact text matching for API responses or content validation.

## Configuration

### Load Test Comparison

Add comparison configuration to your `synapse.yml`:

```yaml
name: "Version Comparison Test"
baseUrl: "https://v1.api.example.com"
execution:
  mode: "construct"
  concurrent: 10
  iterations: 100
parameters:
  - name: "userId"
    type: "integer"
    min: 1000
    max: 9999
comparison:
  enabled: true
  type: "image"              # or "text"
  baseUrl2: "https://v2.api.example.com"
  threshold: 0.1             # Image similarity threshold (0-1)
  timeout: 30000             # Request timeout in ms
  reportFormat: "csv"        # or "json"
```

### Comparison Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | boolean | false | Enable comparison mode |
| `type` | string | "image" | Comparison type: "image" or "text" |
| `baseUrl2` | string | required | Second URL to compare against |
| `threshold` | number | 0.1 | Image comparison threshold (0-1) |
| `timeout` | number | 30000 | Request timeout in milliseconds |
| `reportFormat` | string | "csv" | Report format: "csv" or "json" |

## CLI Commands

### Load Test with Comparison

```bash
# Default: Load test only (comparison ignored)
synapse run

# Opt-in to comparison
synapse run --compare

# Comparison only (no load test, generates URLs dynamically)
synapse run --compare-only
```

**Behavior:**
- **Default**: `synapse run` ignores comparison config, runs load test only
- **Opt-in**: `synapse run --compare` runs load test + comparison if enabled in config
- **Comparison-only**: `synapse run --compare-only` generates URLs dynamically and compares (no K6)

### Standalone Comparison

```bash
synapse compare --file urls.csv --type image --output ./results
```

#### Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--file` | `-f` | required | CSV file with URLs to compare |
| `--column1` | `-c1` | "url1" | First URL column name |
| `--column2` | `-c2` | "url2" | Second URL column name |
| `--type` | `-t` | "image" | Comparison type: image or text |
| `--output` | `-o` | "./output" | Output directory |
| `--timeout` | | 30000 | Request timeout in milliseconds |
| `--threshold` | | 0.1 | Image comparison threshold (0-1) |

## CSV Format

Your CSV file should contain at least two columns with URLs:

```csv
url1,url2
https://v1.api.com/image/1,https://v2.api.com/image/1
https://v1.api.com/image/2,https://v2.api.com/image/2
https://v1.api.com/text/1,https://v2.api.com/text/1
```

## Reports

Synapse generates multiple output files for comprehensive analysis. See [Output Files](output-files.md) for detailed column descriptions.

### Generated Files

| File | Purpose | Key Columns |
|------|---------|-------------|
| `basic-comparison-{date}.csv` | K6 load test results | ResponseTime, Status codes, SizeMatch |
| `detailed-comparison-{timestamp}.csv` | **Pixelmatch analysis** | **Pixelmatch_Similarity%**, DiffPixels, Image dimensions |
| `comparison-summary-{timestamp}.json` | Statistical summary | Success rates, average similarity |
| `results.json` | K6 performance metrics | HTTP timings, throughput |

### Key Metrics

- **`Pixelmatch_Similarity%`** - Most accurate image comparison score (0-100%)
- **`Pixelmatch_DiffPixels`** - Exact number of different pixels
- **`LoadTest_ResponseTime`** - Performance under load
- **`Image_Width/Height`** - Actual decoded image dimensions

For complete column descriptions and usage examples, see [Output Files Documentation](output-files.md).

## Examples

### Image Comparison Example

```yaml
name: "Image API Comparison"
baseUrl: "https://v1.imageapi.com/generate"
execution:
  mode: "construct"
  concurrent: 5
  iterations: 50
parameters:
  - name: "prompt"
    type: "array"
    values: ["cat", "dog", "landscape"]
  - name: "size"
    type: "static"
    value: "512x512"
comparison:
  enabled: true
  type: "image"
  baseUrl2: "https://v2.imageapi.com/generate"
  threshold: 0.05  # Very strict comparison
  timeout: 60000   # Longer timeout for image generation
```

### Comparison-Only Mode

Generate URLs dynamically and compare without load testing:

```yaml
name: "Image Comparison Only"
baseUrl: "https://v1.api.com/generate"
execution:
  iterations: 50  # Will generate 50 URL pairs
parameters:
  - name: "prompt"
    type: "array"
    values: ["cat", "dog", "landscape"]
comparison:
  enabled: true
  type: "image"
  baseUrl2: "https://v2.api.com/generate"
```

```bash
synapse run --compare-only
```

**What happens:**
1. Generates 50 URL pairs using parameters
2. Downloads and compares images directly
3. Creates detailed CSV report
4. No K6 load testing overhead

### Text API Comparison

```yaml
name: "Text API Comparison"
baseUrl: "https://v1.textapi.com/summarize"
execution:
  mode: "construct"
  concurrent: 10
  iterations: 100
parameters:
  - name: "text"
    type: "csv"
    file: "./data/articles.csv"
    column: "content"
comparison:
  enabled: true
  type: "text"
  baseUrl2: "https://v2.textapi.com/summarize"
  timeout: 30000
```

### Standalone CSV Comparison

```bash
# Compare images from CSV
synapse compare \
  --file image-urls.csv \
  --type image \
  --column1 original \
  --column2 optimized \
  --threshold 0.1 \
  --output ./comparison-results

# Compare text responses
synapse compare \
  --file api-endpoints.csv \
  --type text \
  --column1 v1_url \
  --column2 v2_url \
  --timeout 15000
```

## Error Handling

Common errors and solutions:

### Image Dimension Mismatch
```
Error: Image dimensions mismatch
```
**Solution**: Ensure both images have the same dimensions, or resize them before comparison.

### Timeout Errors
```
Error: Timeout
```
**Solution**: Increase timeout value or check network connectivity.

### Invalid Image Format
```
Error: Image processing failed
```
**Solution**: Ensure URLs return valid PNG/JPEG images.

## Performance Considerations

- **Image Size**: Larger images take more time to compare
- **Threshold**: Lower thresholds (stricter comparison) are slower
- **Concurrent Requests**: Balance concurrency with server capacity
- **Network**: Consider network latency for remote comparisons

## Best Practices

1. **Start with small batches** to validate configuration
2. **Use appropriate thresholds** - 0.1 for strict, 0.3 for loose comparison
3. **Set realistic timeouts** based on your API response times
4. **Monitor server load** when comparing many images
5. **Use dry-run mode** to validate configuration before full tests

## Integration with CI/CD

```bash
# Example CI script
#!/bin/bash
synapse compare --file regression-tests.csv --type image --output ./results
if [ $? -eq 0 ]; then
  echo "Visual regression tests passed"
else
  echo "Visual regression tests failed"
  exit 1
fi
```
