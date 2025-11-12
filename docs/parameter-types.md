# Parameter Types

Synapse supports multiple parameter types for dynamic URL construction and data generation. Each type serves specific testing scenarios.

## Integer Parameters

Generates random integers within a specified range for numeric IDs, pagination, or counters.

```yaml
- name: "userId"
  type: "integer"
  min: 1              # Minimum value (inclusive)
  max: 1000000        # Maximum value (inclusive)
  length: 10          # Optional: pad with leading zeros
```

**Field Details:**
- `min`: Smallest possible value (required)
- `max`: Largest possible value (required)
- `length`: Zero-pad to this length (optional)

**Examples:**
- `min: 1, max: 100` → generates `42`, `7`, `99`
- `min: 1, max: 100, length: 5` → generates `00042`, `00007`, `00099`

**Use Cases:**
- User IDs: `min: 1, max: 999999`
- Page numbers: `min: 1, max: 50`
- Product IDs: `min: 100000, max: 999999`

## String Parameters

Generates random strings with configurable character sets for tokens, session IDs, or random data.

```yaml
- name: "sessionId"
  type: "string"
  length: 32                    # String length (required)
  charset: "alphanumeric"       # Character set type
  customChars: "abcdef123456"   # Custom characters (if charset is "custom")
```

**Charset Options:**
- `"alpha"`: Letters only (a-z, A-Z) → `AbCdEfGh`
- `"numeric"`: Numbers only (0-9) → `12345678`
- `"alphanumeric"`: Letters + numbers → `A1b2C3d4`
- `"custom"`: Use `customChars` → `abc123ef`

**Examples:**
```yaml
# API key simulation
- name: "apiKey"
  type: "string"
  length: 40
  charset: "alphanumeric"

# Hex token
- name: "token"
  type: "string"
  length: 16
  charset: "custom"
  customChars: "0123456789abcdef"
```

## Array Parameters

Selects random values from a predefined list for categories, statuses, or fixed options.

```yaml
- name: "category"
  type: "array"
  values: ["electronics", "books", "clothing", "home"]
  unique: true          # Optional: prevent duplicates within test
```

**Field Details:**
- `values`: Array of possible values (required)
- `unique`: If true, each value used only once per test run (optional)

**Examples:**
```yaml
# Product categories
- name: "category"
  type: "array"
  values: ["electronics", "books", "clothing"]

# HTTP methods
- name: "method"
  type: "array"
  values: ["GET", "POST", "PUT", "DELETE"]

# Status filters
- name: "status"
  type: "array"
  values: ["active", "inactive", "pending"]
  unique: false  # Allow repeats
```

**Use Cases:**
- Testing different product categories
- Rotating through API endpoints
- Simulating user roles or permissions

## Static Parameters

Uses fixed values with smart auto-encoding for URLs and special characters. Perfect for API keys, fixed endpoints, or consistent test data.

```yaml
- name: "apiKey"
  type: "static"
  value: "your-api-key-here"

- name: "imageUrl"
  type: "static"
  value: "http://localhost:7900/generated-content/imagen.webp"

- name: "searchQuery"
  type: "static"
  value: "hello world & special chars!"
```

**Auto-Encoding Behavior:**
- URLs are automatically URL-encoded when needed
- Special characters (`&`, `!`, spaces, etc.) are encoded
- Simple strings (like API keys) remain unchanged
- No configuration required

**Examples:**
```yaml
# API key (no encoding needed)
- name: "apiKey"
  type: "static"
  value: "sk-1234567890abcdef"
# Result: sk-1234567890abcdef

# Complex URL (auto-encoded)
- name: "imageUrl"
  type: "static"
  value: "http://localhost:3000/api/test?param=value&other=data"
# Result: http%3A//localhost%3A3000/api/test%3Fparam%3Dvalue%26other%3Ddata

# Search query with special chars (auto-encoded)
- name: "query"
  type: "static"
  value: "cats & dogs"
# Result: cats%20%26%20dogs
```

**Use Cases:**
- Fixed API keys or tokens
- Consistent test image URLs
- Standard search queries
- Configuration values

## CSV Parameters

Loads values from CSV files for realistic data sets like user lists, search terms, or locations.

```yaml
- name: "region"
  type: "csv"
  file: "./data/regions.csv"    # Path to CSV file
  column: "name"                # Column name to use
```

**CSV File Example (`regions.csv`):**
```csv
id,name,code
1,North America,NA
2,Europe,EU
3,Asia Pacific,AP
```

**Field Details:**
- `file`: Path to CSV file (relative to config file)
- `column`: Column header name to extract values from

**Use Cases:**
- Real user data from database exports
- Geographic regions or cities
- Product names or SKUs
- Search terms from analytics

## URL Parameters

Loads URLs from CSV files with optional encoding for complex URL testing scenarios.

```yaml
- name: "encodedUrl"
  type: "url"
  file: "./data/urls.csv"
  column: "url"
  encoding: "base64"            # Optional: encoding type
```

**Encoding Options:**

### No Encoding (`encoding` omitted)
Raw URLs used as-is:
```
Input:  https://api.example.com/search?q=test data
Output: https://api.example.com/search?q=test data
```

### Base64 Encoding (`encoding: "base64"`)
URLs encoded in base64 format:
```
Input:  https://api.example.com/search?q=test
Output: aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20vc2VhcmNoP3E9dGVzdA==
```

### URI Encoding (`encoding: "uri"`)
URLs percent-encoded for safe transmission:
```
Input:  https://api.example.com/search?q=test data
Output: https%3A//api.example.com/search%3Fq%3Dtest%20data
```

**CSV File Example (`urls.csv`):**
```csv
id,url,description
1,https://api.example.com/users/123,Get user
2,https://api.example.com/products?category=books,Search books
3,https://api.example.com/orders/456/items,Get order items
```

**Encoding Impact:**

1. **No Encoding**: Direct URL testing
   - Use when: Testing standard REST APIs
   - Result: URLs used directly in requests

2. **Base64 Encoding**: Encoded payload testing
   - Use when: Testing APIs that accept base64-encoded URLs
   - Result: URLs converted to base64 strings
   - Common in: Webhook callbacks, URL shorteners

3. **URI Encoding**: Safe URL transmission
   - Use when: URLs passed as query parameters
   - Result: Special characters percent-encoded
   - Common in: Redirect URLs, embedded links

**Complete Example:**
```yaml
name: "URL Encoding Test"
baseUrl: "https://api.example.com/process"
execution:
  mode: "construct"
  concurrent: 5
  iterations: 20
parameters:
  - name: "callback"
    type: "url"
    file: "./data/callbacks.csv"
    column: "url"
    encoding: "uri"  # Encode for query parameter
```

This generates URLs like:
```
https://api.example.com/process?callback=https%3A//webhook.site/abc123
```
