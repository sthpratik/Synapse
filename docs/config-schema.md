# Synapse Configuration Schema

## Overview
Synapse uses YAML configuration files to define load testing scenarios. The configuration supports dynamic URL construction, parameter generation, and K6 test options.

## Configuration Structure

```yaml
# Basic test information
name: "My Load Test"
description: "Test description"

# Base URL configuration
baseUrl: "https://api.example.com"

# Test execution settings
execution:
  mode: "construct" # or "batch"
  concurrent: 10
  iterations: 100
  duration: "30s"

# K6 specific options
k6Options:
  stages:
    - duration: "2m"
      target: 10
    - duration: "5m"
      target: 50
    - duration: "2m"
      target: 0
  thresholds:
    http_req_duration: ["p(95)<500"]

# URL construction parameters
parameters:
  - name: "userId"
    type: "integer"
    min: 1
    max: 1000000
    length: 10
  
  - name: "sessionId"
    type: "string"
    length: 32
    charset: "alphanumeric"
  
  - name: "category"
    type: "array"
    values: ["electronics", "books", "clothing", "home"]
  
  - name: "status"
    type: "csv"
    file: "./data/statuses.csv"
    column: "name"
  
  - name: "url"
    type: "url"
    file: "./data/urls.csv"
    encoding: "base64"

# Batch mode configuration
batch:
  file: "./data/test-urls.csv"
  column: "url"

# HTTP request configuration
request:
  method: "GET"
  headers:
    "Content-Type": "application/json"
  body: |
    {
      "data": "test"
    }

# Comparison configuration (optional)
comparison:
  enabled: true
  type: "image"  # or "text"
  baseUrl2: "https://v2.api.example.com"
  threshold: 0.1
  timeout: 30000
  reportFormat: "csv"  # or "json"
```

## Comparison Configuration

### Image/Text Comparison
```yaml
comparison:
  enabled: true
  type: "image"                    # "image" or "text"
  baseUrl2: "https://v2.api.example.com"  # Second URL to compare
  threshold: 0.1                   # Image similarity threshold (0-1)
  timeout: 30000                   # Request timeout in milliseconds
  reportFormat: "csv"              # Report format: "csv" or "json"
```

**Comparison Fields:**
- `enabled`: Enable comparison mode (boolean, required)
- `type`: Comparison type - "image" or "text" (string, default: "image")
- `baseUrl2`: Second base URL for comparison (string, required)
- `threshold`: Image comparison threshold 0-1, lower = stricter (number, default: 0.1)
- `timeout`: Request timeout in milliseconds (number, default: 30000)
- `reportFormat`: Output format for reports (string, default: "csv")

## Parameter Types

### Integer Parameters
```yaml
- name: "userId"
  type: "integer"
  min: 1
  max: 1000000
  length: 10 # pad with zeros if needed
```

### String Parameters
```yaml
- name: "sessionId"
  type: "string"
  length: 32
  charset: "alphanumeric" # or "alpha", "numeric", "custom"
  customChars: "abcdef123456" # only if charset is "custom"
```

### Array Parameters
```yaml
- name: "category"
  type: "array"
  values: ["electronics", "books", "clothing", "home", "sports"]
  unique: true # optional: ensure no duplicates in single test run
```

### CSV Parameters
```yaml
- name: "region"
  type: "csv"
  file: "./data/regions.csv"
  column: "name"
  unique: true # ensure no duplicates in test run
```

### URL Parameters
```yaml
- name: "encodedUrl"
  type: "url"
  file: "./data/urls.csv"
  column: "url"
  encoding: "base64" # optional encoding
```

### Static Parameters
```yaml
- name: "apiKey"
  type: "static"
  value: "your-api-key-here"

- name: "imageUrl"
  type: "static"
  value: "http://localhost:7900/generated-content/imagen.webp"
```

## Example Configurations

### API Test with Array Parameters
```yaml
name: "Product API Test"
baseUrl: "https://api.shop.com/products"
execution:
  mode: "construct"
  concurrent: 10
  iterations: 100
parameters:
  - name: "category"
    type: "array"
    values: ["electronics", "books", "clothing", "home"]
  - name: "sort"
    type: "array"
    values: ["price_asc", "price_desc", "name", "rating"]
  - name: "limit"
    type: "integer"
    min: 10
    max: 50
k6Options:
  thresholds:
    http_req_duration: ["p(95)<300"]
```

### Mixed Parameter Types
```yaml
name: "Complex Search Test"
baseUrl: "https://api.example.com/search"
execution:
  mode: "construct"
  concurrent: 15
  duration: "3m"
parameters:
  - name: "query"
    type: "csv"
    file: "./data/search-terms.csv"
    column: "term"
  - name: "category"
    type: "array"
    values: ["all", "products", "articles", "users"]
  - name: "userId"
    type: "integer"
    min: 1000
    max: 999999
  - name: "sessionId"
    type: "string"
    length: 24
    charset: "alphanumeric"
```
