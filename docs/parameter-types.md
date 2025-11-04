# Parameter Types

Synapse supports multiple parameter types for dynamic URL construction and data generation.

## Integer Parameters

Generate random integers within a specified range:

```yaml
- name: "userId"
  type: "integer"
  min: 1
  max: 1000000
  length: 10  # pad with zeros
```

## String Parameters

Generate random strings with various character sets:

```yaml
- name: "sessionId"
  type: "string"
  length: 32
  charset: "alphanumeric"  # or "alpha", "numeric", "custom"
  customChars: "abcdef123456"  # only if charset is "custom"
```

## Array Parameters

Select random values from a predefined array:

```yaml
- name: "category"
  type: "array"
  values: ["electronics", "books", "clothing", "home"]
  unique: true  # optional: ensure no duplicates
```

## CSV Parameters

Load values from CSV files:

```yaml
- name: "region"
  type: "csv"
  file: "./data/regions.csv"
  column: "name"
```

## URL Parameters

Load and optionally encode URLs:

```yaml
- name: "encodedUrl"
  type: "url"
  file: "./data/urls.csv"
  column: "url"
  encoding: "base64"  # optional
```
