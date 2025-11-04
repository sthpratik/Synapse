# Examples

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
