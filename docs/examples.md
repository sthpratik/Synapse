# Examples

## Quick Test (No Configuration)

For immediate testing without creating YAML files:

```bash
# Basic load test
synapse test --url "https://api.example.com/users" --concurrent 5 --requests 50

# Higher load test
synapse test --url "https://api.example.com" --concurrent 20 --requests 500

# Test with dry run
synapse test --url "https://httpbin.org/get" --concurrent 10 --requests 100 --dry-run
```

## Basic API Test

```yaml
name: "Basic API Test"
baseUrl: "https://api.example.com/users"
execution:
  mode: "construct"
  concurrent: 5
  iterations: 50
parameters:
  - name: "userId"
    type: "integer"
    min: 1
    max: 1000
```

## E-commerce Load Test

```yaml
name: "E-commerce Load Test"
baseUrl: "https://shop.example.com/products"
execution:
  mode: "construct"
  concurrent: 20
  duration: "5m"
parameters:
  - name: "category"
    type: "array"
    values: ["electronics", "books", "clothing"]
  - name: "page"
    type: "integer"
    min: 1
    max: 10
k6Options:
  stages:
    - duration: "1m"
      target: 10
    - duration: "3m"
      target: 20
    - duration: "1m"
      target: 0
```

## CSV Data Test

```yaml
name: "CSV Data Test"
baseUrl: "https://api.example.com/search"
execution:
  mode: "construct"
  concurrent: 10
  iterations: 100
parameters:
  - name: "query"
    type: "csv"
    file: "./data/search-terms.csv"
    column: "term"
```

## Batch URL Test

```yaml
name: "Batch URL Test"
execution:
  mode: "batch"
  concurrent: 15
  duration: "2m"
batch:
  file: "./data/urls.csv"
  column: "url"
k6Options:
  thresholds:
    http_req_duration: ["p(95)<500"]
    http_req_failed: ["rate<0.1"]
```

## Image Comparison Load Test

Compare image generation between two API versions:

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
    values: ["cat", "dog", "landscape", "portrait", "abstract"]
  - name: "size"
    type: "static"
    value: "512x512"
  - name: "style"
    type: "array"
    values: ["realistic", "cartoon", "artistic"]
comparison:
  enabled: true
  type: "image"
  baseUrl2: "https://v2.imageapi.com/generate"
  threshold: 0.1
  timeout: 60000
k6Options:
  thresholds:
    http_req_duration: ["p(95)<30000"]  # 30 second threshold for image generation
    http_req_failed: ["rate<0.05"]
```

**Usage:**
```bash
# Load test only
synapse run

# Load test + comparison
synapse run --compare

# Comparison only (no load test)
synapse run --compare-only
```

## Text API Comparison

Compare text processing between different versions:

```yaml
name: "Text Processing Comparison"
baseUrl: "https://v1.textapi.com/analyze"
execution:
  mode: "construct"
  concurrent: 10
  iterations: 100
parameters:
  - name: "text"
    type: "csv"
    file: "./data/sample-texts.csv"
    column: "content"
  - name: "language"
    type: "array"
    values: ["en", "es", "fr", "de"]
comparison:
  enabled: true
  type: "text"
  baseUrl2: "https://v2.textapi.com/analyze"
  timeout: 15000
request:
  method: "POST"
  headers:
    "Content-Type": "application/json"
    "API-Key": "your-api-key"
```

## Standalone Comparison Examples

### Image Comparison from CSV

```bash
# Basic image comparison
synapse compare --file image-urls.csv --type image

# Strict comparison with custom threshold
synapse compare --file images.csv --type image --threshold 0.05 --output ./results
```

**CSV format (image-urls.csv):**
```csv
url1,url2
https://v1.api.com/image/cat,https://v2.api.com/image/cat
https://v1.api.com/image/dog,https://v2.api.com/image/dog
```

### Text Comparison from CSV

```bash
# Text comparison with custom columns
synapse compare -f api-responses.csv -t text -c1 old_api -c2 new_api
```

**CSV format (api-responses.csv):**
```csv
old_api,new_api
https://v1.api.com/summary/1,https://v2.api.com/summary/1
https://v1.api.com/summary/2,https://v2.api.com/summary/2
```
