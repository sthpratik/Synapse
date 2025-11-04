# API Reference

## Configuration Schema

### Root Configuration

```typescript
interface SynapseConfig {
  name: string;
  baseUrl?: string;
  execution: ExecutionConfig;
  parameters?: Parameter[];
  batch?: BatchConfig;
  k6Options?: K6Options;
}
```

### Execution Configuration

```typescript
interface ExecutionConfig {
  mode: 'construct' | 'batch';
  concurrent: number;
  iterations?: number;
  duration?: string;
}
```

### Parameter Types

#### Integer Parameter
```typescript
interface IntegerParameter {
  name: string;
  type: 'integer';
  min: number;
  max: number;
  length?: number;
}
```

#### String Parameter
```typescript
interface StringParameter {
  name: string;
  type: 'string';
  length: number;
  charset: 'alpha' | 'numeric' | 'alphanumeric' | 'custom';
  customChars?: string;
}
```

#### Array Parameter
```typescript
interface ArrayParameter {
  name: string;
  type: 'array';
  values: string[];
  unique?: boolean;
}
```

#### CSV Parameter
```typescript
interface CSVParameter {
  name: string;
  type: 'csv';
  file: string;
  column: string;
}
```

#### URL Parameter
```typescript
interface URLParameter {
  name: string;
  type: 'url';
  file: string;
  column: string;
  encoding?: 'base64' | 'uri';
}
```

### Batch Configuration

```typescript
interface BatchConfig {
  file: string;
  column: string;
}
```

### K6 Options

```typescript
interface K6Options {
  stages?: Stage[];
  thresholds?: Record<string, string[]>;
  scenarios?: Record<string, Scenario>;
  [key: string]: any;
}
```

## Generator Classes

### ParameterGenerator

Base class for all parameter generators.

```typescript
abstract class ParameterGenerator {
  abstract generate(): string;
}
```

### K6ScriptGenerator

Generates K6 JavaScript from configuration.

```typescript
class K6ScriptGenerator {
  constructor(config: SynapseConfig);
  generate(): string;
}
```

## Validation

### ConfigValidator

Validates configuration using Joi schema.

```typescript
class ConfigValidator {
  static validate(config: any): ValidationResult;
}
```

## Error Types

```typescript
interface ValidationError {
  message: string;
  path: string[];
  type: string;
}

interface ExecutionError {
  message: string;
  code: number;
  stdout?: string;
  stderr?: string;
}
```
