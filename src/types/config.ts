export interface SynapseConfig {
  name: string;
  description?: string;
  baseUrl: string;
  execution: ExecutionConfig;
  k6Options?: K6Options;
  parameters?: Parameter[];
  batch?: BatchConfig;
  request?: RequestConfig;
  output?: OutputConfig;
  comparison?: ComparisonConfig;
}

export interface ComparisonConfig {
  enabled: boolean;
  type: 'image' | 'text';
  baseUrl2: string;
  timeout?: number;
  threshold?: number;
  reportFormat?: 'csv' | 'json';
}

export interface ExecutionConfig {
  mode: 'construct' | 'batch';
  concurrent?: number;
  iterations?: number;
  duration?: string;
}

export interface K6Options {
  stages?: Stage[];
  thresholds?: Record<string, string[]>;
  scenarios?: Record<string, any>;
  [key: string]: any;
}

export interface Stage {
  duration: string;
  target: number;
}

export interface Parameter {
  name: string;
  type: 'integer' | 'string' | 'array' | 'csv' | 'url' | 'static';
  // Integer specific
  min?: number;
  max?: number;
  length?: number;
  // String specific
  charset?: 'alphanumeric' | 'alpha' | 'numeric' | 'custom';
  customChars?: string;
  // Array specific
  values?: (string | number)[];
  // CSV/URL specific
  file?: string;
  column?: string;
  encoding?: 'base64';
  // Static specific
  value?: string | number;
  // Common
  unique?: boolean;
}

export interface BatchConfig {
  file: string;
  column: string;
}

export interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface OutputConfig {
  format?: 'json' | 'influxdb' | 'cloud';
  file?: string;
}

export interface GeneratedParameter {
  name: string;
  value: string | number;
}

export interface TestContext {
  config: SynapseConfig;
  parameters: GeneratedParameter[];
  urls: string[];
}
