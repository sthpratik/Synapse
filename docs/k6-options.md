# K6 Options Reference

Synapse supports all K6 configuration options through the `k6Options` section. These options control test execution, performance thresholds, and advanced scenarios.

## Basic Execution Options

```yaml
k6Options:
  # Simple load test
  vus: 10              # Virtual users (concurrent connections)
  duration: "30s"      # Test duration
  iterations: 100      # Total number of iterations
```

## 📊 Thresholds - Performance Requirements

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

### Threshold Operators
- `<` - Less than
- `<=` - Less than or equal
- `>` - Greater than  
- `>=` - Greater than or equal
- `==` - Equal to
- `!=` - Not equal to

### Statistical Functions
- `avg` - Average value
- `min` - Minimum value
- `max` - Maximum value
- `med` - Median (50th percentile)
- `p(90)` - 90th percentile
- `p(95)` - 95th percentile
- `p(99)` - 99th percentile
- `rate` - Rate (for counters)
- `count` - Total count

## 🎭 Scenarios - Advanced Test Patterns

### Per-VU Iterations
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

### Shared Iterations
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

### Constant VUs
Fixed number of VUs for a duration:

```yaml
k6Options:
  scenarios:
    steady_load:
      executor: "constant-vus"
      vus: 50
      duration: "5m"
```

### Ramping VUs
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

### Constant Arrival Rate
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

### Ramping Arrival Rate
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

## 🔧 Advanced Options

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

## 📈 Complete Example

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

## 🚨 Common Threshold Patterns

### API Performance
```yaml
thresholds:
  http_req_duration: ["p(95)<200", "p(99)<500"]
  http_req_failed: ["rate<0.01"]
```

### High Throughput
```yaml
thresholds:
  http_reqs: ["rate>1000"]
  http_req_duration: ["p(95)<100"]
```

### Reliability Focus
```yaml
thresholds:
  http_req_failed: ["rate<0.001"]  # 99.9% success rate
  checks: ["rate>0.999"]
```
